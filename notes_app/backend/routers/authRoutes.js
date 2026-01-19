const express = require("express");
const router = express.Router();
const { signup, login,sendSignupOTP,verifySignupOTP } = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/send-signup-otp",sendSignupOTP);
router.post("/verify-signup-otp",verifySignupOTP);

module.exports = router;
