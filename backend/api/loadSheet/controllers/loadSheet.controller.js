const response = require("../../../response");
const orderModel = require("../../orders/models/order.model");
const loadSheetModel = require("../models/loadSheet.model");

const generateLoadsheetNumber = async (user) => {
  const lastSheet = await loadSheetModel.findOne({ userId: user.id }).sort({
    createdAt: -1,
  });

  let nextNumber = 100001;

  if (lastSheet) {
    const parts = lastSheet.loadsheetNumber.split("LS");
    if (parts.length > 1) {
      const lastNum = parseInt(parts[1], 10);
      if (!isNaN(lastNum)) {
        nextNumber = lastNum + 1;
      }
    }
  }

  return `LHR-${user.shipperNumber}-LS${nextNumber}`;
};

exports.unbookedList = async (req, res) => {
  try {
    const {
      limit = 10,
      skip = 0,
      startDate,
      endDate,
      search,
      searchType,
    } = req.query;

    let query = { userId: req.user.id, status: "unbooked" };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lt: new Date(
          new Date(endDate).setDate(new Date(endDate).getDate() + 1)
        ),
      };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdAt = {
        $lt: new Date(
          new Date(endDate).setDate(new Date(endDate).getDate() + 1)
        ),
      };
    }

    if (search && searchType) {
      switch (searchType) {
        case "order ref":
          query.refNumber = { $regex: search, $options: "i" };
          break;
        case "tracking":
          query.orderNumber = { $regex: search, $options: "i" };
          break;
      }
    }

    const orders = await orderModel
      .find(query)
      .select("-__v -updateAt")
      .limit(Number(limit))
      .skip(Number(skip));

    const orderCount = await orderModel.countDocuments({
      userId: req.user.id,
      status: "unbooked",
    });

    response.success_message(orders, res, orderCount);
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

exports.add = async (req, res) => {
  try {
    const { orders, rider } = req.body;
    const user = req.user;

    if (!orders || orders.length === 0) {
      return response.validation_error_message(
        { message: "Orders are required to create a LoadSheet" },
        res
      );
    }
    const loadsheetNumber = await generateLoadsheetNumber(user);

    const loadSheet = new loadSheetModel({
      loadsheetNumber,
      orders,
      rider,
      userId: user.id,
      status: "new",
    });

    await loadSheet.save();

    await orderModel.updateMany(
      { _id: { $in: orders } },
      { $set: { status: "booked" } }
    );

    return response.success_message(
      {
        loadsheetNumber: loadSheet.loadsheetNumber,
      },
      res
    );
  } catch (error) {
    console.log(error.message);
    return response.error_message(error.message, res);
  }
};

exports.list = async (req, res) => {
  try {
    const user = req.user;
    const { limit = 10, skip = 0, search, searchType } = req.query;

    let query = { userId: req.user.id };

    if (search && searchType) {
      switch (searchType) {
        case "load sheet":
          query.loadsheetNumber = { $regex: search, $options: "i" };
          break;
        case "rider":
          query["rider.name"] = { $regex: search, $options: "i" };
          break;
      }
    }

    const loadSheets = await loadSheetModel
      .find(query)
      .populate("orders", "status")
      .limit(Number(limit))
      .skip(Number(skip));

    const loadSheetCount = await loadSheetModel.countDocuments({
      userId: req.user.id,
    });

    return response.success_message(loadSheets, res, loadSheetCount);
  } catch (error) {
    console.error("Error fetching loadsheets:", error.message);
    return response.error_message(error.message, res);
  }
};
