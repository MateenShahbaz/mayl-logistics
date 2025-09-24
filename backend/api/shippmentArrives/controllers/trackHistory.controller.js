const response = require("../../../response");
const orderModel = require("../../orders/models/order.model");
const loadSheetModel = require("../../loadSheet/models/loadSheet.model");
const orderHistoryModel = require("../models/trackHistory.model");

exports.shippmentArrives = async (req, res) => {
  try {
    const { courierId, trackingNo, weight } = req.body;

    const order = await orderModel.findOne({ orderNumber: trackingNo });
    if (!order) {
      return response.data_error_message({ message: "Order not found" }, res);
    }

    if (order.status !== "unbooked" && order.status !== "booked") {
      return response.data_error_message(
        { message: "Shipment can only arrive if order is booked or unbooked" },
        res
      );
    }

    const loadSheet = await loadSheetModel.findOne({
      "orders.orderId": order._id,
    });

    let lsOrder;
    if (loadSheet) {
      lsOrder = loadSheet.orders.find(
        (o) => o.orderId.toString() === order._id.toString()
      );

      if (lsOrder && lsOrder.status === "picked") {
        return response.data_error_message(
          { message: "Order already picked" },
          res
        );
      }
    }

    const previousStatus = order.status;

    order.status = "arrived";
    order.actualWeight = weight;

    if (lsOrder) {
      lsOrder.status = "picked";
      await loadSheet.save();
    }

    await order.save();

    await orderHistoryModel.create({
      orderId: order._id,
      previousStatus,
      newStatus: "shipment arrive",
      message: "Parcel arrived at Mayl Logistics warehouse",
      courierId,
      visibleToShipper: true,
      isDelete: false,
    });

    const data = {
      _id: order._id,
      orderNumber: order?.orderNumber,
      customer: order?.customer,
      merchant: order?.merchant,
      actualWeight: order?.actualWeight,
      loadSheetStatus: lsOrder ? lsOrder.status : null,
    };

    response.success_message(data, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

exports.deleteShipmentArrives = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await orderModel.findById(id);
    if (!order) {
      return response.data_error_message({ message: "Order not found" }, res);
    }

    if (order.status !== "arrived") {
      return response.data_error_message(
        { message: "Order is not in 'arrived' state to delete" },
        res
      );
    }

    const lastHistory = await orderHistoryModel
      .findOne({
        orderId: order._id,
        newStatus: "shipment arrive",
        isDelete: false,
      })
      .sort({ createdAt: -1 });

    if (!lastHistory) {
      return response.data_error_message(
        { message: "No active shipment arrival history found" },
        res
      );
    }

    // revert order status
    order.status = lastHistory.previousStatus || "booked";
    order.actualWeight = 0;

    // check if order exists in a loadSheet
    const loadSheet = await loadSheetModel.findOne({
      "orders.orderId": order._id,
    });

    if (loadSheet) {
      const lsOrder = loadSheet.orders.find(
        (o) => o.orderId.toString() === order._id.toString()
      );

      if (lsOrder && lsOrder.status === "picked") {
        lsOrder.status = "unpicked";
        await loadSheet.save();
      }
    }

    await order.save();

    // mark last history as deleted
    lastHistory.isDelete = true;
    await lastHistory.save();

    // create new history for deletion
    await orderHistoryModel.create({
      orderId: order._id,
      previousStatus: "arrived",
      newStatus: "shipment deleted",
      message: "Shipment arrival was deleted by admin",
      courierId: "",
      visibleToShipper: false,
      isDelete: false,
    });

    response.success_message(
      { message: "Shipment arrival deleted successfully" },
      res
    );
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

exports.trackOrderHistory = async (req, res) => {
  try {
    const { trackingNo } = req.body;

    const order = await orderModel.findOne({ orderNumber: trackingNo }).lean();
    if (!order) {
      return response.data_error_message({ message: "Order not found" }, res);
    }

    const history = await orderHistoryModel.find({ orderId: order._id }).lean();

    const data = {
      ...order,
      history: history.map((h) => ({
        id: h._id,
        previousStatus: h.previousStatus,
        newStatus: h.newStatus,
        message: h.message,
        courierId: h.courierId,
        visibleToShipper: h.visibleToShipper,
        createdAt: h.createdAt,
        isDelete: h.isDelete,
      })),
    };

    return response.success_message(data, res);
  } catch (error) {
    console.error("Error tracking order history:", error.message);
    return response.error_message(error.message, res);
  }
};

exports.getArrivedByCourierAndDate = async (req, res) => {
  try {
    const { date, courierId } = req.body;

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const histories = await orderHistoryModel
      .find({
        courierId,
        newStatus: "shipment arrive",
        createdAt: { $gte: startOfDay, $lte: endOfDay },
        isDelete: false,
      })
      .populate({
        path: "orderId",
        populate: [{ path: "customer" }, { path: "merchant" }],
      });

    if (!histories.length) {
      return response.data_error_message(
        { message: "No shipments found for this courier on given date" },
        res
      );
    }

    const data = histories.map((h) => ({
      _id: h.orderId._id,
      orderNumber: h.orderId.orderNumber,
      customer: h.orderId.customer,
      merchant: h.orderId.merchant,
      actualWeight: h.orderId.actualWeight,
      arrivedAt: h.createdAt,
    }));

    response.success_message(data, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};
