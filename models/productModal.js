const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    product_id: { type: String, unique: true },  // Custom ID
    product_name: { type: String, required: true },
    image: { type: String, required: true },
    category_id: { type: String, required: true, ref: 'CategoryModel' },
    category: { type: String, required: true }, // Store category name for quick access
    offer_price: { type: Number, required: true },
    actual_price: { type: Number, required: true },
    description: { type: String, required: true },
    quantity: {type: String}
}, { timestamps: true });

// Generate a unique product_id (PRO + 5-digit number)
productSchema.pre('save', async function (next) {
    if (!this.product_id) {
        const randomNum = Math.floor(10000 + Math.random() * 90000); // 5-digit unique number
        this.product_id = `PRO${randomNum}`;
    }
    next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
