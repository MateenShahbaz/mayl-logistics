const express = require("express");
const router = express.Router();
const shipperController = require("../controllers/shipper.controller");

router.get("/verified", shipperController.verifiedList);
router.get("/notVerified", shipperController.nonVerifiedList);
router.put("/verifyShipper/:id", shipperController.verifyShipper);
router.post("/add", shipperController.add);
router.put("/edit/:id", shipperController.edit);
router.get("/view/:id", shipperController.view);

module.exports = router;
