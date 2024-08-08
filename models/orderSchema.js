const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
       
    },
    orderItems: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', 
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price: {
                type: Number,
                required: true
            }

        }
    ],
    shippingAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address', 
        
    },
    paymentMethod: {
        type: String,
        enum: ['Cash on delivery', 'RazorPay'],
        
    },
    amount : {
        type : Number
    },
    AllDiscount : {
        type: Number
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'paid'],
        default:'paid'
        
    },
    orderStatus:{
        type: String,
        enum: ['pending', 'shipped', 'delivered', 'Canceled' ,'order returned'],
        default: 'pending'
    },
    returnStatus: { 
        type: String,
        enum: ['not requested', 'requested', 'returned'],
        default: 'not requested'
    },
    returnReason: {
        type: String,
        default: ''
    }
  
   
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;