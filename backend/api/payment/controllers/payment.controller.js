const response = require("../../../response");
const orderModel = require("../../orders/models/order.model");
const userModel = require("../../auth/models/auth.model");

exports.fetchingOrder = async (req, res) => {
  try {
    const { shipperNumber } = req.body;

    const user = await userModel.findOne({ shipperNumber, role: "Shipper" });

    if (!user) {
      return response.data_error_message(
        { message: "Shipper not found with this shipper number" },
        res
      );
    }

    const orders = await orderModel.find({
      userId: user._id,
      cprGenerated: false,
      status: { $in: ["delivered", "return"] },
    }).select("_id orderNumber merchant actualWeight amount refNumber items");

    response.success_message(orders, res);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message);
  }
};
