const Order = require('../models/orderSchema');
const User = require('../models/userModel');
const Address = require('../models/addressModel');
const Product = require('../models/produntsModel')


const loadorders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6; 
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .skip(skip)
            .limit(limit)
            .lean(); 

        const detailedOrders = await Promise.all(orders.map(async order => {
            const userDetails = await User.findById(order.user).lean();
            const shippingAddressDetails = await Address.findById(order.shippingAddress).lean();

            const productDetails = await Promise.all(
                order.orderItems.map(async item => {
                    const product = await Product.findById(item.product).lean();
                    const discountPrice = product.discount || 0;
                    const discountedPrice = item.price - discountPrice;
                    const totalAmount = discountedPrice * item.quantity;
                    return {
                        ...item,
                        productDetails: product,
                        discountedPrice: discountedPrice.toFixed(2),
                        totalAmount: totalAmount.toFixed(2),
                        discountPrice: discountPrice.toFixed(2)
                    };
                })
            );

            return {
                ...order,
                user: userDetails,
                shippingAddress: shippingAddressDetails,
                orderItems: productDetails
            };
        }));

        res.render('adminOrder', {
            isLoggedIn: req.session.userData,
            ordersess: detailedOrders,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.log(error.message);
    }
}


const LoadOrderView = async(req,res)=>{
   
    try {
        const orderId = req.query.orderId;
        const order = await Order.findById(orderId).lean();

        if (!order) {
            return res.status(404).send('Order not found');
        }

        const userDetails = await User.findById(order.user).lean();
        const shippingAddressDetails = await Address.findById(order.shippingAddress).lean();

        const productDetails = await Promise.all(
            order.orderItems.map(async item => {
                const product = await Product.findById(item.product).lean();
                const discountPrice = product.discount || 0;
                const discountedPrice = item.price - discountPrice;
                const totalAmount = discountedPrice * item.quantity;
                return {
                    ...item,
                    productDetails: product,
                    discountedPrice: discountedPrice.toFixed(2),
                    totalAmount: totalAmount.toFixed(2),
                    discountPrice: discountPrice.toFixed(2)
                };
            })
        );

        const detailedOrder = {
            ...order,
            user: userDetails,
            shippingAddress: shippingAddressDetails,
            orderItems: productDetails
        };

        res.render('adminOrderView', { order: detailedOrder });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
        
}
  
}

const ChangeStatus = async(req,res)=>{
    const { orderId, paymentStatus } = req.body;

    try {
        await Order.findByIdAndUpdate(orderId, { paymentStatus });
        res.redirect(`/admin/orders`);
        
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {
    loadorders,
    LoadOrderView,
    ChangeStatus
}