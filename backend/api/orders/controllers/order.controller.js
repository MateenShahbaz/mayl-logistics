const orderModel = require("../models/order.model");
const response = require("../../../response");

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
      userId: id,
    });

    response.success_message({ message: "Order added successfully" }, res);
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
      .select("orderNumber orderType refNumber amount items weight")
      .limit(Number(limit))
      .skip(Number(skip));

    const orderCount = await orderModel.countDocuments({ userId: req.user.id });

    response.success_message(orders, res, orderCount);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};
