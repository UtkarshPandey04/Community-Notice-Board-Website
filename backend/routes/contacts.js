import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdminOrModerator, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Mock data for contacts (replace with MongoDB model later)
let contacts = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    company: 'Tech Corp',
    position: 'Software Engineer',
    department: 'Engineering',
    location: 'San Francisco, CA',
    isActive: true,
    notes: 'Lead developer for the main project',
    tags: ['developer', 'senior', 'frontend'],
    createdBy: 'Admin',
    createdById: 'admin-1',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// @route   GET /api/contacts
// @desc    Get all contacts (with optional filtering)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, department, location, search, tags, sortBy = 'name', sortOrder = 'asc' } = req.query;
    
    // Start with all contacts
    let filteredContacts = [...contacts];
    
    // Apply department filter
    if (department) {
      filteredContacts = filteredContacts.filter(contact => contact.department === department);
    }
    
    // Apply location filter
    if (location) {
      filteredContacts = filteredContacts.filter(contact => 
        contact.location.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Apply tags filter
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filteredContacts = filteredContacts.filter(contact => 
        tagArray.some(tag => contact.tags.includes(tag))
      );
    }
    
    // Apply search filter
    if (search) {
      filteredContacts = filteredContacts.filter(contact => 
        contact.name.toLowerCase().includes(search.toLowerCase()) ||
        contact.email.toLowerCase().includes(search.toLowerCase()) ||
        contact.company.toLowerCase().includes(search.toLowerCase()) ||
        contact.position.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort contacts
    filteredContacts.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortOrder === 'desc') {
          return bValue.localeCompare(aValue);
        } else {
          return aValue.localeCompare(bValue);
        }
      } else {
        if (sortOrder === 'desc') {
          return new Date(bValue) - new Date(aValue);
        } else {
          return new Date(aValue) - new Date(bValue);
        }
      }
    });
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedContacts = filteredContacts.slice(startIndex, endIndex);
    
    res.json({
      contacts: paginatedContacts,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredContacts.length / limit),
        totalContacts: filteredContacts.length,
        contactsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      error: 'Failed to get contacts',
      message: 'Something went wrong while fetching contacts'
    });
  }
});

// @route   GET /api/contacts/:id
// @desc    Get contact by ID
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const contact = contacts.find(c => c.id === req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'Contact with this ID does not exist'
      });
    }
    
    res.json({ contact });
    
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      error: 'Failed to get contact',
      message: 'Something went wrong while fetching contact'
    });
  }
});

// @route   POST /api/contacts
// @desc    Create new contact
// @access  Private
router.post('/', authenticateToken, [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company must be less than 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Position must be less than 100 characters'),
  body('department')
    .optional()
    .isIn(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Other'])
    .withMessage('Invalid department specified'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
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
    
    const { 
      name, 
      email, 
      phone, 
      company, 
      position, 
      department, 
      location, 
      notes, 
      tags = [] 
    } = req.body;
    
    // Check if contact with this email already exists
    const existingContact = contacts.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (existingContact) {
      return res.status(400).json({
        error: 'Contact creation failed',
        message: 'Contact with this email already exists'
      });
    }
    
    // Create new contact
    const newContact = {
      id: Date.now().toString(),
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      company: company || null,
      position: position || null,
      department: department || null,
      location: location || null,
      isActive: true,
      notes: notes || null,
      tags: tags || [],
      createdBy: `${req.user.firstName} ${req.user.lastName}`,
      createdById: req.user._id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    contacts.push(newContact);
    
    res.status(201).json({
      message: 'Contact created successfully',
      contact: newContact
    });
    
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      error: 'Failed to create contact',
      message: 'Something went wrong while creating contact'
    });
  }
});

