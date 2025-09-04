import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, requireAdminOrModerator, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Mock data for events (replace with MongoDB model later)
let events = [
  {
    id: '1',
    title: 'Community Meetup',
    description: 'Join us for our monthly community meetup where we discuss upcoming features and community feedback.',
    date: new Date('2024-02-15T18:00:00Z'),
    endDate: new Date('2024-02-15T20:00:00Z'),
    location: 'Community Center',
    type: 'meetup',
    isOnline: false,
    maxAttendees: 50,
    currentAttendees: 25,
    organizer: 'Admin',
    organizerId: 'admin-1',
    status: 'upcoming',
    isPublished: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// @route   GET /api/events
// @desc    Get all published events
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, search, sortBy = 'date', sortOrder = 'asc' } = req.query;
    
    // Filter published events
    let filteredEvents = events.filter(event => event.isPublished);
    
    // Apply type filter
    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }
    
    // Apply status filter
    if (status) {
      filteredEvents = filteredEvents.filter(event => event.status === status);
    }
    
    // Apply search filter
    if (search) {
      filteredEvents = filteredEvents.filter(event => 
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase()) ||
        event.location.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Sort events
    filteredEvents.sort((a, b) => {
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
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);
    
    res.json({
      events: paginatedEvents,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredEvents.length / limit),
        totalEvents: filteredEvents.length,
        eventsPerPage: parseInt(limit)
      }
    });
    
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      error: 'Failed to get events',
      message: 'Something went wrong while fetching events'
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const event = events.find(e => e.id === req.params.id && e.isPublished);
    
    if (!event) {
      return res.status(404).json({
        error: 'Event not found',
        message: 'Event with this ID does not exist or is not published'
      });
    }
    
    res.json({ event });
    
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      error: 'Failed to get event',
      message: 'Something went wrong while fetching event'
    });
  }
});

// @route   POST /api/events
// @desc    Create new event (admin/moderator only)
// @access  Private/Admin/Moderator
router.post('/', authenticateToken, requireAdminOrModerator, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Description is required and must be less than 2000 characters'),
  body('date')
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location is required and must be less than 200 characters'),
  body('type')
    .isIn(['meetup', 'workshop', 'conference', 'webinar', 'other'])
    .withMessage('Invalid event type specified'),
  body('isOnline')
    .optional()
    .isBoolean()
    .withMessage('isOnline must be a boolean'),
  body('maxAttendees')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attendees must be a positive integer'),
  body('status')
    .isIn(['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'])
    .withMessage('Invalid status specified'),
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
    
    const { 
      title, 
      description, 
      date, 
      endDate, 
      location, 
      type, 
      isOnline = false, 
      maxAttendees, 
      status = 'draft',
      isPublished = false 
    } = req.body;
    
    // Create new event
    const newEvent = {
      id: Date.now().toString(),
      title,
      description,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      location,
      type,
      isOnline,
      maxAttendees: maxAttendees || null,
      currentAttendees: 0,
      organizer: `${req.user.firstName} ${req.user.lastName}`,
      organizerId: req.user._id,
      status,
      isPublished,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    events.push(newEvent);
    
    res.status(201).json({
      message: 'Event created successfully',
      event: newEvent
    });
    
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      error: 'Failed to create event',
      message: 'Something went wrong while creating event'
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event (admin/moderator only)
// @access  Private/Admin/Moderator
router.put('/:id', authenticateToken, requireAdminOrModerator, [
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
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
  body('location')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Location must be less than 200 characters'),
  body('type')
    .optional()
    .isIn(['meetup', 'workshop', 'conference', 'webinar', 'other'])
    .withMessage('Invalid event type specified'),
  body('isOnline')
    .optional()
    .isBoolean()
    .withMessage('isOnline must be a boolean'),
  body('maxAttendees')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max attendees must be a positive integer'),
  body('status')
    .optional()
    .isIn(['draft', 'upcoming', 'ongoing', 'completed', 'cancelled'])
    .withMessage('Invalid status specified'),
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
    
    const eventIndex = events.findIndex(e => e.id === req.params.id);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        error: 'Update failed',
        message: 'Event not found'
      });
    }
    
    const event = events[eventIndex];
    
    // Update fields
    if (req.body.title !== undefined) event.title = req.body.title;
    if (req.body.description !== undefined) event.description = req.body.description;
    if (req.body.date !== undefined) event.date = new Date(req.body.date);
    if (req.body.endDate !== undefined) event.endDate = req.body.endDate ? new Date(req.body.endDate) : null;
    if (req.body.location !== undefined) event.location = req.body.location;
    if (req.body.type !== undefined) event.type = req.body.type;
    if (req.body.isOnline !== undefined) event.isOnline = req.body.isOnline;
    if (req.body.maxAttendees !== undefined) event.maxAttendees = req.body.maxAttendees;
    if (req.body.status !== undefined) event.status = req.body.status;
    if (req.body.isPublished !== undefined) event.isPublished = req.body.isPublished;
    
    event.updatedAt = new Date();
    
    res.json({
      message: 'Event updated successfully',
      event
    });
    
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      error: 'Failed to update event',
      message: 'Something went wrong while updating event'
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event (admin/moderator only)
// @access  Private/Admin/Moderator
router.delete('/:id', authenticateToken, requireAdminOrModerator, async (req, res) => {
  try {
    const eventIndex = events.findIndex(e => e.id === req.params.id);
    
    if (eventIndex === -1) {
      return res.status(404).json({
        error: 'Deletion failed',
        message: 'Event not found'
      });
    }
    
    events.splice(eventIndex, 1);
    
    res.json({
      message: 'Event deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      error: 'Failed to delete event',
      message: 'Something went wrong while deleting event'
    });
  }
});

// @route   GET /api/events/types/list
// @desc    Get list of available event types
// @access  Public
router.get('/types/list', (req, res) => {
  const types = [
    { value: 'meetup', label: 'Meetup' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'conference', label: 'Conference' },
    { value: 'webinar', label: 'Webinar' },
    { value: 'other', label: 'Other' }
  ];
  
  res.json({ types });
});

// @route   GET /api/events/statuses/list
// @desc    Get list of available event statuses
// @access  Public
router.get('/statuses/list', (req, res) => {
  const statuses = [
    { value: 'draft', label: 'Draft', color: 'text-gray-500' },
    { value: 'upcoming', label: 'Upcoming', color: 'text-blue-600' },
    { value: 'ongoing', label: 'Ongoing', color: 'text-green-600' },
    { value: 'completed', label: 'Completed', color: 'text-purple-600' },
    { value: 'cancelled', label: 'Cancelled', color: 'text-red-600' }
  ];
  
  res.json({ statuses });
});

export default router;
