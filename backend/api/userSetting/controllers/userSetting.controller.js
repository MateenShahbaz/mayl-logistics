const userModel = require("../../auth/models/auth.model");
const response = require("../../../response");

exports.getUser = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return response.data_error_message({ message: "User not found" }, res);
    }
    const data = {
      id: user._id,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNo: user?.phoneNo || "",
      email: user.email || "",
      role: user.role,
      shipperNumber: user.shipperNumber,
      isVerified: user.isVerified,
      bankName: user?.bankName || "",
      accountNumber: user?.accountNumber || "",
      accountName: user?.accountName || "",
    };
    response.success_message(data, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};
