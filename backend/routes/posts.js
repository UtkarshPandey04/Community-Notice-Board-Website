const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth.js');
const Post = require('../models/Post.js');

const router = express.Router();

// @route   GET /api/posts
// @desc    Get all public posts, optionally filtered by category
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, limit } = req.query;
    const filter = { visibility: 'public' };

    if (category) {
      filter.category = category;
    }

    let query = Post.find(filter).sort({ createdAt: -1 });

    if (limit) {
      query = query.limit(parseInt(limit, 10));
    }

    const posts = await query;
    res.json({
      posts: posts,
      total: posts.length,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      error: 'Failed to fetch posts',
      message: 'Something went wrong while fetching posts'
    });
  }
});

// @route   GET /api/posts/all
// @desc    Get all posts (admin only)
// @access  Private/Admin
router.get('/all', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const allPosts = await Post.find({}).sort({ createdAt: -1 });
    res.json({
      posts: allPosts,
      total: allPosts.length
    });
  } catch (error) {
    console.error('Error fetching all posts:', error);
    res.status(500).json({
      error: 'Failed to fetch all posts',
      message: 'Something went wrong'
    });
  }
});

// @route   GET /api/posts/stats
// @desc    Get post statistics (admin only)
// @access  Private/Admin
router.get('/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const totalPosts = await Post.countDocuments();
    const postsByCategory = await Post.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    const highPriorityPosts = await Post.countDocuments({ priority: 'high' });

    res.json({ totalPosts, postsByCategory, highPriorityPosts });
  } catch (error) {
    console.error('Error fetching post stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by specific user
// @access  Private
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role, _id } = req.user;

    // Regular users can only see their own posts, admins can see any user's posts.
    if (role !== 'admin' && _id.toString() !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own posts',
      });
    }

    const userPosts = await Post.find({ authorId: userId }).sort({ createdAt: -1 });
    res.json({
      posts: userPosts,
      total: userPosts.length
    });
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      error: 'Failed to fetch user posts',
      message: 'Something went wrong while fetching user posts'
    });
  }
});

// @route   GET /api/posts/categories/list
// @desc    Get list of available categories
// @access  Public
router.get('/categories/list', (req, res) => {
  res.json({
    categories: [
      'general',
      'announcement',
      'event',
      'marketplace',
      'question',
      'discussion'
    ]
  });
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Private (but checks visibility)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Post with this ID does not exist'
      });
    }
    
    // Check visibility permissions
    if (post.visibility === 'private') {
      if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Access denied',
          message: 'This post is private and you do not have permission to view it'
        });
      }
    }
    
    res.json({ post });
  } catch (error) {
    console.error('Error fetching post:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({
      error: 'Failed to fetch post',
      message: 'Something went wrong while fetching post'
    });
  }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', authenticateToken, [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  body('category')
    .isIn(['general', 'announcement', 'event', 'marketplace', 'question', 'discussion'])
    .withMessage('Invalid category'),
  body('visibility')
    .isIn(['public', 'community', 'private'])
    .withMessage('Invalid visibility setting'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority setting')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

  try {
    const { title, content, category, visibility, priority } = req.body;
    const { _id: authorId, firstName, lastName, role: authorRole } = req.user;

    // Create new post
    const newPost = new Post({
      title,
      content,
      category,
      visibility,
      priority,
      authorId,
      authorName: `${firstName} ${lastName}`,
      authorRole
    });

    await newPost.save();

    res.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      error: 'Failed to create post',
      message: 'Something went wrong while creating post'
    });
  }
});

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Private (post owner or admin)
router.put('/:id', authenticateToken, [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'announcement', 'event', 'marketplace', 'question', 'discussion'])
    .withMessage('Invalid category'),
  body('visibility')
    .optional()
    .isIn(['public', 'community', 'private'])
    .withMessage('Invalid visibility setting'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority setting')
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Post with this ID does not exist'
      });
    }

    // Check permissions
    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only edit your own posts'
      });
    }

    // Update post
    const { title, content, category, visibility, priority } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (category) post.category = category;
    if (visibility) post.visibility = visibility;
    if (priority) post.priority = priority;

    const updatedPost = await post.save();
    
    res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });

  } catch (error) {
    console.error('Error updating post:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(500).json({
      error: 'Failed to update post',
      message: 'Something went wrong while updating post'
    });
  }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private (post owner or admin)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    
    if (!post) {
      return res.status(404).json({
        error: 'Post not found',
        message: 'Post with this ID does not exist'
      });
    }

    // Check permissions
    if (post.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own posts'
      });
    }

    // Remove post
    await post.deleteOne();

    res.json({
      message: 'Post deleted successfully'
    });

  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Post not found' });
    }
    console.error('Error deleting post:', error);
    res.status(500).json({
      error: 'Failed to delete post',
      message: 'Something went wrong while deleting post'
    });
  }
});


// @route   PUT /api/posts/:id/like
// @desc    Like or unlike a post
// @access  Private
router.put('/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const userId = req.user._id.toString();
    const likeIndex = post.likes.findIndex(id => id.toString() === userId);

    if (likeIndex > -1) {
      // User has already liked the post, so unlike it
      post.likes.splice(likeIndex, 1);
    } else {
      // User has not liked the post, so like it
      post.likes.push(userId);
    }

    await post.save();
    res.json({ likes: post.likes });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post('/:id/comment', authenticateToken, [
  body('content', 'Comment content is required').not().isEmpty().trim().isLength({ max: 1000 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      userId: req.user._id,
      userName: `${req.user.firstName} ${req.user.lastName}`,
      content: req.body.content
    };

    post.comments.unshift(newComment);
    await post.save();
    res.json(post.comments);

  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

// @route   DELETE /api/posts/:id/comment/:commentId
// @desc    Delete a comment from a post
// @access  Private (comment owner or admin)
router.delete('/:id/comment/:commentId', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    if (comment.authorId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'User not authorized to delete this comment' });
    }

    await comment.deleteOne();
    await post.save();

    res.json({ message: 'Comment deleted successfully', comments: post.comments });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'Server Error' });
  }
});

module.exports = router;
