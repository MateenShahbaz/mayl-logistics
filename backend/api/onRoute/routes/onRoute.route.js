const express = require("express");
const router = express.Router();
const OnRouteController = require("../controllers/onRoute.controller");

router.post("/fetchOrder", OnRouteController.fetchingOrder);
router.post("/add", OnRouteController.addDevlivery);
router.get("/list", OnRouteController.list);
router.get("/deliveryList", OnRouteController.outForDeliveryList);
router.get("/view/:id", OnRouteController.view);
router.put("/update-status/:id", OnRouteController.updateOrderStatuses);
router.get("/shipper-advice", OnRouteController.shipperAdviceList);
router.put("/shipper-advice/update", OnRouteController.shipperAdviceStatus);

module.exports = router;
