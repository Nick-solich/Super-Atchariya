const express = require("express");
const { register, login, getMe, logout } = require("../controllers/auth");

const router = express.Router();

const { protect } = require("../middleware/auth");

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/me").get(protect, getMe);
router.route("/logout").get(logout);

module.exports = router;
