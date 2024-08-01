const mongoose = require('mongoose');

const CategoryOfferSchema = new mongoose.Schema({
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
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


module.exports = mongoose.model('CategoryOffer', CategoryOfferSchema);