const express = require("express");
const router = express.Router();
const { validateSignup } = require('../middlewares/user_validate');
const { signUp, login, verifyOtp, generateOtpForUser, logout } = require("../controllers/userControllers");
const { verifyToken } = require("../controllers/verifyToken");
// Routes
router.post("/sign-up",validateSignup, signUp, );          // Sign Up API
router.post("/login", login);            // Login API
router.post("/verify-otp", verifyOtp);   // Verify OTP API
router.post("/generate-otp", generateOtpForUser); // Optional OTP Generation
router.post('/logout',verifyToken, logout);


module.exports = router;
