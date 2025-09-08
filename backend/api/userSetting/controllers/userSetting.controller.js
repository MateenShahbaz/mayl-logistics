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
      merchant: user.merchant || "",
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

exports.edit = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phoneNo,
      bankName,
      accountNumber,
      accountName,
      email,
      merchant
    } = req.body;

    // find user by logged-in user's id
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return response.data_error_message({ message: "User not found" }, res);
    }

    if (email && email !== user.email) {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return response.validation_error_message(
          { message: "Email already in use" },
          res
        );
      }
      user.email = email;
    }

    // update allowed fields only
    if (firstName !== undefined) user.firstName = firstName;
    if (email !== undefined) user.email = email;
    if (lastName !== undefined) user.lastName = lastName;
    if (phoneNo !== undefined) user.phoneNo = phoneNo;
    if (bankName !== undefined) user.bankName = bankName;
    if (accountNumber !== undefined) user.accountNumber = accountNumber;
    if (accountName !== undefined) user.accountName = accountName;
    if (merchant !== undefined) user.merchant = merchant;

    await user.save();

    const data = {
      id: user._id,
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      phoneNo: user?.phoneNo || "",
      email: user.email || "",
      role: user.role,
      merchant: user.merchant || "",
      shipperNumber: user.shipperNumber,
      isVerified: user.isVerified,
      bankName: user?.bankName || "",
      accountNumber: user?.accountNumber || "",
      accountName: user?.accountName || "",
    };

    return response.success_message(data, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};
