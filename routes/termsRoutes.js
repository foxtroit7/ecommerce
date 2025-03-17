const express = require("express");
const Terms = require("../models/TermsModal"); 
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");
// ✅ Create terms API
router.post("/terms",verifyToken, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        const newterms = await Terms.create({ content, time: new Date() });

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
// ✅ Get terms API (Fetch the latest terms content)
router.get("/terms", verifyToken, async (req, res) => {
    try {
        const terms = await Terms.findOne().sort({ updatedAt: -1 }); // Get latest updated entry

        if (!terms) {
            return res.status(404).json({ message: "No terms details found." });
        }

        res.json({
            id: terms._id, // Explicitly include the ObjectId
            content: terms.content,
            lastUpdated: terms.updatedAt, // This gives last edit date & time
        });
    } catch (error) {
        console.error("Error fetching terms details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


router.put("/terms/:id", verifyToken, async (req, res) => {
    try {
        const { id } = req.params; // Get ID from URL params
        const { content } = req.body; // Get new content from request body

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        // Find and update the term by its `_id`
        const updatedTerm = await Terms.findByIdAndUpdate(
            id,
            { content, time: new Date() }, // Update content and timestamp
            { new: true } // Return the updated document
        );

        if (!updatedTerm) {
            return res.status(404).json({ message: "Term not found." });
        }

        res.json({
            message: "Term updated successfully",
            term: updatedTerm
        });
    } catch (error) {
        console.error("Error updating term:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



// ✅ Edit terms API


module.exports = router;
