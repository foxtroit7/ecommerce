const express = require("express");
const router = express.Router();
const { validateSignup } = require('../middlewares/user_validate');
const { signUp, login, verifyOtp, generateOtpForUser, logout, getLoggedInUsers, getUserById, deleteUserById, updateUserById } = require("../controllers/userControllers");
const { verifyToken } = require("../controllers/verifyToken");
// Routes
router.post("/sign-up",validateSignup, signUp, );          // Sign Up API
router.post("/login", login);            // Login API
router.post("/verify-otp", verifyOtp);   // Verify OTP API
router.post("/generate-otp", generateOtpForUser); // Optional OTP Generation
router.post('/logout',verifyToken, logout);
router.get('/user/details',verifyToken, getLoggedInUsers);
router.get('/user/details/:user_id',verifyToken, getUserById);
router.delete('/user/details/:user_id',verifyToken, deleteUserById);
router.put('/user/details/:user_id',verifyToken, updateUserById);
module.exports = router;
