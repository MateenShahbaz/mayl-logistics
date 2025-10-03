const response = require("../../../response");
const orderModel = require("../../orders/models/order.model");
const onRouteModel = require("../models/onRoute.model");
const historyModel = require("../../shippmentArrives/models/trackHistory.model");

async function generateSheetNumber(courierId) {
  const count = await onRouteModel.countDocuments({ type: "delivery" });
  const nextNumber = (count + 1).toString().padStart(3, "0");
  return `LHR-${courierId}-FWD-${nextNumber}`;
}

exports.fetchingOrder = async (req, res) => {
  try {
    const { trackingNo } = req.body;

    const order = await orderModel.findOne({ orderNumber: trackingNo });
    if (!order) {
      return response.data_error_message({ message: "Order not found" }, res);
    }

    if (order.status !== "arrived") {
      return response.data_error_message(
        {
          message: "Shipment can only OnRoute if order is arrive or reattempt",
        },
        res
      );
    }

    const data = {
      _id: order._id,
      orderNumber: order?.orderNumber,
      customer: order?.customer,
      merchant: order?.merchant,
      actualWeight: order?.actualWeight,
      amount: order?.amount,
      refNumber: order?.refNumber,
      items: order?.items,
    };

    response.success_message(data, res);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message);
  }
};

exports.addDevlivery = async (req, res) => {
  try {
    const { type, courierId, orders } = req.body;
    const userId = req.user.id;

    const sheetNumber = await generateSheetNumber(courierId);
    const onRouteSheet = await onRouteModel.create({
      sheetNumber,
      orders,
      branch: "LHE",
      type,
      courierId,
      userId,
      status: "new",
    });

    const foundOrders = await orderModel.find({ _id: { $in: orders } });

    const histories = foundOrders.map((order) => ({
      orderId: order._id,
      previousStatus: order.status,
      newStatus: "out for delivery",
      message: "Parcel out for delivery",
      courierId,
      createdBy: userId,
      visibleToShipper: true,
      isDelete: false,
      isForward: true,
    }));

    await historyModel.insertMany(histories);

    await orderModel.updateMany(
      { _id: { $in: orders } },
      { $set: { status: "out for delivery" } }
    );

    const data = {
      sheetNumber: onRouteSheet.sheetNumber,
      createdAt: onRouteSheet.createdAt,
    };
    response.success_message(data, res);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message);
  }
};

exports.list = async (req, res) => {
  try {
    const {
      limit = 10,
      skip = 0,
      type,
      startDate,
      endDate,
      search,
      searchType,
    } = req.query;

    let query = {};

    if (type) {
      query.type = type;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lt: new Date(
          new Date(endDate).setDate(new Date(endDate).getDate() + 1)
        ),
      };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdAt = {
        $lt: new Date(
          new Date(endDate).setDate(new Date(endDate).getDate() + 1)
        ),
      };
    }

    if (search && searchType) {
      switch (searchType) {
        case "sheet no":
          query.sheetNumber = { $regex: search, $options: "i" };
          break;
        case "courier id":
          query.courierId = { $regex: search, $options: "i" };
          break;
      }
    }

    const lists = await onRouteModel
      .find(query)
      .select("sheetNumber type courierId orders createdAt status")
      .limit(Number(limit))
      .skip(Number(skip))
      .lean();

    const listCount = await onRouteModel.countDocuments();

    response.success_message(lists, res, listCount);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message);
  }
};

exports.outForDeliveryList = async (req, res) => {
  try {
    const { selectDate, search, searchType } = req.query;
    let query = {
      type: "delivery",
    };

    if (search && searchType) {
      switch (searchType) {
        case "sheet no":
          query.sheetNumber = { $regex: search, $options: "i" };
          break;
        case "courier id":
          query.courierId = { $regex: search, $options: "i" };
          break;
      }
    }

    if (selectDate) {
      const start = new Date(`${selectDate}T00:00:00.000Z`);
      const end = new Date(`${selectDate}T23:59:59.999Z`);

      query.createdAt = { $gte: start, $lte: end };
    }

    const lists = await onRouteModel
      .find(query)
      .select("sheetNumber type courierId orders createdAt status")
      .lean();

    response.success_message(lists, res);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message);
  }
};

exports.view = async (req, res) => {
  try {
    const { id } = req.params;
    const onRoute = await onRouteModel
      .findById(id)
      .populate(
        "orders",
        "orderNumber orderType merchant refNumber amount customer status"
      )
      .lean();

    response.success_message(onRoute, res);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message);
  }
};

exports.updateOrderStatuses = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderUpdates } = req.body;
    const user = req.user;
        
    if (!Array.isArray(orderUpdates)) {
      return response.data_error_message({ message: "Invalid payload" }, res);
    }

    for (let update of orderUpdates) {
      if (!update.status) continue;

      const order = await orderModel.findById(update.orderId);
      if (!order) continue;

      const prevStatus = order.status;

      // ====== Status Mapping ======
      let newStatus = update.status;
      let message = "";
      let isForward = true;

      switch (update.status) {
        case "delivered":
          newStatus = "delivered";
          message = "parcel is delivered";
          break;

        case "returned":
          newStatus = "returned";
          message = "parcel is delivered";
          // isForward = false;
          break;

        case "shipper advice":
          newStatus = "delivery underreview";
          message = "delivery is under review";
          break;

        case "cna":
          newStatus = "attempted";
          message = "Attempt made : (consignee not available)";
          break;

        case "cne":
          newStatus = "attempted";
          message = "Attempt made : (connection not established)";
          break;

        case "ica":
          newStatus = "attempted";
          message = "Attempt made : (incomplete address)";
          break;

        default:
          newStatus = update.status;
          message = "";
      }

      await orderModel.findByIdAndUpdate(update.orderId, { status: newStatus });

      const history = new historyModel({
        orderId: update.orderId,
        previousStatus: prevStatus,
        newStatus: newStatus,
        message: message,
        courierId: "",
        visibleToShipper: true,
        isForward: isForward,
        createdBy: user?.id,
        isDelete: false,
      });
      await history.save();
    }

    const onRoute = await onRouteModel.findById(id);
    onRoute.status = "close";
    await onRoute.save();

    response.success_message({ message: "Orders statuses is changeded" }, res);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message);
  }
};
