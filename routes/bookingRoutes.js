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
    const { user_name, delivery_address, phone_number } = req.body; 

    try {
        const cart = await Cart.findOne({ user_id });

        if (!cart || cart.products.length === 0) {
            return res.status(400).json({ message: 'Cart is empty. Add products before booking.' });
        }

        if (!user_name || !delivery_address) {
            return res.status(400).json({ message: 'User name and delivery address are required.' });
        }

        // console.log("Cart products before mapping:", cart.products);

        const bookedProducts = cart.products.map(p => ({
            ...p.toObject(), // Ensure full object is taken if using Mongoose
            quantity: p.quantity || 1  
        }));

        // console.log("Mapped booked products:", bookedProducts);

        const newBooking = new Booking({
            user_id,
            user_name,
            delivery_address,
            phone_number,
            products: bookedProducts,  
            total_price: cart.total_price || null,
            status: 'Pending'
        });

        await newBooking.save();
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

/**
 * ✅ **Get All Bookings for Admin with Optional Status Filter**
 * @route GET /booking/all-bookings?status=Pending
 */
router.get('/all-bookings', async (req, res) => {
    try {
        const { order_status } = req.query;
        let filter = {};

        // Apply status filter if provided
        if (order_status) {
            const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
            if (!validStatuses.includes(order_status)) {
                return res.status(400).json({ message: `Invalid status. Allowed values: ${validStatuses.join(', ')}` });
            }
            filter.order_status = order_status;
        }

        const bookings = await Booking.find(filter).sort({ createdAt: -1 });

        if (!bookings || bookings.length === 0) {
            return res.status(404).json({ message: 'No bookings found' });
        }

        res.status(200).json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * ✅ **Update Booking Status API**
 * @route PUT /booking/update-status/:booking_id
 */
router.put('/update-status/:booking_id',verifyToken,  async (req, res) => {
    const { booking_id } = req.params;
    const { order_status } = req.body;

    try {
        // Validate status input
        const validStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(order_status)) {
            return res.status(400).json({ message: `Invalid status. Allowed values: ${validStatuses.join(', ')}` });
        }

        // Find and update the booking status
        const booking = await Booking.findOneAndUpdate(
            { booking_id: booking_id },  // Find booking by ID
            { order_status },            // Update status field
            { new: true }          // Return the updated document
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking status updated successfully', booking });
    } catch (error) {
        console.error('Error updating booking status:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


router.get('/search-booking', async (req, res) => {
    try {
        const { booking_id } = req.query;

        if (!booking_id) {
            return res.status(400).json({ message: "Booking ID is required" });
        }

        const booking = await Booking.findOne({ booking_id });

        if (!booking) {
            return res.status(404).json({ message: "No booking found with this ID" });
        }

        res.status(200).json(booking);
    } catch (error) {
        console.error("Error searching booking:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
