const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    is_delete: {
        type: Boolean,
        default: false
    }
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
