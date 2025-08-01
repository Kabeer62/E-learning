const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  senderEmail: String,
  receiverEmail: String,
  message: String,
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
})

module.exports = mongoose.model('Message', messageSchema)