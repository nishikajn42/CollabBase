const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken'); 
const router = express.Router();

// Auto-Sync Route (Keeps Phone & Laptop data identical)
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: "No token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
});

router.get('/search', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!query) return res.status(200).json([]);
  const escapedQuery = query.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const searchPattern = new RegExp(escapedQuery, 'i');
  try {
    const users = await User.find({
      $or: [ { fullName: searchPattern }, { handle: searchPattern }, { skills: searchPattern } ],
    }).select('fullName handle profilePicture skills tagline').limit(5);
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to search users.' });
  }
});

router.post('/google-login', async (req, res) => {
  const { accessToken } = req.body; 
  if (!accessToken) return res.status(400).json({ error: 'Google token required' });
  try {
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const identity = await googleResponse.json();
    if (!identity.email_verified || (!identity.email.endsWith('@mitsgwl.ac.in') && !identity.email.endsWith('@mitsgwalior.in'))) {
      return res.status(403).json({ error: "Access restricted to campus students." });
    }
    let user = await User.findOne({ email: identity.email });
    if (!user) {
      user = new User({
        googleId: identity.sub,
        email: identity.email,
        fullName: identity.name,
        profilePicture: identity.picture,
        handle: identity.email.split('@')[0] 
      });
      await user.save();
    }
    const token = jwt.sign({ sub: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    res.status(500).json({ error: "Server error during login" });
  }
});

router.post('/complete-profile', async (req, res) => {
  const { userId, fullName, handle, enrollmentNo, branch, year, startYear, endYear, githubUsername } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId,
      { fullName, handle, enrollmentNo, branch, year, startYear, endYear, githubUsername: githubUsername.trim(), isProfileComplete: true },
      { returnDocument: 'after' }
    );
    res.status(200).json({ message: "Profile completed", user: updatedUser });
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.handle) return res.status(400).json({ error: "Username taken." });
    res.status(500).json({ error: "Failed to update profile." });
  }
});

router.put('/update-profile', async (req, res) => {
  const { userId, tagline, about, links, profilePicture, coverPhoto, githubUsername, skills, interests, githubAnalysisCache } = req.body;
  try {
    const updatedUser = await User.findByIdAndUpdate(userId,
      { $set: { tagline, about, links, profilePicture, coverPhoto, githubUsername, skills, interests, githubAnalysisCache } },
      { returnDocument: 'after' }
    );
    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});

router.get('/user/:handle', async (req, res) => {
  try {
    const user = await User.findOne({ handle: req.params.handle });
    if (!user) return res.status(404).json({ error: "User not found." });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
});

// --- NEW FEEDBACK ROUTES ---
router.post('/add-feedback', async (req, res) => {
  const { fromUserId, toHandle, feedbackText } = req.body;
  try {
    const fromUser = await User.findById(fromUserId);
    const toUser = await User.findOne({ handle: toHandle });
    if (!fromUser || !toUser) return res.status(404).json({ error: "User not found" });

    const givenText = `To @${toHandle}: ${feedbackText}`;
    const receivedText = `From @${fromUser.handle}: ${feedbackText}`;

    fromUser.givenFeedbacks.push(givenText);
    toUser.receivedFeedbacks.push(receivedText);

    await fromUser.save();
    await toUser.save();

    res.json({ message: "Feedback sent", user: fromUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to send feedback" });
  }
});

router.post('/delete-feedback', async (req, res) => {
  const { userId, feedbackText } = req.body;
  try {
    const user = await User.findById(userId);
    user.givenFeedbacks = user.givenFeedbacks.filter(f => f !== feedbackText);
    
    // Also remove from receiver
    const match = feedbackText.match(/To @(.*?): (.*)/);
    if (match) {
      const receiver = await User.findOne({ handle: match[1] });
      if (receiver) {
        const receivedStr = `From @${user.handle}: ${match[2]}`;
        receiver.receivedFeedbacks = receiver.receivedFeedbacks.filter(f => f !== receivedStr);
        await receiver.save();
      }
    }
    
    await user.save();
    res.json({ message: "Feedback deleted", user });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete feedback" });
  }
});

module.exports = router;