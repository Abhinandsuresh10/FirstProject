const address = require('../models/addressModel');
const Product = require('../models/produntsModel');
const Cart = require('../models/cartModal');
const order = require('../models/orderSchema');


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
        const { addressId ,orderId  } = req.query;
        const addresses =  await address.findOne({_id:addressId});
        const orders = await order.findOne({_id:orderId})
        res.render('orderDetails',{isLoggedIn : req.session.userData,Address:addresses})
       
    } catch (error) {
        console.log(error.message);
    }

}

//insert placeorder

const insertPlaceOrder = async(req,res)=>{
    try {
   
     const userId = req.session.userData._id;
     const {addressId,paymentMethod} = req.body;
     
     const addresses = await address.findOne({_id:addressId})
     const orders = await order({
        userId:userId,
        shippingAddress:addresses,
        paymentMethod:paymentMethod
     })
     
      await orders.save()
      res.status(200).json({ message: 'Order placed successfully', redirectUrl:  `/userOrderDetails?addressId=${addressId}&orderId=${order._id}`  });

    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadCheckout,
    insertCheckoutAddress,
    loadUserOrderDetails,
    insertPlaceOrder
}