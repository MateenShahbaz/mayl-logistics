const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/payment.controller")

router.post("/orders", paymentController.fetchingOrder)
router.post("/add", paymentController.add)
router.get("/list", paymentController.list)
router.get("/shipper/list", paymentController.shipperPayments)
router.put("/status/:id", paymentController.updateStatus)

module.exports = router;
