const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    merchant: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    shipperNumber: {
      type: String,
      required: false,
    },
    role: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
      required: false,
    },
    accountNumber: {
      type: Number,
      required: false,
    },
    accountName: {
      type: String,
      required: false,
    },
    status: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", AuthSchema);
