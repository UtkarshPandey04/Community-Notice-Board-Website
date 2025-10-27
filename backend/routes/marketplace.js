const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdminOrModerator, optionalAuth } = require('../middleware/auth.js');

const router = express.Router();

// Mock data for marketplace items (replace with MongoDB model later)
let marketplaceItems = [
  {
    id: '1',
    title: 'Community T-Shirt',
    description: 'High-quality cotton t-shirt with our community logo. Available in multiple sizes.',
    price: 25.00,
    currency: 'USD',
    category: 'clothing',
    condition: 'new',
    seller: 'Admin',
    sellerId: 'admin-1',
    images: ['https://example.com/tshirt1.jpg'],
    location: 'Community Store',
    isAvailable: true,
    isApproved: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// @route   GET /api/marketplace
// @desc    Get all approved marketplace items
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, condition, search, sortBy = 'createdAt', sortOrder = 'desc', minPrice, maxPrice } = req.query;
    
    // Filter approved and available items
    let filteredItems = marketplaceItems.filter(item => item.isApproved && item.isAvailable);
    
    // Apply category filter
    if (category) {
      filteredItems = filteredItems.filter(item => item.category === category);
    }
    
    // Apply condition filter
    if (condition) {
      filteredItems = filteredItems.filter(item => item.condition === condition);
    }
    
    // Apply price range filter
    if (minPrice) {
      filteredItems = filteredItems.filter(item => item.price >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filteredItems = filteredItems.filter(item => item.price <= parseFloat(maxPrice));
    }
    
    // Apply search filter
    if (search) {
      filteredItems = filteredItems.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.location.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort items
    filteredItems.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (sortOrder === 'desc') {
        return new Date(bValue) - new Date(aValue);
      } else {
        return new Date(aValue) - new Date(bValue);
      }
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);
    
    res.json({
      items: paginatedItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredItems.length / limit),
        totalItems: filteredItems.length,
        itemsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get marketplace items error:', error);
    res.status(500).json({
      error: 'Failed to get marketplace items',
      message: 'Something went wrong while fetching marketplace items'
    });
  }
});

// @route   GET /api/marketplace/:id
// @desc    Get marketplace item by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const item = marketplaceItems.find(i => i.id === req.params.id && i.isApproved);
    
    if (!item) {
      return res.status(404).json({
        error: 'Item not found',
        message: 'Marketplace item with this ID does not exist or is not approved'
      });
    }
    
    res.json({ item });
    
  } catch (error) {
    console.error('Get marketplace item error:', error);
    res.status(500).json({
      error: 'Failed to get marketplace item',
      message: 'Something went wrong while fetching marketplace item'
    });
  }
});

// @route   POST /api/marketplace
// @desc    Create new marketplace item (authenticated users only)
// @access  Private
router.post('/', authenticateToken, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description is required and must be less than 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('currency')
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .withMessage('Invalid currency specified'),
  body('category')
    .isIn(['clothing', 'electronics', 'books', 'home', 'sports', 'other'])
    .withMessage('Invalid category specified'),
  body('condition')
    .isIn(['new', 'like-new', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition specified'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location is required and must be less than 200 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const { title, description, price, currency, category, condition, images = [], location } = req.body;
    
    // Create new marketplace item
    const newItem = {
      id: Date.now().toString(),
      title,
      description,
      price: parseFloat(price),
      currency,
      category,
      condition,
      seller: `${req.user.firstName} ${req.user.lastName}`,
      sellerId: req.user._id,
      images,
      location,
      isAvailable: true,
      isApproved: req.user.role === 'admin' || req.user.role === 'moderator', // Auto-approve for admins/moderators
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    marketplaceItems.push(newItem);
    
    res.status(201).json({
      message: 'Marketplace item created successfully',
      item: newItem
    });
    
  } catch (error) {
    console.error('Create marketplace item error:', error);
    res.status(500).json({
      error: 'Failed to create marketplace item',
      message: 'Something went wrong while creating marketplace item'
    });
  }
});

// @route   PUT /api/marketplace/:id
// @desc    Update marketplace item (owner or admin/moderator only)
// @access  Private
router.put('/:id', authenticateToken, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('currency')
    .optional()
    .isIn(['USD', 'EUR', 'GBP', 'CAD', 'AUD'])
    .withMessage('Invalid currency specified'),
  body('category')
    .optional()
    .isIn(['clothing', 'electronics', 'books', 'home', 'sports', 'other'])
    .withMessage('Invalid category specified'),
  body('condition')
    .optional()
    .isIn(['new', 'like-new', 'good', 'fair', 'poor'])
    .withMessage('Invalid condition specified'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be less than 200 characters'),
  body('isAvailable')
    .optional()
    .isBoolean()
    .withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const itemIndex = marketplaceItems.findIndex(i => i.id === req.params.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Update failed',
        message: 'Marketplace item not found'
      });
    }
    
    const item = marketplaceItems[itemIndex];
    
    // Check if user can update this item
    if (req.user.role !== 'admin' && req.user.role !== 'moderator' && item.sellerId !== req.user._id) {
      return res.status(403).json({
        error: 'Update failed',
        message: 'You can only update your own marketplace items'
      });
    }
    
    // Update fields
    if (req.body.title !== undefined) item.title = req.body.title;
    if (req.body.description !== undefined) item.description = req.body.description;
    if (req.body.price !== undefined) item.price = parseFloat(req.body.price);
    if (req.body.currency !== undefined) item.currency = req.body.currency;
    if (req.body.category !== undefined) item.category = req.body.category;
    if (req.body.condition !== undefined) item.condition = req.body.condition;
    if (req.body.images !== undefined) item.images = req.body.images;
    if (req.body.location !== undefined) item.location = req.body.location;
    if (req.body.isAvailable !== undefined) item.isAvailable = req.body.isAvailable;
    
    item.updatedAt = new Date();
    
    res.json({
      message: 'Marketplace item updated successfully',
      item
    });
    
  } catch (error) {
    console.error('Update marketplace item error:', error);
    res.status(500).json({
      error: 'Failed to update marketplace item',
      message: 'Something went wrong while updating marketplace item'
    });
  }
});

