const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller")

router.post("/orders", paymentController.fetchingOrder)

module.exports = router;
