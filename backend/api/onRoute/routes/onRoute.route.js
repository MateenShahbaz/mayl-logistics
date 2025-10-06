const express = require("express");
const router = express.Router();
const OnRouteController = require("../controllers/onRoute.controller");

router.post("/fetchOrder", OnRouteController.fetchingOrder);
router.post("/fetchReturnOrder", OnRouteController.fetchingReturnOrder);
router.post("/add", OnRouteController.addDevlivery);
router.post("/addReturn", OnRouteController.addReturn);
router.get("/list", OnRouteController.list);
router.get("/deliveryList", OnRouteController.outForDeliveryList);
router.get("/returnList", OnRouteController.outForReturnList);
router.get("/view/:id", OnRouteController.view);
router.put("/update-status/:id", OnRouteController.updateOrderStatuses);
router.put("/return-status/:id", OnRouteController.returnStatus);
router.get("/shipper-advice", OnRouteController.shipperAdviceList);
router.put("/shipper-advice/update", OnRouteController.shipperAdviceStatus);

module.exports = router;
