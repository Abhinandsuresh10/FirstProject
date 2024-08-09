const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    orderCount: {
        type: Number,
        default:0
    },
    is_delete: {
        type: Boolean,
        default: false
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
