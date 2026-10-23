const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    default: "" 
  },
  media: { 
    type: String, 
    default: null // Image/Video store karne ke liye
  },
  tags: [{ 
    type: String 
  }],
  deadline: { 
    type: Date, 
    default: null 
  },
  shareCount: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);