// @route   PUT /api/contacts/:id
// @desc    Update contact
// @access  Private
router.put('/:id', authenticateToken, [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .trim()
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
  body('company')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company must be less than 100 characters'),
  body('position')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Position must be less than 100 characters'),
  body('department')
    .optional()
    .isIn(['Engineering', 'Marketing', 'Sales', 'HR', 'Finance', 'Operations', 'Other'])
    .withMessage('Invalid department specified'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
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
    
    const contactIndex = contacts.findIndex(c => c.id === req.params.id);
    
    if (contactIndex === -1) {
      return res.status(404).json({
        error: 'Update failed',
        message: 'Contact not found'
      });
    }
    
    const contact = contacts[contactIndex];
    
    // Check if email is being changed and if it conflicts with existing contact
    if (req.body.email && req.body.email.toLowerCase() !== contact.email.toLowerCase()) {
      const existingContact = contacts.find(c => 
        c.id !== req.params.id && c.email.toLowerCase() === req.body.email.toLowerCase()
      );
      if (existingContact) {
        return res.status(400).json({
          error: 'Update failed',
          message: 'Contact with this email already exists'
        });
      }
    }
    
    // Update fields
    if (req.body.name !== undefined) contact.name = req.body.name;
    if (req.body.email !== undefined) contact.email = req.body.email.toLowerCase();
    if (req.body.phone !== undefined) contact.phone = req.body.phone;
    if (req.body.company !== undefined) contact.company = req.body.company;
    if (req.body.position !== undefined) contact.position = req.body.position;
    if (req.body.department !== undefined) contact.department = req.body.department;
    if (req.body.location !== undefined) contact.location = req.body.location;
    if (req.body.notes !== undefined) contact.notes = req.body.notes;
    if (req.body.tags !== undefined) contact.tags = req.body.tags;
    if (req.body.isActive !== undefined) contact.isActive = req.body.isActive;
    
    contact.updatedAt = new Date();
    
    res.json({
      message: 'Contact updated successfully',
      contact
    });
    
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      error: 'Failed to update contact',
      message: 'Something went wrong while updating contact'
    });
  }
});

// @route   DELETE /api/contacts/:id
// @desc    Delete contact
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const contactIndex = contacts.findIndex(c => c.id === req.params.id);
    
    if (contactIndex === -1) {
      return res.status(404).json({
        error: 'Deletion failed',
        message: 'Contact not found'
      });
    }
    
    contacts.splice(contactIndex, 1);
    
    res.json({
      message: 'Contact deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      error: 'Failed to delete contact',
      message: 'Something went wrong while deleting contact'
    });
  }
});

// @route   GET /api/contacts/departments/list
// @desc    Get list of available departments
// @access  Public
router.get('/departments/list', (req, res) => {
  const departments = [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'HR', label: 'Human Resources' },
    { value: 'Finance', label: 'Finance' },
    { value: 'Operations', label: 'Operations' },
    { value: 'Other', label: 'Other' }
  ];
  
  res.json({ departments });
});

// @route   GET /api/contacts/tags/list
// @desc    Get list of available tags
// @access  Public
router.get('/tags/list', (req, res) => {
  const tags = [
    { value: 'developer', label: 'Developer', color: 'text-blue-600' },
    { value: 'senior', label: 'Senior', color: 'text-green-600' },
    { value: 'frontend', label: 'Frontend', color: 'text-purple-600' },
    { value: 'backend', label: 'Backend', color: 'text-orange-600' },
    { value: 'manager', label: 'Manager', color: 'text-red-600' },
    { value: 'lead', label: 'Lead', color: 'text-indigo-600' },
    { value: 'junior', label: 'Junior', color: 'text-gray-600' }
  ];
  
  res.json({ tags });
});

// @route   GET /api/contacts/stats/overview
// @desc    Get contacts statistics overview
// @access  Private
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const totalContacts = contacts.length;
    const activeContacts = contacts.filter(c => c.isActive).length;
    const inactiveContacts = contacts.filter(c => !c.isActive).length;
    
    const departmentStats = contacts.reduce((acc, contact) => {
      const dept = contact.department || 'Unspecified';
      acc[dept] = (acc[dept] || 0) + 1;
      return acc;
    }, {});
    
    const tagStats = contacts.reduce((acc, contact) => {
      contact.tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});
    
    const recentContacts = contacts
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
    
    res.json({
      overview: {
        totalContacts,
        activeContacts,
        inactiveContacts
      },
      departmentDistribution: departmentStats,
      tagDistribution: tagStats,
      recentContacts
    });
    
  } catch (error) {
    console.error('Get contacts stats error:', error);
    res.status(500).json({
      error: 'Failed to get contacts statistics',
      message: 'Something went wrong while fetching contacts statistics'
    });
  }
});

export default router;
