const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());

// --- Database Connection ---
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully! ✅');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1); // Exit process with failure
  }
}

//call function to connect
connectDB();

// --- Routes ---
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Shift Handover API.' });
});

// Import and use routes
const authRoutes = require('./routes/auth.routes');
const formRoutes = require('./routes/form.routes');
app.use('/api/auth', authRoutes);
app.use('/api/forms', formRoutes);


// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});