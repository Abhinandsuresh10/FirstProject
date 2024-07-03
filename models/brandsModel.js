const mongoose = require('mongoose');

const BrandsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    is_delete: {
        type: Boolean,
        default: false
    }
});

const Brands = mongoose.model('Brands', BrandsSchema);

module.exports = Brands;