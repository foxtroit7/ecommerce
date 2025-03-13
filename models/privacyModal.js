const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
    content: { type: String },
    time: { type:Date },
}, { timestamps: true });
module.exports = mongoose.model('privacy', adminSchema);