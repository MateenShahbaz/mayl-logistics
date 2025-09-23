const express = require("express");
const router = express.Router();
const trackHistoryController = require("../controllers/trackHistory.controller");

router.post("/shippemt-arrives", trackHistoryController.shippmentArrives);
router.put(
  "/shippment-delete/:id",
  trackHistoryController.deleteShipmentArrives
);
router.post("/get-track", trackHistoryController.trackOrderHistory);
router.post("/arrived", trackHistoryController.getArrivedByCourierAndDate);
module.exports = router;
