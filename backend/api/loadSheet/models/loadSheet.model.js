const mongoose = require("mongoose");

const LoadSheetSchema = new mongoose.Schema(
  {
    loadsheetNumber: {
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
      default: "created",
    },
    rider: {
      name: { type: String },
      phoneNo: { type: String },
      employeeCode: { type: String },
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

module.exports = mongoose.model("LoadSheet", LoadSheetSchema);
