const express = require('express');
const UserDetails = require('../models/userDetailsModal'); // Import the model
const router = express.Router();
const upload = require('../middlewares/upload'); // Multer middleware for file uploads
const { verifyToken } = require("../controllers/verifyToken");
/**
 * POST route to create a new user detail entry
 * @route POST /user/details
 */
router.post('/user/details',verifyToken, upload.single('photo'), async (req, res) => {
    const { user_id, name,location, phone_number, status } = req.body;

    try {
        // Check if user_id already exists
        const existingUser = await UserDetails.findOne({ user_id });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this user_id already exists' });
        }
        const photoPath = req.file ? req.file.path : null;
        const newUser = new UserDetails({
            user_id,
            photo: photoPath,
            name,
            location,
            phone_number,
            status
        });

        await newUser.save();
        res.status(201).json({ message: 'User details created successfully', newUser });
    } catch (error) {
        console.error('Error creating user details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * GET route to fetch all user details
 * @route GET /user/details
 */
router.get('/user/details',verifyToken, async (req, res) => {
    try {
        const users = await UserDetails.find();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * GET route to fetch user details by user_id
 * @route GET /user/details/:user_id
 */
router.get('/user/details/:user_id',verifyToken, async (req, res) => {
    const { user_id } = req.params;

    try {
        const user = await UserDetails.findOne({ user_id });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
router.delete('/user/details/:user_id',verifyToken, async (req, res) => {
    const { user_id } = req.params;

    try {
        // Find the user by user_id and delete it
        const deletedUser = await UserDetails.findOneAndDelete({ user_id });

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully', deletedUser });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
module.exports = router;
/**
 * PUT route to update user details by user_id
 * @route PUT /user/details/:user_id
 */
router.put('/user/details/:user_id',verifyToken, upload.single('photo'), async (req, res) => {
    const { user_id } = req.params;
    const { name, location, phone_number, status } = req.body;
    
    try {
        const updatedFields = { name, location, phone_number, status };
        if (req.file) {
            updatedFields.photo = req.file.path;
        }

        const updatedUser = await UserDetails.findOneAndUpdate(
            { user_id },
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User details updated successfully', updatedUser });
    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
