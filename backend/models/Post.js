const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String
  }],
  deadline: {
    type: Date,
    default: null
  },
  // NAYA FIELD: Image/Video store karne ke liye
  media: {
    type: String, 
    default: null
  },
  shareCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', postSchema);