const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  // Simple role system. Can be expanded (e.g., 'manager', 'admin')
  role: {
    type: String,
    enum: ['operator', 'supervisor'], // operator can write, supervisor can only view
    default: 'operator',
  },
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);