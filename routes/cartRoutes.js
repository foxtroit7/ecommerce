const express = require('express');
const router = express.Router();
const Cart = require('../models/cartModal');
const Product = require('../models/productModal');
const User = require('../models/userModal');  // Import User Model
const { verifyToken } = require("../controllers/verifyToken");


/**
 * ✅ **Add to Cart API**
 * @route POST /cart/add/:user_id
 */
router.post('/add-cart/:user_id', verifyToken, async (req, res) => {
    const { user_id } = req.params;
    const { product_id, quantity = 1 } = req.body;

    try {
    
        // Validate if the user exists
        const user = await User.findOne({  user_id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch product details
        const product = await Product.findOne({ product_id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if the user already has a cart
        let cart = await Cart.findOne({ user_id });

        if (!cart) {
            // Create a new cart if none exists
            cart = new Cart({ user_id, products: [], total_price: 0 });
        }

        // Check if the product is already in the cart
        const productIndex = cart.products.findIndex(p => p.product_id === product_id);

        if (productIndex > -1) {
            // If product exists, increase its quantity
            cart.products[productIndex].quantity += quantity;
        } else {
            // Otherwise, add new product to cart
            cart.products.push({
                product_id: product.product_id,
                product_name: product.product_name,
                offer_price: product.offer_price,
                actual_price: product.actual_price,
                image: product.image,
                quantity: quantity
            });
        }
console.log(cart.products)
        // Update total price
        cart.total_price = cart.products.reduce((total, p) => total + (p.offer_price * p.quantity), 0);

        await cart.save();
        res.status(201).json({ message: 'Product added to cart successfully', cart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.get('/get-cart/:user_id', verifyToken, async (req, res) => {
    const { user_id } = req.params;

    try {
        // Check if user exists
        const user = await User.findOne({ user_id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch cart details
        const cart = await Cart.findOne({ user_id });

        if (!cart || cart.products.length === 0) {
            return res.status(404).json({ message: 'Cart is empty' });
        }

        res.status(200).json(cart);
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.delete('/remove/:user_id/:product_id', verifyToken, async (req, res) => {
    const { user_id, product_id } = req.params;

    try {
        // Validate user
        const user = await User.findOne({user_id});
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const cart = await Cart.findOne({ user_id });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Remove product from cart
        cart.products = cart.products.filter(p => p.product_id !== product_id);

        // Update total price
        cart.total_price = cart.products.reduce((total, p) => total + (p.offer_price * p.quantity), 0);

        await cart.save();
        res.status(200).json({ message: 'Product removed from cart', cart });
    } catch (error) {
        console.error('Error removing from cart:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

router.put('/reduce-quantity/:user_id/:product_id', verifyToken, async (req, res) => {
    const { user_id, product_id } = req.params;
    const { quantity } = req.body; // Get quantity from request body

    if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    try {
        // Validate user
        const user = await User.findOne({ user_id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Fetch the cart
        const cart = await Cart.findOne({ user_id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        // Find the product in the cart
        const productIndex = cart.products.findIndex(p => p.product_id === product_id);
        if (productIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        // Reduce the quantity
        if (cart.products[productIndex].quantity > quantity) {
            cart.products[productIndex].quantity -= quantity;
        } else {
            // If quantity to reduce is greater than or equal to current quantity, remove the product
            cart.products.splice(productIndex, 1);
        }

        // Update total price
        cart.total_price = cart.products.reduce((total, p) => total + (p.offer_price * p.quantity), 0);

        await cart.save();
        res.status(200).json({ message: 'Product quantity reduced successfully', cart });
    } catch (error) {
        console.error('Error reducing product quantity:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;