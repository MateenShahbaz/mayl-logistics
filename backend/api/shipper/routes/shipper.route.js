const express = require("express");
const router = express.Router();
const shipperController = require("../controllers/shipper.controller");

router.get("/verified", shipperController.verifiedList);
router.get("/notVerified", shipperController.nonVerifiedList);
router.put("/verifyShipper/:id", shipperController.verifyShipper);

module.exports = router;
