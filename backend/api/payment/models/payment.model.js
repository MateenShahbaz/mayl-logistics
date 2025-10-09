const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema(
  {
    sheetNumber: {
      type: String,
      required: true,
    },
    shipperId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    shippingCharges: {
      type: Number,
      required: false,
      default: 0,
    },
    extraCharges: {
      type: Number,
      required: false,
      default: 0,
    },
    saleTax: {
      type: Number,
      required: false,
      default: 0,
    },
    incTax: {
      type: Number,
      required: false,
      default: 0,
    },
    gst: {
      type: Number,
      required: false,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ["new", "paid"],
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
