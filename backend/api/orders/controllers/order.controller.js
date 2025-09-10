const orderModel = require("../models/order.model");
const response = require("../../../response");
const addressModel = require("../../address/models/address.model");
const userModel = require("../../auth/models/auth.model");
exports.add = async (req, res) => {
  try {
    const { shipperNumber, id } = req.user;

    if (
      !req.body.orderType ||
      !req.body.shipperInfo.pickupAddress ||
      !req.body.shipperInfo.returnAddress
    ) {
      return response.validation_error_message(
        { message: "Missing field required" },
        res
      );
    }
    const lastOrder = await orderModel
      .findOne({ userId: id })
      .sort({ createdAt: -1 })
      .select("orderNumber");

    let sequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastSeq = parseInt(lastOrder.orderNumber.slice(-7), 10);
      sequence = lastSeq + 1;
    }

    const paddedSeq = String(sequence).padStart(7, "0");
    const orderNumber = `${shipperNumber}${paddedSeq}`;

    const newOrder = await orderModel.create({
      ...req.body,
      orderNumber,
      merchant: req.user?.merchant,
      status: "Unbooked",
      userId: id,
    });

    response.success_message(newOrder, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

exports.list = async (req, res) => {
  try {
    const { limit = 5, skip = 0 } = req.query;

    const orders = await orderModel
      .find({
        userId: req.user.id,
      })
      .select("orderNumber orderType refNumber amount items weight status")
      .limit(Number(limit))
      .skip(Number(skip));

    const orderCount = await orderModel.countDocuments({ userId: req.user.id });

    response.success_message(orders, res, orderCount);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

exports.view = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return response.validation_error_message(
        { message: "Id is required" },
        res
      );
    }
    const order = await orderModel.findById(id);

    response.success_message(order, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

exports.edit = async (req, res) => {
  try {
    const { id } = req.params;
    if (
      !req.body.orderType ||
      !req.body.shipperInfo?.pickupAddress ||
      !req.body.shipperInfo?.returnAddress
    ) {
      return response.validation_error_message(
        { message: "Missing required fields" },
        res
      );
    }

    const order = await orderModel.findOne({ _id: id, userId: req.user.id });

    if (!order) {
      return response.data_error_message({ message: "Order not found" }, res);
    }

    Object.assign(order, req.body);

    await order.save();

    response.success_message(order, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

exports.trackOrder = async (req, res) => {
  try {
    const { tackingNo } = req.params;

    if (!tackingNo) {
      return response.validation_error_message(
        { message: "Tracking number is required" },
        res
      );
    }
    const order = await orderModel.findOne({ orderNumber: tackingNo });

    if (!order) {
      return response.data_error_message(
        {
          message: "Tracked Order not found",
        },
        res
      );
    }

    response.success_message(order._id, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

exports.excelUpload = async (req, res) => {
  try {
    const { shipperNumber, id } = req.user;
    const user = await userModel.findById(id);
    const request = req.body;

    // Ensure pickup & return exist
    const defaultPickup = await addressModel.findOne({
      default: true,
      userId: id,
      type: "pickup",
    });
    if (!defaultPickup) {
      return response.data_error_message({
        message: "Kindly make sure you have default pickup address",
      });
    }

    const defaultReturn = await addressModel.findOne({
      default: true,
      userId: id,
      type: "return",
    });
    if (!defaultReturn) {
      return response.data_error_message({
        message: "Kindly make sure you have default return address",
      });
    }

    // Get last sequence
    const lastOrder = await orderModel
      .findOne({ userId: id })
      .sort({ createdAt: -1 })
      .select("orderNumber");

    let sequence = 1;
    if (lastOrder && lastOrder.orderNumber) {
      const lastSeq = parseInt(lastOrder.orderNumber.slice(-7), 10);
      sequence = lastSeq + 1;
    }

    const allowedTypes = ["normal", "reverse", "replacement", "overland"];
    const ordersToInsert = [];

    for (let row of request) {
      const paddedSeq = String(sequence).padStart(7, "0");
      const orderNumber = `${shipperNumber}${paddedSeq}`;
      sequence++;

      let orderType = row["Order Type"];
      const orderData = {
        orderNumber,
        orderType: orderType.toLowerCase(),
        merchant: user?.merchant,
        refNumber: row["Order Reference Number"],
        amount: Number(row["Order Amount"]),
        airwayBillsCopy: Number(row["Airway Bill Copies"]),
        items: Number(row["Items"]),
        weight: Number(row["Booking Weight"] || 0),
        customer: {
          name: row["Customer Name"],
          contactNumber: row["Customer Phone"],
          deliverCity: "Lahore",
          deliveryAddress: row["Order Address"],
        },
        shipperInfo: {
          pickupCity: "Lahore",
          pickupAddress: defaultPickup.address,
          returnCity: "Lahore",
          returnAddress: defaultReturn.address,
          mobile: user.phoneNo,
        },
        orderDetail: row["Order Detail"] || "",
        notes: row["Notes"] || "",
        status: "Unbooked",
        userId: id,
      };

      ordersToInsert.push(orderData);
    }

    // Insert into DB
    const createdOrders = await orderModel.insertMany(ordersToInsert);

    return response.success_message(createdOrders, res);
  } catch (error) {
    console.log("Excel Upload Error:", error.message);
    return response.error_message(error.message, res);
  }
};
