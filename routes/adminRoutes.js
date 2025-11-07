const express = require("express");
const { generateToken } = require("../utils/generateToken"); // Import token generator
const router = express.Router();

const HARD_CODED_EMAIL = "admin@gmail.com";
const HARD_CODED_PASSWORD = "Saocery@7777";

// Admin Login Route
router.post("/admin-login", async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if email and password match the hardcoded values
        if (email !== HARD_CODED_EMAIL || password !== HARD_CODED_PASSWORD) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        // Generate JWT Token
        const token = generateToken(email);

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Admin Logout Route
router.post("/admin-logout", (req, res) => {
    try {
        // On the frontend, remove the token from localStorage or sessionStorage
        res.json({ message: "Logout successful" });
    } catch (error) {
        console.error("Error during logout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
module.exports = router;
