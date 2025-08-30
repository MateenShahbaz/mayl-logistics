const response = require("../../../response");
const addressModel = require("../../address/models/address.model");

exports.addressList = async (req, res) => {
  try {
    const pickupaddress = await addressModel
      .find({
        userId: req.user.id,
        type: "pickup",
      })
      .select("-userId");

    const returnaddress = await addressModel
      .find({
        userId: req.user.id,
        type: "return",
      })
      .select("-userId");

    const data = { pickupaddress, returnaddress };

    response.success_message(data, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};
