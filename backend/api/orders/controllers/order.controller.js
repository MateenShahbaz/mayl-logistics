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

    response.success_message(order , res);
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
