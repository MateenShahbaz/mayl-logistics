const express = require("express");
const router = express.Router();
const userSettingController = require("../controllers/userSetting.controller");

router.get("/user", userSettingController.getUser)
router.put("/edit", userSettingController.edit)


module.exports = router;
