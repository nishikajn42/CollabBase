const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper to authenticate
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: "Access denied" });
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

// 1. GET ALL POSTS
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'fullName handle profilePicture') // Author ki details attach karna
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// 2. CREATE A NEW POST (FIXED: Added 'media' here)
router.post('/', authenticate, async (req, res) => {
  // Yahan req.body se 'media' nikalna zaroori tha, jo pehle miss ho gaya tha
  const { content, tags, deadline, media } = req.body; 

  if (!content && !media) {
    return res.status(400).json({ error: "Post cannot be empty" });
  }

  try {
    const newPost = new Post({
      author: req.user.sub, // JWT token se mili hui user ID
      content: content || "",
      tags: tags || [],
      deadline: deadline || null,
      media: media || null // Yahan media save ho raha hai!
    });

    const savedPost = await newPost.save();
    
    // Naye post ko front-end ke liye properly format karke return karna
    const populatedPost = await Post.findById(savedPost._id).populate('author', 'fullName handle profilePicture');
    res.status(201).json(populatedPost);
  } catch (error) {
    console.error("Post Creation Error:", error);
    res.status(500).json({ error: "Failed to create post" });
  }
});

// 3. DELETE A POST
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    // Check if the user trying to delete is the author
    if (post.author.toString() !== req.user.sub) {
      return res.status(403).json({ error: "Unauthorized to delete this post" });
    }

    await Post.findByIdAndDelete(req.params.id);
    res.json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// 4. SHARE POST COUNT UPDATE
router.put('/:id/share', async (req, res) => {
  try {
    await Post.findByIdAndUpdate(req.params.id, { $inc: { shareCount: 1 } });
    res.json({ message: "Share count updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update share count" });
  }
});

module.exports = router;