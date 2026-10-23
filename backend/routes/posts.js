const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const requireAuth = require('../middleware/requireAuth');
const Post = require('../models/Post');

const isValidPostId = id => mongoose.Types.ObjectId.isValid(id);
const isValidTags = tags =>
  tags === undefined || (Array.isArray(tags) && tags.every(tag => typeof tag === 'string'));
const isValidDeadline = deadline =>
  deadline === undefined || deadline === null || (
    (typeof deadline === 'string' || deadline instanceof Date) &&
    !Number.isNaN(new Date(deadline).getTime())
  );

// FETCH POSTS
router.get('/', async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate('author', 'fullName handle profilePicture');

    return res.status(200).json(posts);
  } catch (error) {
    console.error('Fetch Posts Error:', error);
    return res.status(500).json({ error: 'Failed to fetch posts.' });
  }
});

// CREATE POST (FIXED: Added media & relaxed text validation)
router.post('/', requireAuth, async (req, res) => {
  const { content, tags, deadline, media } = req.body; // MEDIA EXTRACT KIYA

  // Validation: Post mein ya toh Text hona chahiye ya Media
  if ((!content || !content.trim()) && !media) {
    return res.status(400).json({ error: 'Post must contain text or media.' });
  }

  if (tags && !isValidTags(tags)) {
    return res.status(400).json({ error: 'Post tags must be an array of strings.' });
  }

  if (deadline && !isValidDeadline(deadline)) {
    return res.status(400).json({ error: 'Post deadline must be a valid date.' });
  }

  try {
    const post = await Post.create({
      content: content ? content.trim() : '', 
      media: media || null, // MEDIA SAVE KIYA
      tags: tags || [],
      ...(deadline ? { deadline: new Date(deadline) } : {}),
      author: req.user._id,
    });

    await post.populate('author', 'fullName handle profilePicture');
    return res.status(201).json(post);
  } catch (error) {
    console.error('Create Post Error:', error);
    return res.status(500).json({ error: 'Failed to create post.' });
  }
});

// UPDATE POST (FIXED: Added media)
router.put('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  const { content, tags, deadline, media } = req.body;

  if (!isValidPostId(id)) {
    return res.status(400).json({ error: 'Invalid post ID.' });
  }

  if (!content && !media) {
    return res.status(400).json({ error: 'Provide content or media to update.' });
  }

  const updates = {};
  if (content !== undefined) updates.content = content.trim();
  if (media !== undefined) updates.media = media;
  if (tags !== undefined) updates.tags = tags;
  if (deadline !== undefined) {
    if (deadline === null) updates.deadline = undefined;
    else updates.deadline = new Date(deadline);
  }

  try {
    const post = await Post.findById(id).populate('author', '_id fullName handle profilePicture');
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (req.user._id.toString() !== post.author._id.toString()) {
      return res.status(403).json({ error: 'You can only update your own posts.' });
    }

    Object.assign(post, updates);
    await post.save();
    return res.status(200).json(post);
  } catch (error) {
    console.error('Update Post Error:', error);
    return res.status(500).json({ error: 'Failed to update post.' });
  }
});

// DELETE POST
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  if (!isValidPostId(id)) {
    return res.status(400).json({ error: 'Invalid post ID.' });
  }

  try {
    const post = await Post.findById(id).populate('author', '_id');
    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    if (req.user._id.toString() !== post.author._id.toString()) {
      return res.status(403).json({ error: 'You can only delete your own posts.' });
    }

    await post.deleteOne();
    return res.status(200).json({ message: 'Post deleted successfully.' });
  } catch (error) {
    console.error('Delete Post Error:', error);
    return res.status(500).json({ error: 'Failed to delete post.' });
  }
});

// SHARE POST
router.put('/:id/share', async (req, res) => {
  const { id } = req.params;
  if (!isValidPostId(id)) {
    return res.status(400).json({ error: 'Invalid post ID.' });
  }

  try {
    const post = await Post.findByIdAndUpdate(
      id,
      { $inc: { shareCount: 1 } },
      { new: true, projection: { shareCount: 1 } }
    );

    if (!post) {
      return res.status(404).json({ error: 'Post not found.' });
    }

    return res.status(200).json({ shareCount: post.shareCount });
  } catch (error) {
    console.error('Share Count Update Error:', error);
    return res.status(500).json({ error: 'Failed to update share count.' });
  }
});

module.exports = router;