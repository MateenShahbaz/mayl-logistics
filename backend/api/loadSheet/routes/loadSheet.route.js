const express = require("express");
const router = express.Router();
const loadSheetController = require("../controllers/loadSheet.controller");

router.get("/unbookedList", loadSheetController.unbookedList);
router.post("/add", loadSheetController.add);
router.get("/list", loadSheetController.list);
router.get("/getorder/:id", loadSheetController.getOrderById);
router.get("/print/:id", loadSheetController.printLoadSheet);
router.put("/updatestatus/:id", loadSheetController.updateLoadSheetStatus);
module.exports = router;
