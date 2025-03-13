const express = require('express');
const Category = require('../models/CategoryModel');
const upload = require('../middlewares/upload'); // Multer middleware for file uploads
const { verifyToken } = require('../controllers/verifyToken');
const router = express.Router();

// Create a new category
router.post('/category', verifyToken,upload.single('photo'),verifyToken, async (req, res) => {
  try {
    const { category } = req.body;

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    // Check if category already exists
    let existingCategory = await Category.findOne({ category });

    if (existingCategory) {
      return res.status(400).json({ error: "Category already exists", category: existingCategory });
    }

    const photoPath = req.file ? req.file.path : null;

    // Create new category with a unique category_id for this category type
    const newCategory = new Category({
      category,
      photo: photoPath,
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get all categories
router.get('/category',verifyToken, async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a category by category_id
router.get('/category/:category_id',verifyToken, async (req, res) => {
  try {
    const { category_id } = req.params;
    const category = await Category.findOne({ category_id });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a category by category_id
router.delete('/category/:category_id', verifyToken,async (req, res) => {
  try {
    const { category_id } = req.params;
    const category = await Category.findOneAndDelete({ category_id });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a category by category_id
router.put('/category/:category_id', verifyToken, upload.single('photo'), async (req, res) => {
  try {
    const { category_id } = req.params;
    const { category } = req.body;

    const photoPath = req.file ? req.file.path : undefined;

    const updatedData = { category };
    if (photoPath) {
      updatedData.photo = photoPath;
    }

    const updatedCategory = await Category.findOneAndUpdate(
      { category_id },
      updatedData,
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({ message: 'Category updated successfully', category: updatedCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
