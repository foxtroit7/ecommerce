const express = require("express");
const terms = require("../models/TermsModal"); // Import the model
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");
// ✅ Create terms API
router.post("/terms",verifyToken, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        const newterms = await terms.create({ content, time: new Date() });

        res.status(201).json({
            message: "terms content created successfully",
            terms: newterms,
        });
    } catch (error) {
        console.error("Error creating terms details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Get terms API (Fetch the latest terms content)
router.get("/terms",verifyToken, async (req, res) => {
    try {
        const terms = await terms.findOne().sort({ updatedAt: -1 }); // Get latest updated entry

        if (!terms) {
            return res.status(404).json({ message: "No terms details found." });
        }

        res.json({
            content: terms.content,
            lastUpdated: terms.updatedAt, // This gives last edit date & time
        });
    } catch (error) {
        console.error("Error fetching terms details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Edit terms API
router.put("/terms", async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        let terms = await terms.findOne(); // Find existing document

        if (terms) {
            terms.content = content;
            terms.time = new Date(); // Store edit time
            await terms.save();
        } else {
            terms = await terms.create({ content, time: new Date() });
        }

        res.json({
            message: "terms content updated successfully",
            lastUpdated: terms.updatedAt, // Returns the latest timestamp
        });
    } catch (error) {
        console.error("Error updating terms details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
