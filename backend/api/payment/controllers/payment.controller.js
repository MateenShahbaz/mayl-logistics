const orderModel = require("../../orders/models/order.model");
const userModel = require("../../auth/models/auth.model");
const orderHistoryModel = require("../../shippmentArrives/models/trackHistory.model");
const response = require("../../../response");
const paymentModel = require("../models/payment.model");
const addressModel = require("../../address/models/address.model");

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

    const orders = await orderModel
      .find({
        userId: user._id,
        cprGenerated: false,
        status: { $in: ["delivered", "return"] },
      })
      .select(
        "_id orderNumber merchant actualWeight amount refNumber items status createdAt"
      )
      .lean();

    const orderIds = orders.map((o) => o._id);

    const histories = await orderHistoryModel.find({
      orderId: { $in: orderIds },
      newStatus: { $in: ["delivered", "return"] },
      isDelete: false,
    });

    const result = orders.map((order) => {
      const deliveredHistory = histories.find(
        (h) =>
          h.orderId.toString() === order._id.toString() &&
          h.newStatus === "delivered"
      );
      const returnHistory = histories.find(
        (h) =>
          h.orderId.toString() === order._id.toString() &&
          h.newStatus === "return"
      );

      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        merchant: order.merchant,
        actualWeight: order.actualWeight,
        amount: order.amount,
        refNumber: order.refNumber,
        items: order.items,
        status: order.status,
        bookingDate: order.createdAt,
        deliveredDate: deliveredHistory ? deliveredHistory.createdAt : null,
        returnDate: returnHistory ? returnHistory.createdAt : null,
      };
    });

    response.success_message(result, res);
  } catch (error) {
    console.error(error.message);
    response.error_message(error.message, res);
  }
};

exports.add = async (req, res) => {
  try {
    const {
      shipperNumber,
      cityCode = "LHR",
      shippingCharges,
      extraCharges,
      saleTax,
      incTax,
      gst,
      orders,
    } = req.body;

    const shipper = await userModel.findOne({ shipperNumber, role: "Shipper" });
    if (!shipper) {
      return response.data_error_message(
        { message: "Shipper not found with this shipper number" },
        res
      );
    }

    const lastPayment = await paymentModel
      .findOne({ shipperId: shipper._id })
      .sort({ createdAt: -1 })
      .lean();

    let nextNumber = 1001;
    if (lastPayment && lastPayment.sheetNumber) {
      const parts = lastPayment.sheetNumber.split("-");
      const lastNum = parseInt(parts[parts.length - 1], 10);
      if (!isNaN(lastNum)) nextNumber = lastNum + 1;
    }

    const sheetNumber = `CPR-${shipper.shipperNumber}-${cityCode}-${nextNumber}`;

    const newPayment = await paymentModel.create({
      sheetNumber,
      shipperId: shipper._id,
      shippingCharges,
      extraCharges,
      saleTax,
      incTax,
      gst,
      status: "new",
      orders,
    });

    const pickupAddress =
      (await addressModel.findOne({
        userId: shipper._id,
        type: "pickup",
        default: true,
      })) ||
      (await addressModel.findOne({
        userId: shipper._id,
        type: "pickup",
      }));

    const data = {
      sheetNumber: newPayment.sheetNumber,
      merchant: {
        name: shipper?.merchant,
        phone: shipper?.phoneNo,
        address: pickupAddress.address,
        email: shipper.email,
      },
      createdAt: newPayment?.createdAt,
    };
    response.success_message(data, res);
  } catch (error) {
    console.error(error.message);
    response.error_message(error.message, res);
  }
};

exports.list = async (req, res) => {
  try {
    const { limit = 10, skip = 0, selectDate, search, searchType } = req.query;
    let query = {};
    if (search && searchType) {
      switch (searchType) {
        case "shipper no":
          query.sheetNumber = { $regex: search, $options: "i" };
          break;
      }
    }

    if (selectDate) {
      const start = new Date(`${selectDate}T00:00:00.000Z`);
      const end = new Date(`${selectDate}T23:59:59.999Z`);

      query.createdAt = { $gte: start, $lte: end };
    }

    const payments = await paymentModel
      .find(query)
      .select("sheetNumber status orders")
      .limit(Number(limit))
      .skip(Number(skip));

    const paymentCount = await paymentModel.countDocuments();

    response.success_message(payments, res, paymentCount);
  } catch (error) {
    console.error(error.message);
    response.error_message(error.message, res);
  }
};
