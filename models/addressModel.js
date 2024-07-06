const mongoose = require('mongoose');

const addresSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    name: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: false
    },
    street: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    zipcode: {
        type: String,
        required: false
    },
    country:{
        type:String,
        required:false
    }
   

});

module.exports = mongoose.model('Address', addresSchema);