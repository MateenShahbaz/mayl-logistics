const express = require("express");
const router = express.Router();
const loadSheetController = require("../controllers/loadSheet.controller");

router.get("/unbookedList", loadSheetController.unbookedList);
router.post("/add", loadSheetController.add);
router.get("/list", loadSheetController.list);
router.get("/getorder/:id", loadSheetController.getOrderById);
module.exports = router;
