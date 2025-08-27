const addressModel = require("../models/address.model");
const response = require("../../../response");

// Add new address
exports.add = async (req, res) => {
  try {
    const { type, city, address, isDefault } = req.body;

    if (!type || !address) {
      return response.data_error_message(
        { message: "Missing required fields" },
        res
      );
    }

    if (isDefault) {
      await addressModel.updateMany(
        { userId: req.user.id, type },
        { $set: { default: false } }
      );
    }

    const newAddress = new addressModel({
      type,
      city : "Lahore",
      address,
      default: isDefault || false,
      userId: req.user.id,
    });

    await newAddress.save();
    return response.success_message(
      { message: "Address Added Successfully" },
      res
    );
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

exports.view = async (req, res) => {
  try {
    const address = await addressModel.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!address) {
      return response.data_error_message({ message: "Address not found" }, res);
    }

    return response.success_message(address, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

// Edit address
exports.edit = async (req, res) => {
  try {
    const { type, city, address, isDefault } = req.body;
    
    const addressDoc = await addressModel.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!addressDoc) {
      return response.data_error_message({ message: "Address not found" }, res);
    }

    if (type !== undefined) addressDoc.type = type;
    // if (city !== undefined) addressDoc.city = city;
    if (address !== undefined) addressDoc.address = address;

    if (isDefault !== undefined) {
      if (isDefault) {
        // unset all other defaults for same type
        await addressModel.updateMany(
          {
            userId: req.user.id,
            type: addressDoc.type,
            _id: { $ne: addressDoc._id },
          },
          { $set: { default: false } }
        );
      }
      addressDoc.default = isDefault;
    }

    await addressDoc.save();
    return response.success_message(
      { message: "Address updated successfully" },
      res
    );
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

// Delete address
exports.delete = async (req, res) => {
  try {
    const address = await addressModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!address) {
      return response.data_error_message({ message: "Address not found" }, res);
    }

    return response.success_message({ message: "Address deleted" }, res);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

// List all addresses of logged in user
exports.list = async (req, res) => {
  try {
    const { limit = 5, skip = 0 } = req.query;

    const addresses = await addressModel
      .find({ userId: req.user.id })
      .select("-userId -createdAt -updatedAt -__v")
      .limit(Number(limit))
      .skip(Number(skip));

    const addresseCount = await addressModel.countDocuments({
      userId: req.user.id,
    });

    return response.success_message(addresses, res, addresseCount);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};
