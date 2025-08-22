const response = require("../../../response");
const authModel = require("../models/auth.model");

exports.signup = async (req, res) => {
  try {
    response.success_message({ message: "hello" }, res);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message);
  }
};
