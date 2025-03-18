const express = require('express');
const Booking = require('../models/bookingModal');
const Cart = require('../models/cartModal');
const { verifyToken } = require("../controllers/verifyToken");

const router = express.Router();

/**
 * ✅ **Place Booking API**
 * @route POST /booking/create/:user_id
 */
router.post('/create/:user_id', verifyToken, async (req, res) => {
    const { user_id } = req.params;

    try {
        // Fetch cart data
        const cart = await Cart.findOne({ user_id });

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: 'Cart is empty. Add products before booking.' });
        }

        // Create a new booking
        const newBooking = new Booking({
            user_id,
            products: cart.products,
            total_price: cart.total_price,
            status: 'Pending'  // Default status
        });

        await newBooking.save();

        // Clear the cart after booking is created
        await Cart.findOneAndDelete({ user_id });

        res.status(201).json({ message: 'Booking created successfully', booking: newBooking });
    } catch (error) {
        console.error('Error creating booking:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * ✅ **Cancel Booking API**
 * @route PUT /booking/cancel/:user_id/:booking_id
 */
router.put('/cancel/:user_id/:booking_id', verifyToken, async (req, res) => {
    const { user_id, booking_id } = req.params;

    try {
        const booking = await Booking.findOne({ booking_id });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Update status to 'Cancelled'
        booking.status = 'Cancelled';
        await booking.save();

        res.status(200).json({ message: 'Booking cancelled successfully', booking });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * ✅ **Get All Bookings for a User**
 * @route GET /booking/:user_id
 */
router.get('/get-booking/:user_id/:booking_id?', verifyToken, async (req, res) => {
    const { user_id, booking_id } = req.params;

    try {
        let bookings;

        if (booking_id) {
            // Fetch specific booking by booking_id
            bookings = await Booking.findOne({ user_id, booking_id });
            if (!bookings) {
                return res.status(404).json({ message: 'Booking not found' });
            }
        } else {
            // Fetch all bookings for the user
            bookings = await Booking.find({ user_id }).sort({ createdAt: -1 });
            if (!bookings || bookings.length === 0) {
                return res.status(404).json({ message: 'No bookings found' });
            }
        }

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
module.exports = router;
