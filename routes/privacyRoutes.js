const express = require("express");
const Privacy = require("../models/privacyModal"); // Import the model
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");
// ✅ Create privacy API
router.post("/privacy",verifyToken, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        const newprivacy = await Privacy.create({ content, time: new Date() });

        res.status(201).json({
            message: "privacy content created successfully",
            privacy: newprivacy,
        });
    } catch (error) {
        console.error("Error creating privacy details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Get privacy API (Fetch the latest privacy content)
router.get("/privacy",verifyToken, async (req, res) => {
    try {
        const privacy = await Privacy.findOne().sort({ updatedAt: -1 }); // Get latest updated entry

        if (!privacy) {
            return res.status(404).json({ message: "No privacy details found." });
        }

        res.json({
            content: privacy.content,
            lastUpdated: privacy.updatedAt, // This gives last edit date & time
        });
    } catch (error) {
        console.error("Error fetching privacy details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Edit privacy API
router.put("/privacy", async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        let privacy = await Privacy.findOne(); // Find existing document

        if (privacy) {
            privacy.content = content;
            privacy.time = new Date(); // Store edit time
            await privacy.save();
        } else {
            privacy = await privacy.create({ content, time: new Date() });
        }

        res.json({
            message: "privacy content updated successfully",
            lastUpdated: privacy.updatedAt, // Returns the latest timestamp
        });
    } catch (error) {
        console.error("Error updating privacy details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
