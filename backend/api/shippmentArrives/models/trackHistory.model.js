const mongoose = require("mongoose");

const OrderHistorySchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    previousStatus: { type: String },
    newStatus: { type: String },
    message: { type: String },
    courierId: {
      type: String,
    },
    visibleToShipper: { type: Boolean, default: false },
    isDelete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderHistory", OrderHistorySchema);
