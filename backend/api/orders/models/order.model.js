const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
    },
    orderType: {
      type: String,
      required: true,
      enum: ["normal", "reverse", "replacement"],
    },
    refNumber: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    airwayBillsCopy: {
      type: Number,
      required: true,
    },
    items: {
      type: Number,
      required: true,
    },
    weight: {
      type: Number,
      required: false,
      default: 0,
    },
    customer: {
      name: {
        type: String,
        required: true,
      },
      contactNumber: {
        type: Number,
        required: true,
      },
      deliverCity: {
        type: String,
        default: "Lahore",
      },
      deliveryAddress: {
        type: String,
        required: true,
      },
    },
    shipperInfo: {
      pickupCity: {
        type: String,
        default: "Lahore",
      },
      pickupAddress: {
        type: String,
        required: true,
      },
      returnCity: {
        type: String,
        default: "Lahore",
      },
      returnAddress: {
        type: String,
        required: true,
      },
    },
    orderDetail: {
      type: String,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: true,
      enum: ["Unbooked"]
    },
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", OrderSchema);
