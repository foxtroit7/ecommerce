const express = require("express");
const Contact = require("../models/contactModal"); // Import the model
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");
// ✅ Create Contact API
router.post("/contact",verifyToken, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        const newContact = await Contact.create({ content, time: new Date() });

        res.status(201).json({
            message: "Contact content created successfully",
            contact: newContact,
        });
    } catch (error) {
        console.error("Error creating contact details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Get Contact API (Fetch the latest contact content)
router.get("/contact",verifyToken, async (req, res) => {
    try {
        const contact = await Contact.findOne().sort({ updatedAt: -1 }); // Get latest updated entry

        if (!contact) {
            return res.status(404).json({ message: "No contact details found." });
        }

        res.json({
            content: contact.content,
            lastUpdated: contact.updatedAt, // This gives last edit date & time
        });
    } catch (error) {
        console.error("Error fetching contact details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Edit Contact API
router.put("/contact", async (req, res) => {
    try {
        const { content } = req.body;

        if (!content) {
            return res.status(400).json({ message: "Content is required" });
        }

        let contact = await Contact.findOne(); // Find existing document

        if (contact) {
            contact.content = content;
            contact.time = new Date(); // Store edit time
            await contact.save();
        } else {
            contact = await Contact.create({ content, time: new Date() });
        }

        res.json({
            message: "Contact content updated successfully",
            lastUpdated: contact.updatedAt, // Returns the latest timestamp
        });
    } catch (error) {
        console.error("Error updating contact details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
