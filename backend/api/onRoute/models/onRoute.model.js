const mongoose = require("mongoose");

const onRouteSchema = new mongoose.Schema(
  {
    sheetNumber: {
      type: String,
      required: true,
      unique: true,
    },
    orders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
    ],
    status: {
      type: String,
      enum: ["new", "cancel"],
      default: "new",
    },
    type: {
      type: String,
      enum: ["delivery", "return"],
    },
    branch: {
      type: String,
      default: "LHE",
    },
    courierId: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("OnRoute", onRouteSchema);
