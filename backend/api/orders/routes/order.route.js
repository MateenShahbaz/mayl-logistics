const express = require("express");
const router = express.Router();
const orderController = require("../controllers/order.controller");

router.post("/add", orderController.add);
router.post("/excel", orderController.excelUpload);
router.get("/list", orderController.list);
router.get("/view/:id", orderController.view);
router.get("/tracking/:tackingNo", orderController.trackOrder);
router.put("/edit/:id", orderController.edit);
router.get("/orderlogs", orderController.orderLogs);
router.get("/airwayBills", orderController.airwayBills);
router.put("/cancel/:id", orderController.cancelOrder);

module.exports = router;
