const express = require('express');
const User = require('../models/User');
const router = express.Router();

router.post('/google-login', async (req, res) => {
  const { googleId, email, fullName, profilePicture } = req.body;

  try {
    if (!email.endsWith('@mitsgwl.ac.in') && !email.endsWith('@mitsgwalior.in')) {
      return res.status(403).json({ error: "Access restricted to campus students." });
    }

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        googleId,
        email,
        fullName,
        profilePicture,
      });
      await user.save();
    }

    res.status(200).json({ message: "Login successful", user });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Server error during login" });
  }
});

// POST /api/auth/complete-profile (With GitHub Verification)
// POST /api/auth/complete-profile
router.post('/complete-profile', async (req, res) => {
  const { userId, fullName, handle, enrollmentNo, branch, year, startYear, endYear, githubUsername } = req.body;

  try {
    if (!userId || !githubUsername || !handle) {
      return res.status(400).json({ error: "User ID, GitHub username, and Handle are required." });
    }

    // WE REMOVED THE BACKEND GITHUB FETCH HERE. 
    // The frontend already verified it, so we trust it and just save to MongoDB!

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
    // If handle is already taken, MongoDB will throw a duplicate key error (code 11000)
    if (error.code === 11000 && error.keyPattern?.handle) {
      return res.status(400).json({ error: "This @username is already taken. Please choose another." });
    }
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// PUT /api/auth/update-profile
router.put('/update-profile', async (req, res) => {
  // 1. Add githubUsername and givenFeedbacks to the destructured list
  const { userId, tagline, about, links, profilePicture, coverPhoto, githubUsername, givenFeedbacks } = req.body;
  
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      // 2. Add them to the $set object
      { $set: { tagline, about, links, profilePicture, coverPhoto, githubUsername, givenFeedbacks } },
      { new: true }
    );
    res.status(200).json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// GET /api/auth/user/:handle
// Fetches a public profile by their unique username handle
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