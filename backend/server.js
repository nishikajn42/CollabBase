const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

// 1. Create the app first
const app = express();

// 2. Apply Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://collab-base-sepia.vercel.app'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 3. Routes
app.use('/api/auth', authRoutes);
app.use('/api/github', require('./routes/github'));
app.use('/api/posts', require('./routes/posts')); // YAHAN NAYA POST ROUTE ADD KIYA
app.use('/api', require('./routes/aiRoutes')); // AI tag wale route ke liye

// 4. Health check route
app.get('/', (req, res) => {
  res.send('CollabBase API is running...');
});

// 5. Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});