const response = require("../../../response");
const authModel = require("../../auth/models/auth.model");

exports.verifiedList = async (req, res) => {
  try {
    const { limit = 5, skip = 0 } = req.query;

    const verifiedUsers = await authModel
      .find({
        isVerified: true,
        role: "Shipper",
      })
      .select("-password -role -updatedAt")
      .limit(Number(limit))
      .skip(Number(skip));
    const verifiedUsersCount = await authModel.countDocuments({
      isVerified: true,
      role: "Shipper",
    });

    response.success_message(verifiedUsers, res, verifiedUsersCount);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message);
  }
};

exports.nonVerifiedList = async (req, res) => {
  try {
    const { limit = 5, skip = 0 } = req.query;

    const nonVerifiedUsers = await authModel
      .find({
        isVerified: false,
        role: "Shipper",
      })
      .select("-password -role -updatedAt")
      .limit(Number(limit))
      .skip(Number(skip));
    const nonVerifiedUsersCount = await authModel.countDocuments({
      isVerified: false,
      role: "Shipper",
    });

    response.success_message(nonVerifiedUsers, res, nonVerifiedUsersCount);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message);
  }
};

exports.verifyShipper = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return response.validation_error_message(
        { message: "User ID is required" },
        res
      );
    }

    const updatedUser = await authModel.findByIdAndUpdate(
      id,
      { isVerified: true },
      { new: true }
    );

    if (!updatedUser) {
      return response.data_error_message({ message: "User not found" }, res);
    }

    const data = {
      message: "Shipper verified successfully",
    };

    return response.success_message(data, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};
