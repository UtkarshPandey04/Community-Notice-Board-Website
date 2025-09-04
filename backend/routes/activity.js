import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import ActivityLog from '../models/ActivityLog.js';

const router = express.Router();

// @desc    Get all activity logs
// @route   GET /api/activity
// @access  Private/Admin
router.get('/', authenticateToken, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized, admin only' });
  }

  try {
    const logs = await ActivityLog.find({}).sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
