const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireAdminOrModerator, optionalAuth } = require('../middleware/auth.js');

const router = express.Router();

// Mock data for announcements (replace with MongoDB model later)
let announcements = [
  {
    id: '1',
    title: 'Welcome to Our Community!',
    content: 'We\'re excited to have you join our growing community. Feel free to explore and connect with other members.',
    author: 'Admin',
    authorId: 'admin-1',
    category: 'general',
    priority: 'normal',
    isPublished: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    title: 'Community Guidelines Updated',
    content: 'We\'ve updated our community guidelines to ensure a better experience for everyone. Please review the changes.',
    author: 'Moderator',
    authorId: 'mod-1',
    category: 'rules',
    priority: 'high',
    isPublished: true,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
];

// @route   GET /api/announcements
// @desc    Get all published announcements
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, priority, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Filter published announcements
    let filteredAnnouncements = announcements.filter(announcement => announcement.isPublished);
    
    // Apply category filter
    if (category) {
      filteredAnnouncements = filteredAnnouncements.filter(announcement => announcement.category === category);
    }
    
    // Apply priority filter
    if (priority) {
      filteredAnnouncements = filteredAnnouncements.filter(announcement => announcement.priority === priority);
    }
    
    // Apply search filter
    if (search) {
      filteredAnnouncements = filteredAnnouncements.filter(announcement => 
        announcement.title.toLowerCase().includes(search.toLowerCase()) ||
        announcement.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort announcements
    filteredAnnouncements.sort((a, b) => {
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
    const paginatedAnnouncements = filteredAnnouncements.slice(startIndex, endIndex);
    
    res.json({
      announcements: paginatedAnnouncements,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredAnnouncements.length / limit),
        totalAnnouncements: filteredAnnouncements.length,
        announcementsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({
      error: 'Failed to get announcements',
      message: 'Something went wrong while fetching announcements'
    });
  }
});

// @route   GET /api/announcements/:id
// @desc    Get announcement by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const announcement = announcements.find(a => a.id === req.params.id && a.isPublished);
    
    if (!announcement) {
      return res.status(404).json({
        error: 'Announcement not found',
        message: 'Announcement with this ID does not exist or is not published'
      });
    }
    
    res.json({ announcement });
    
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({
      error: 'Failed to get announcement',
      message: 'Something went wrong while fetching announcement'
    });
  }
});

// @route   POST /api/announcements
// @desc    Create new announcement (admin/moderator only)
// @access  Private/Admin/Moderator
router.post('/', authenticateToken, requireAdminOrModerator, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content is required and must be less than 5000 characters'),
  body('category')
    .isIn(['general', 'rules', 'events', 'updates', 'other'])
    .withMessage('Invalid category specified'),
  body('priority')
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority specified'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
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
    
    const { title, content, category, priority, isPublished = false } = req.body;
    
    // Create new announcement
    const newAnnouncement = {
      id: Date.now().toString(),
      title,
      content,
      category,
      priority,
      isPublished,
      author: `${req.user.firstName} ${req.user.lastName}`,
      authorId: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    announcements.push(newAnnouncement);
    
    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: newAnnouncement
    });
    
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({
      error: 'Failed to create announcement',
      message: 'Something went wrong while creating announcement'
    });
  }
});

// @route   PUT /api/announcements/:id
// @desc    Update announcement (admin/moderator only)
// @access  Private/Admin/Moderator
router.put('/:id', authenticateToken, requireAdminOrModerator, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be less than 5000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'rules', 'events', 'updates', 'other'])
    .withMessage('Invalid category specified'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Invalid priority specified'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
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
    
    const announcementIndex = announcements.findIndex(a => a.id === req.params.id);
    
    if (announcementIndex === -1) {
      return res.status(404).json({
        error: 'Update failed',
        message: 'Announcement not found'
      });
    }
    
    const announcement = announcements[announcementIndex];
    
    // Update fields
    if (req.body.title !== undefined) announcement.title = req.body.title;
    if (req.body.content !== undefined) announcement.content = req.body.content;
    if (req.body.category !== undefined) announcement.category = req.body.category;
    if (req.body.priority !== undefined) announcement.priority = req.body.priority;
    if (req.body.isPublished !== undefined) announcement.isPublished = req.body.isPublished;
    
    announcement.updatedAt = new Date();
    
    res.json({
      message: 'Announcement updated successfully',
      announcement
    });
    
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({
      error: 'Failed to update announcement',
      message: 'Something went wrong while updating announcement'
    });
  }
});

// @route   DELETE /api/announcements/:id
// @desc    Delete announcement (admin/moderator only)
// @access  Private/Admin/Moderator
router.delete('/:id', authenticateToken, requireAdminOrModerator, async (req, res) => {
  try {
    const announcementIndex = announcements.findIndex(a => a.id === req.params.id);
    
    if (announcementIndex === -1) {
      return res.status(404).json({
        error: 'Deletion failed',
        message: 'Announcement not found'
      });
    }
    
    announcements.splice(announcementIndex, 1);
    
    res.json({
      message: 'Announcement deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({
      error: 'Failed to delete announcement',
      message: 'Something went wrong while deleting announcement'
    });
  }
});

// @route   GET /api/announcements/categories/list
// @desc    Get list of available categories
// @access  Public
router.get('/categories/list', (req, res) => {
  const categories = [
    { value: 'general', label: 'General' },
    { value: 'rules', label: 'Rules & Guidelines' },
    { value: 'events', label: 'Events' },
    { value: 'updates', label: 'Updates' },
    { value: 'other', label: 'Other' }
  ];
  
  res.json({ categories });
});

// @route   GET /api/announcements/priorities/list
// @desc    Get list of available priorities
// @access  Public
router.get('/priorities/list', (req, res) => {
  const priorities = [
    { value: 'low', label: 'Low', color: 'text-gray-500' },
    { value: 'normal', label: 'Normal', color: 'text-blue-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' }
  ];
  
  res.json({ priorities });
});

module.exports = router;
