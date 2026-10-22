const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  content: { type: String, required: true, trim: true },
  tags: [{ type: String, trim: true }],
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  shareCount: { type: Number, default: 0 },
  deadline: { type: Date } // Naya field for recruitment deadline
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);