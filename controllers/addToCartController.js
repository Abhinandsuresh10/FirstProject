const cart = require('../models/cartModal')
const Wishlist = require('../models/wishlistModal');
const User = require('../models/userModel')

const cartLoad = async (req, res) => {
    try {
        const userId = req.session.userData._id;
        const cartData = await cart.findOne({ userId }).populate('products.productId');

        let insufficientStock = false;
        let updatedProducts = [];

        if (req.session.insufficientStock) {
            insufficientStock = req.session.insufficientStock;
            updatedProducts = req.session.updatedProducts;

            req.session.insufficientStock = null;
            req.session.updatedProducts = null;
        }

        res.render('addToCart', {
            isLoggedIn: req.session.userData,
            cart:cartData,
            insufficientStock,
            updatedProducts
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};


const insertCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const userId = req.session.userData._id; 

        let Cart = await cart.findOne({ userId });

        if (!Cart) {
            Cart = new cart({
                userId,
                products: [{ productId, quantity: 1 }]
            });
        } else {
            const cartProductsMap = Cart.products.reduce((map, product) => {
                map[product.productId] = product;
                return map;
            }, {});

            if (cartProductsMap[productId]) {
                res.json({ success: false, message: 'Product is already in the cart.' });
                return;
            } else {
                Cart.products.push({ productId, quantity: 1 });
            }
        }
        
        await Cart.save();
        
        res.json({ success: true, message: 'Product added to cart successfully.' });
    } catch (error) {
        console.error('Error adding product to cart:', error);
        res.status(500).json({ success: false, message: 'Failed to add product to cart.' });
    }
};




const deleteCart = async(req,res)=>{
 
    const { productId } = req.params;
    const userId = req.session.userData._id; 

    try {
        let Cart = await cart.findOne({ userId });

        if (!Cart) {
            return res.status(404).json({ success: false, message: 'Cart not found.' });
        }

    Cart.products = Cart.products.filter(product => product.productId.toString() !== productId);

    await Cart.save();

    res.json({ success: true, message: 'Product removed from cart successfully.' });
    } catch (error) {
        console.log(error.message)
    }
}


 const quantityAdd = async(req,res)=>{
    try {
        const { productId, quantity } = req.body;
        const userId = req.session.userData._id;
       
        let Cart = await cart.findOneAndUpdate(
            { userId, 'products.productId': productId },
            { $set: { 'products.$.quantity': quantity } },
            { new: true }
        );

        if (!Cart) {
            return res.status(404).json({ success: false, message: 'Cart or product not found.' });
        }

        res.json({ success: true, message: 'Cart quantity updated successfully.' });
    } catch (error) {
        console.log(error.message)
    }
 }


 // wishlist 

 const loadWishlist = async(req,res)=>{
    try {
        const userId = req.session.userData._id;
        const wishlist = await Wishlist.findOne({ userId }).populate('products', 'productId name description price discount image');
        res.render('wishlist', { wishlist: wishlist || { items: [] }, isLoggedIn: req.session.userData });
    } catch (error) {
        console.log(error.message)
    }
 }

 const InsertWishlist = async (req, res) => {
    const { productId } = req.body;
    const userId = req.session.userData._id; 
  
    try {
      let wishlist = await Wishlist.findOne({ userId });
  
      if (!wishlist) {
        wishlist = new Wishlist({
          userId,
          products: [productId]
        });
      } else {
        if (!wishlist.products.includes(productId)) {
          wishlist.products.push(productId);
        } else {
          return res.status(200).json({ success: false, message: 'Product already in wishlist' });
        }
      }
  
      await wishlist.save();
      res.status(200).json({ success: true, message: 'Product added to wishlist' });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };

  const RemoveFromWishlist = async (req, res) => {
    try {
        const userId = req.session.userData._id; 
        const productId = req.params.productId;

        const wishlist = await Wishlist.findOne({ userId: userId });

        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }
        wishlist.products.pull(productId);
        await wishlist.save();

        res.status(200).json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
        console.error('Error removing product from wishlist:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = {
    cartLoad,
    insertCart,
    deleteCart,
    quantityAdd,
    loadWishlist,
    InsertWishlist,
    RemoveFromWishlist
}