const mongoose = require("mongoose");

const AuthSchema = new mongoose.Schema(
  {},
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", AuthSchema);
