const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    minlength: [1, 'Title cannot be empty']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true,
    maxlength: [5000, 'Content cannot exceed 5000 characters'],
    minlength: [1, 'Content cannot be empty']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['general', 'announcement', 'event', 'marketplace', 'question', 'discussion'],
      message: 'Invalid category'
    }
  },
  visibility: {
    type: String,
    required: [true, 'Visibility is required'],
    enum: {
      values: ['public', 'community', 'private'],
      message: 'Invalid visibility setting'
    },
    default: 'public'
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author ID is required']
  },
  authorName: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  authorRole: {
    type: String,
    required: [true, 'Author role is required'],
    enum: ['user', 'admin', 'moderator']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    userName: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isPublished: {
    type: Boolean,
    default: true
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Index for better query performance
postSchema.index({ authorId: 1 });
postSchema.index({ category: 1 });
postSchema.index({ visibility: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ isPublished: 1 });

// Static method to find posts by category
postSchema.statics.findByCategory = function(category) {
  return this.find({ category, isPublished: true });
};

// Static method to find public posts
postSchema.statics.findPublicPosts = function() {
  return this.find({ visibility: 'public', isPublished: true });
};

// Instance method to add a like
postSchema.methods.addLike = function(userId) {
  if (!this.likes.includes(userId)) {
    this.likes.push(userId);
    return this.save();
  }
  return this;
};

// Instance method to remove a like
postSchema.methods.removeLike = function(userId) {
  this.likes = this.likes.filter(id => id.toString() !== userId.toString());
  return this.save();
};

// Instance method to add a comment
postSchema.methods.addComment = function(userId, userName, content) {
  this.comments.push({
    userId,
    userName,
    content,
    createdAt: new Date()
  });
  return this.save();
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
