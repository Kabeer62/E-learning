const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
  fullName: String,
  email: String,
  course: {
    title: String,
    image: String,
    description: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);