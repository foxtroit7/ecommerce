const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    user_id: { type: String, required: true},
    name:{type: String, required: true},
    photo:{type: String, required: true},
    location: { type: String, required: true },
    phone_number: { type: String },
    status: { type: String, required: true, enum: ['Active', 'Inactive'] },
}, { timestamps: true });

module.exports = mongoose.model('user_details', userSchema);
