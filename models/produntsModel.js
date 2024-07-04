const mongoose = require('mongoose');

const prductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: false
    },
    brand: {
        type: String,
        required: false
    },
    material: {
        type: String,
        required: false
    },
    model: {
        type: String,
        required: false
    },
    price: {
        type: Number,
        required: false
    },
    stock: {
        type: Number,
        required: false
    },
    discription: {
        type: String,
        required: false
    },
    image: {
        type: [String],
        required: false
    },
    is_delete: {
        type: Boolean,
        default: false
    },

});

module.exports = mongoose.model('Products', prductSchema);