const address = require('../models/addressModel');
const Product = require('../models/produntsModel');
const Cart = require('../models/cartModal');
const order = require('../models/orderSchema');
const User = require('../models/userModel')


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

const loadUserOrderDetails = async (req, res) => {
    try {
        const { orderId } = req.query;
        const orderDetails = await order.findById(orderId);
        if (!orderDetails) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const userDetails = await User.findById(orderDetails.user);
        const shippingAddressDetails = await address.findById(orderDetails.shippingAddress);

        const productDetails = await Promise.all(
            orderDetails.orderItems.map(async (item) => {
                const product = await Product.findById(item.product);
                return {
                    ...item._doc,
                    productDetails: product
                };
            })
        );

        const completeOrderDetails = {
            ...orderDetails._doc,
            user: userDetails,
            shippingAddress: shippingAddressDetails,
            orderItems: productDetails
        };

        res.render('orderDetails', {
            isLoggedIn: req.session.userData,
            orders: completeOrderDetails
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};


//insert placeorder

const insertPlaceOrder = async(req,res)=>{
    try {
   
        const userId = req.session.userData._id;
        const { addressId, paymentMethod, orderItems } = req.body;

        const addresses = await address.findById(addressId);

        const newOrder = new order({
            user: userId,
            shippingAddress: addressId,
            paymentMethod: paymentMethod,
            orderItems: orderItems.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                price: item.price
            }))
        });

        await newOrder.save();
        await Cart.findOneAndDelete({userId:userId})
      res.status(200).json({ message: 'Order placed successfully', redirectUrl:  `/userOrderDetails?orderId=${newOrder._id}`  });

    } catch (error) {
        console.log(error.message)
    }
}

const loadOrdersShow = async (req, res) => {
    try {
      
        const orders = await order.find({ user: req.session.userData._id });

        const detailedOrders = await Promise.all(orders.map(async order => {
            const userDetails = await User.findById(order.user);
            const shippingAddressDetails = await address.findById(order.shippingAddress);

            const productDetails = await Promise.all(
                order.orderItems.map(async item => {
                    const product = await Product.findById(item.product);
                    const discountPrice = product.discount || 0; 
                    const discountedPrice = item.price - discountPrice;
                    const totalAmount = discountedPrice * item.quantity;
                    return {
                        ...item._doc,
                        productDetails: product,
                        discountedPrice: discountedPrice.toFixed(2),
                        totalAmount: totalAmount.toFixed(2),
                        discountPrice: discountPrice.toFixed(2)
                    };
                })
            );

            return {
                ...order._doc,
                user: userDetails,
                shippingAddress: shippingAddressDetails,
                orderItems: productDetails
            };
        }));
        res.render('ordersShowPage', {
            isLoggedIn: req.session.userData,
            orders: detailedOrders
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
};



module.exports = {
    loadCheckout,
    insertCheckoutAddress,
    loadUserOrderDetails,
    insertPlaceOrder,
    loadOrdersShow
}