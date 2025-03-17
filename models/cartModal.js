const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    user_id: { type: String, required: true, ref: 'User' },  // Reference to User
    products: [{
        product_id: { type: String, required: true },
        product_name: { type: String, required: true },
        offer_price: { type: Number, required: true },
        actual_price: { type: Number, required: true },
        image: { type: String },
        quantity: { type: Number, required: true, default: 1 } // Default quantity = 1
    }],
    total_price: { type: Number, required: true, default: 0 }
}, { timestamps: true });
module.exports = mongoose.model('Cart', cartSchema);
