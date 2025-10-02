const express = require('express');
const Product = require('../models/productModal');
const Category = require('../models/CategoryModel');
const upload = require('../middlewares/upload'); // Multer middleware for file uploads
const router = express.Router();
const { verifyToken } = require("../controllers/verifyToken");
/**
 * 🆕 POST: Create a new product (Generates `product_id`)
 * @route POST /products
 */
router.post('/create-product',verifyToken, upload.single('image'), async (req, res) => {
    const { product_name, category_id, offer_price, actual_price, description } = req.body;

    try {
        // Fetch category details
        const category = await Category.findOne({ category_id });
        if (!category) {
            return res.status(400).json({ message: 'Invalid category_id' });
        }

        const imagePath = req.file ? req.file.path : null;
        const newProduct = new Product({
            product_name,
            image: imagePath,
            category_id,
            category: category.category, // Store category name
            offer_price,
            actual_price,
            description
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * 🆕 GET: Fetch all products
 * @route GET /products
 */
router.get('/get-product', verifyToken, async (req, res) => {
    try {
        let { page, limit } = req.query;

        // Default: no pagination
        if (page && limit) {
            page = parseInt(page) || 1;
            limit = parseInt(limit) || 10;

            const skip = (page - 1) * limit;
            const products = await Product.find()
                .skip(skip)
                .limit(limit);

            const total = await Product.countDocuments();

            return res.status(200).json({
                products,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit)
                }
            });
        } else {
            // No pagination - return all
            const products = await Product.find();
            return res.status(200).json(products);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * 🆕 GET: Fetch products by `category_id`
 * @route GET /products/category/:category_id
 */
router.get('/get-product-category/:category_id', verifyToken, async (req, res) => {
    const { category_id } = req.params;

    try {
        const products = await Product.find({ category_id });

        if (!products.length) {
            return res.status(404).json({ message: 'No products found for this category' });
        }

        res.status(200).json(products);
    } catch (error) {
        console.error('Error fetching products by category:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * 🆕 GET: Fetch product by `product_id`
 * @route GET /products/:product_id
 */
router.get('/get-product/:product_id',verifyToken, async (req, res) => {
    const { product_id } = req.params;
    try {
        const product = await Product.findOne({ product_id });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * 🆕 PUT: Update product by `product_id`
 * @route PUT /products/:product_id
 */
router.put('/edit-product/:product_id',verifyToken, upload.single('image'), async (req, res) => {
    const { product_id } = req.params;
    const { product_name, category,category_id, offer_price, actual_price, description } = req.body;

    try {
        // Fetch product details
        const product = await Product.findOne({ product_id });
        if (!product) {
            return res.status(400).json({ message: 'Invalid product_id' });
        }

        const updatedFields = {
            product_name,
            category_id,
            category, // Update category name
            offer_price,
            actual_price,
            description
        };
        if (req.file) {
            updatedFields.image = req.file.path;
        }

        const updatedProduct = await Product.findOneAndUpdate(
            { product_id },
            { $set: updatedFields },
            { new: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * 🆕 DELETE: Delete product by `product_id`
 * @route DELETE /products/:product_id
 */
router.delete('/delete-product/:product_id',verifyToken, async (req, res) => {
    const { product_id } = req.params;
    try {
        const deletedProduct = await Product.findOneAndDelete({ product_id });
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully', deleted_product: deletedProduct });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


/**
 * 🔍 GET: Search products by name (fuzzy + sorted by relevance)
 * @route GET /products/search?name=
 */
router.get('/products/search', verifyToken, async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ message: 'Product name is required' });
    }

    const searchTerm = name.toLowerCase();
    const regex = new RegExp(searchTerm, 'i');

    // Get all matching products using regex
    const matchedProducts = await Product.find({
      product_name: { $regex: regex }
    });

    // Separate: wordStartsWith and others
    const startsWith = [];
    const contains = [];

    matchedProducts.forEach(product => {
      const words = product.product_name.toLowerCase().split(/\s+/);
      if (words.some(word => word.startsWith(searchTerm))) {
        startsWith.push(product);
      } else {
        contains.push(product);
      }
    });

    // Optional: sort alphabetically
    startsWith.sort((a, b) => a.product_name.localeCompare(b.product_name));
    contains.sort((a, b) => a.product_name.localeCompare(b.product_name));

    const sortedProducts = [...startsWith, ...contains];

    if (sortedProducts.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    // Debug
    console.log('Search Term:', searchTerm);
    console.log('StartsWith:', startsWith.map(p => p.product_name));
    console.log('Contains:', contains.map(p => p.product_name));

    res.status(200).json(sortedProducts);
  } catch (error) {
    console.error('Error searching for products:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


module.exports = router;
