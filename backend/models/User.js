const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
  title: String,
  url: String
});

const userSchema = new mongoose.Schema({
  // Auth & Display Name
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  fullName: { type: String, required: true }, 
  
  // Unique Handle (@username)
  handle: { type: String, unique: true, sparse: true }, 

  // Profile Visuals
  profilePicture: { type: String, default: "" },
  coverPhoto: { type: String, default: "" },
  avatarColor: { type: String, default: "#1976D2" },

  // Academic Info
  enrollmentNo: { type: String, default: "" },
  branch: { type: String, default: "Information Technology with AI & Robotics" },
  year: { type: String, default: "2nd Year" },
  startYear: { type: Number, default: 2025 },
  endYear: { type: Number, default: 2029 },
  
  // Bio & Links
  tagline: { type: String, default: "" }, 
  about: { type: String, default: "" },
  
  // ADD THESE 3 LINES:
  githubUsername: { type: String, default: "" },
  givenFeedbacks: { type: Array, default: [] },
  receivedFeedbacks: { type: Array, default: [] },
  
  skills: [{ type: String }],
  interests: [{ type: String }],
  githubUsername: { type: String, default: "" },

  links: [linkSchema],
  
  isProfileComplete: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);