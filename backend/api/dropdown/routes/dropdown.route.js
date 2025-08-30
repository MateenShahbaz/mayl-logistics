const express = require("express");
const router = express.Router();
const dropdownController = require("../controllers/dropdown.controller");

router.get("/addressList", dropdownController.addressList)

module.exports = router;
