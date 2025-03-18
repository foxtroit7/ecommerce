const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    booking_id: { type: String, unique: true },  // Auto-generated Order ID
    user_id: { type: String, ref: 'User' },  // User reference
    user_name: { type: String},
    delivery_address: { type: String},
    total_order_value: { type: Number,},
    products: [{  
        product_id: { type: String},  
        product_name: { type: String},
        offer_price: { type: Number},
        actual_price: { type: Number },
        image: { type: String }
    }],
    total_price: {type:String},
    order_status: { type: String, enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' }, // Default: Pending
}, { timestamps: true });

// Generate unique booking_id (ORD + 5-digit number)
bookingSchema.pre('save', async function (next) {
    if (!this.booking_id) {
        const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit unique number
        this.booking_id = `ORD${randomNum}`;
    }
    next();
});

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
