const mongoose = require('mongoose');

const FormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String, // Can be JSON stringified object for complex forms
    required: true,
  },
  shiftDate: {
    type: Date,
    required: true,
  },
  // This is the key field for ownership
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Form', FormSchema);