const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    match: /^[A-Za-z\s]+$/,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('Login', userSchema);