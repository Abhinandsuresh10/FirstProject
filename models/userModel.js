const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: false
    },
    image: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    Refferel: {
        type: String,
        default: null,
        required:false
    },
    RefferedBy:{
        type: String,
        default: null,
        required: false
    }

});

module.exports = mongoose.model('User', userSchema);
