const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["pickup", "return"],
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    default: {
      type: Boolean,
      required: true,
      default: false,
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

module.exports = mongoose.model("Address", AddressSchema);
