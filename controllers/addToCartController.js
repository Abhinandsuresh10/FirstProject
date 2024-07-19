const cart = require('../models/cartModal')


const cartLoad = async(req,res)=>{
    try {
        const userId = req.session.userData._id;
        const cartData = await cart.findOne({userId:userId}).populate("products.productId");
     
       res.render('addToCart',{isLoggedIn : req.session.userData,cart:cartData}) 
    } catch (error) {
        console.log(error.message);
    }
}

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


module.exports = {
    cartLoad,
    insertCart,
    deleteCart,
    quantityAdd
}