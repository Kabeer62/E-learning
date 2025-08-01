const mongoose = require('mongoose');

const groupMessageSchema = new mongoose.Schema({
    senderEmail: {
        type: String,
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GroupMessage', groupMessageSchema);