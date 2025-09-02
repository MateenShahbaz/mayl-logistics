const response = require("../../../response");
const authModel = require("../../auth/models/auth.model");
const bcrypt = require("bcryptjs");

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

exports.add = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNo,
      bankName,
      accountNumber,
      accountName,
      status,
    } = req.body;

    if (!firstName || !lastName || !email || !password || !phoneNo) {
      return response.validation_error_message(
        { message: "All fields are required" },
        res
      );
    }

    const existingUser = await authModel.findOne({ email });
    if (existingUser) {
      return response.data_error_message(
        { message: "Email already registered" },
        res
      );
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    const lastUser = await authModel.findOne().sort({ createdAt: -1 });

    let nextShipperNumber = "10001";
    if (lastUser && lastUser.shipperNumber) {
      const lastNumber = parseInt(lastUser.shipperNumber, 10);
      nextShipperNumber = String(lastNumber + 1).padStart(5, "0");
    }

    const newUser = new authModel({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNo,
      shipperNumber: nextShipperNumber,
      role: "Shipper",
      bankName: bankName || "",
      accountNumber: accountNumber || "",
      accountName: accountName || "",
      status,
      isVerified: true,
    });

    await newUser.save();

    const data = {
      message: "User Register Successfully",
    };
    response.success_message(data, res);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message);
  }
};

exports.edit = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      email,
      password,
      phoneNo,
      bankName,
      accountNumber,
      accountName,
      status,
    } = req.body;

    const user = await authModel.findById(id);
    if (!user) {
      return response.data_error_message({ message: "User not found" }, res);
    }

    if (email) {
      const existingUser = await authModel.findOne({ email, _id: { $ne: id } });
      if (existingUser) {
        return response.data_error_message(
          { message: "Email already registered" },
          res
        );
      }
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.phoneNo = phoneNo || user.phoneNo;
    user.bankName = bankName || user.bankName;
    user.accountNumber = accountNumber || user.accountNumber;
    user.accountName = accountName || user.accountName;
    user.status = status !== undefined ? status : user.status;

    await user.save();

    const data = {
      message: "User updated successfully",
    };
    response.success_message(data, res);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message, res);
  }
};

exports.view = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await authModel.findById(id).select("-password");
    if (!user) {
      return response.data_error_message({ message: "User not found" }, res);
    }
    response.success_message(user, res);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message, res);
  }
};
