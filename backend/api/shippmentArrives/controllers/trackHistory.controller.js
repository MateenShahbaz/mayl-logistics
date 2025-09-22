const response = require("../../../response");
const orderModel = require("../../orders/models/order.model");
const loadSheetModel = require("../../loadSheet/models/loadSheet.model");

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

    if (!loadSheet) {
      return response.data_error_message(
        { message: "Order not found in any LoadSheet" },
        res
      );
    }

    const lsOrder = loadSheet.orders.find(
      (o) => o.orderId.toString() === order._id.toString()
    );

    if (!lsOrder) {
      return response.data_error_message(
        { message: "Order not linked with LoadSheet" },
        res
      );
    }

    if (lsOrder.status === "picked") {
      return response.data_error_message(
        { message: "Order already picked" },
        res
      );
    }

    order.status = "arrived";
    order.actualWeight = weight;
    lsOrder.status = "picked";
    await order.save();
    await loadSheet.save();

    const data = {
        _id: order._id,
        orderNumber: order?.orderNumber,
        customer: order?.customer,
        merchant: order?.merchant,
        actualWeight: order?.actualWeight
    }
    response.success_message(data, res)
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};
