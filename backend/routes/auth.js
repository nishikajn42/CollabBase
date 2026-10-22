const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken'); // Naya add hua hai security ke liye
const router = express.Router();

router.get('/search', async (req, res) => {
  const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  if (!query) return res.status(200).json([]);

  const escapedQuery = query.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const searchPattern = new RegExp(escapedQuery, 'i');

  try {
    const users = await User.find({
      $or: [
        { fullName: searchPattern },
        { handle: searchPattern },
        { skills: searchPattern },
      ],
    })
      .select('fullName handle profilePicture skills')
      .limit(5);

    return res.status(200).json(users);
  } catch (error) {
    console.error('User Search Error:', error);
    return res.status(500).json({ error: 'Failed to search users.' });
  }
});

router.post('/google-login', async (req, res) => {
  const { accessToken } = req.body; // Ab hum sirf token le rahe hain

  if (!accessToken) {
    return res.status(400).json({ error: 'Google access token is required.' });
  }

  try {
    // Google ke server se token verify karwa rahe hain
    const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!googleResponse.ok) {
      return res.status(401).json({ error: 'Invalid Google access token.' });
    }

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
        handle: identity.email.split('@')[0] // Default handle add kiya
      });
      await user.save();
    }

    // JWT Token Generate kar rahe hain (7 days expiry)
    const token = jwt.sign(
      { sub: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// POST /api/auth/complete-profile
router.post('/complete-profile', async (req, res) => {
  const { userId, fullName, handle, enrollmentNo, branch, year, startYear, endYear, githubUsername } = req.body;

  try {
    if (!userId || !githubUsername || !handle) {
      return res.status(400).json({ error: "User ID, GitHub username, and Handle are required." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName, 
        handle,   
        enrollmentNo,
        branch,
        year,
        startYear,
        endYear,
        githubUsername: githubUsername.trim(),
        isProfileComplete: true
      },
      { new: true }
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found." });
    res.status(200).json({ message: "Profile completed successfully!", user: updatedUser });
  } catch (error) {
    console.error("Onboarding Error:", error);
    if (error.code === 11000 && error.keyPattern?.handle) {
      return res.status(400).json({ error: "This @username is already taken. Please choose another." });
    }
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// PUT /api/auth/update-profile
router.put('/update-profile', async (req, res) => {
  const { userId, tagline, about, links, profilePicture, coverPhoto, githubUsername, givenFeedbacks } = req.body;
  
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { tagline, about, links, profilePicture, coverPhoto, githubUsername, givenFeedbacks } },
      { new: true }
    );
    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// GET /api/auth/user/:handle
router.get('/user/:handle', async (req, res) => {
  try {
    const user = await User.findOne({ handle: req.params.handle });
    
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Profile Fetch Error:", error);
    res.status(500).json({ error: "Failed to fetch user profile." });
  }
});

module.exports = router;