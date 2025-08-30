const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const connectDB = require("./config/db");
const { jwtauth } = require("./middleware/jwt.middleware");

const app = express();
app.use(express.json());
app.use(require("cors")());
connectDB();
// Test Route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

const PORT = process.env.PORT;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

const authRoutes = require("./api/auth/routes/auth.route");
app.use("/auth", authRoutes);

const shipperroutes = require("./api/shipper/routes/shipper.route");
app.use("/shipper", jwtauth, shipperroutes);

const userSettingRoutes = require("./api/userSetting/routes/userSetting.route");
app.use("/userSetting", jwtauth, userSettingRoutes);

const addressRoutes = require("./api/address/routes/address.route");
app.use("/address", jwtauth, addressRoutes);

const dropdownRoutes = require("./api/dropdown/routes/dropdown.route");
app.use("/dropdown", jwtauth, dropdownRoutes);

const orderRoutes = require("./api/orders/routes/order.route");
app.use("/order", jwtauth, orderRoutes);
