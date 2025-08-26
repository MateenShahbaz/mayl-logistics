const express = require("express");
const router = express.Router();
const addressController = require("../controllers/address.controller");

router.post("/add", addressController.add);
router.get("/view/:id", addressController.view);
router.put("/edit/:id", addressController.edit);
router.delete("/delete/:id", addressController.delete);
router.get("/list", addressController.list);

module.exports = router;
