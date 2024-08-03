const mongoose = require('mongoose');

const ProductOfferSchema = new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Products',
      required: false,
    },
    discountPercentage: {
      type: Number,
      required: true,
      default: 10,
    },
    expiryDate: {
      type: Date,
      index: { expires: 0 },
    },
    isActive: {
      type: Boolean,
      required: true,
      default: false,
    }
  }, { timestamps: true });


module.exports = mongoose.model('ProductOffer', ProductOfferSchema);