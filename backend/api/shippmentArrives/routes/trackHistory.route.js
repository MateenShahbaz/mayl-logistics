const express = require("express");
const router = express.Router();
const trackHistoryController = require("../controllers/trackHistory.controller");

router.post("/shippemt-arrives", trackHistoryController.shippmentArrives);

module.exports = router;
