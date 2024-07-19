const address = require('../models/addressModel');
const Product = require('../models/produntsModel');
const Cart = require('../models/cartModal')


const loadCheckout = async(req,res)=>{
    try {
        const id = req.session.userData._id;
        const addresses = await address.find({userId : id});
        const cart = await Cart.findOne({ userId: id }).populate(
            'products.productId'
        );
        
        res.render('checkout',{isLoggedIn : req.session.userData,address:addresses,cart:cart})
    } catch (error) {
        console.log(error.message)
    }
}




const insertCheckoutAddress = async(req,res)=>{
    try {
        const userId = req.session.userData._id;
        const {name,mobile,street,city,state,zipcode,country} = req.body;
  
        const newAddress = await address({
            userId:userId,
            name:name,
            mobile:mobile,
            street:street,
            city:city,
            state:state,
            zipcode:zipcode,
            country:country
        });
        await newAddress.save();
        res.redirect('/checkout')
    } catch (error) {
        console.log(error.message);
    }
}

//load loadUserOrderDetails

const loadUserOrderDetails = async(req,res)=>{

    try {
        res.render('orderDetails',{isLoggedIn : req.session.userData})
    } catch (error) {
        console.log(error.message);
    }

}

module.exports = {
    loadCheckout,
    insertCheckoutAddress,
    loadUserOrderDetails
}