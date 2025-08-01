const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: function (v) {
        return /^[a-zA-Z0-9._%+-]+@admin\.com$/i.test(v);
      },
      message: 'Only @admin.com emails are allowed',
    },
  },
  password: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Admin', adminSchema);