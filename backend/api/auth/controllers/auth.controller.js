const response = require("../../../response");
const authModel = require("../models/auth.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phoneNo, merchant } =
      req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phoneNo ||
      !merchant
    ) {
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
      merchant,
      password: hashedPassword,
      phoneNo,
      shipperNumber: nextShipperNumber,
      role: "Shipper",
      status: true,
      isVerified: false,
    });

    await newUser.save();

    const data = {
      message: "User Register Successfully",
      data: {
        isVerified: newUser.isVerified,
      },
    };
    response.success_message(data, res);
  } catch (error) {
    console.log(error.message);
    response.error_message(error.message);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return response.validation_error_message(
        { message: "Email and password are required" },
        res
      );
    }

    const user = await authModel.findOne({ email });
    if (!user) {
      return response.data_error_message(
        { message: "Invalid email or password" },
        res
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return response.data_error_message(
        { message: "Invalid email or password" },
        res
      );
    }

    if (!user.status) {
      return response.data_error_message(
        { message: "Account is inActive" },
        res
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user?.role,
        shipperNumber: user?.shipperNumber,
        merchant: user?.merchant,
        phoneNo: user?.phoneNo,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    const data = {
      message: "Login successful",
      data: {
        id: user._id,
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phoneNo: user?.phoneNo || "",
        email: user.email || "",
        role: user.role,
        shipperNumber: user.shipperNumber,
        isVerified: user.isVerified,
        merchant: user?.merchant || "",
        bankName: user?.bankName || "",
        accountNumber: user?.accountNumber || "",
        accountName: user?.accountName || "",
      },
      token: user.isVerified ? token : null,
    };

    return response.success_message(data, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};
