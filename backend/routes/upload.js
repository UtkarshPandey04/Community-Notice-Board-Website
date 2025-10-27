const express = require('express');
const multer = require('multer');
const { Readable } = require('stream');
const { v2: cloudinary } = require('cloudinary');
const { authenticateToken } = require('../middleware/auth.js');

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage for Multer
const storage = multer.memoryStorage();
const upload = multer({ storage });

// @route   GET /api/upload
// @desc    Get upload endpoint info
// @access  Private
router.get('/', authenticateToken, (req, res) => {
  res.status(405).json({
    error: 'Method Not Allowed',
    message: 'This endpoint only supports POST requests for file uploads.',
  });
});

// @route   POST /api/upload
// @desc    Upload an image
// @access  Private
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: 'uploads' }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
      Readable.from(req.file.buffer).pipe(stream);
    });

    res.status(200).json({ url: result.secure_url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ message: `Upload to Cloudinary failed: ${err.message}` });
  }
});

module.exports = router;