// @route   DELETE /api/marketplace/:id
// @desc    Delete marketplace item (owner or admin/moderator only)
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const itemIndex = marketplaceItems.findIndex(i => i.id === req.params.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({
        error: 'Deletion failed',
        message: 'Marketplace item not found'
      });
    }
    
    const item = marketplaceItems[itemIndex];
    
    // Check if user can delete this item
    if (req.user.role !== 'admin' && req.user.role !== 'moderator' && item.sellerId !== req.user._id) {
      return res.status(403).json({
        error: 'Deletion failed',
        message: 'You can only delete your own marketplace items'
      });
    }
    
    marketplaceItems.splice(itemIndex, 1);
    
    res.json({
      message: 'Marketplace item deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete marketplace item error:', error);
    res.status(500).json({
      error: 'Failed to delete marketplace item',
      message: 'Something went wrong while deleting marketplace item'
    });
  }
});

// @route   POST /api/marketplace/:id/approve
// @desc    Approve marketplace item (admin/moderator only)
// @access  Private/Admin/Moderator
router.post('/:id/approve', authenticateToken, requireAdminOrModerator, async (req, res) => {
  try {
    const item = marketplaceItems.find(i => i.id === req.params.id);
    
    if (!item) {
      return res.status(404).json({
        error: 'Approval failed',
        message: 'Marketplace item not found'
      });
    }
    
    item.isApproved = true;
    item.updatedAt = new Date();
    
    res.json({
      message: 'Marketplace item approved successfully'
    });
    
  } catch (error) {
    console.error('Approve marketplace item error:', error);
    res.status(500).json({
      error: 'Failed to approve marketplace item',
      message: 'Something went wrong while approving marketplace item'
    });
  }
});

// @route   GET /api/marketplace/categories/list
// @desc    Get list of available categories
// @access  Public
router.get('/categories/list', (req, res) => {
  const categories = [
    { value: 'clothing', label: 'Clothing & Apparel' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'books', label: 'Books & Media' },
    { value: 'home', label: 'Home & Garden' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'other', label: 'Other' }
  ];
  
  res.json({ categories });
});

// @route   GET /api/marketplace/conditions/list
// @desc    Get list of available conditions
// @access  Public
router.get('/conditions/list', (req, res) => {
  const conditions = [
    { value: 'new', label: 'New', color: 'text-green-600' },
    { value: 'like-new', label: 'Like New', color: 'text-blue-600' },
    { value: 'good', label: 'Good', color: 'text-yellow-600' },
    { value: 'fair', label: 'Fair', color: 'text-orange-600' },
    { value: 'poor', label: 'Poor', color: 'text-red-600' }
  ];
  
  res.json({ conditions });
});

module.exports = router;
