const Order = require('../models/orderSchema');
const User = require('../models/userModel');
const Address = require('../models/addressModel');
const Product = require('../models/produntsModel');
const Wallet = require('../models/walletModel')


const loadorders = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6; 
        const totalOrders = await Order.countDocuments();
        const totalPages = Math.ceil(totalOrders / limit);
        const skip = (page - 1) * limit;

        const orders = await Order.find()
            .sort({ _id: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); 

        const detailedOrders = await Promise.all(orders.map(async order => {
            const userDetails = await User.findById(order.user).lean();
            const shippingAddressDetails = await Address.findById(order.shippingAddress).lean();

            const productDetails = await Promise.all(
                order.orderItems.map(async item => {
                    const product = await Product.findById(item.product).lean();
                    if (!product) {
                        console.error(`Product with ID ${item.product} not found`);
                        return null; // Or handle this case appropriately
                    }
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

            const totalOrderAmount = order.amount;
            totalOrderAmount.toFixed(2);

            return {
                ...order,
                user: userDetails,
                shippingAddress: shippingAddressDetails,
                orderItems: productDetails,
                amount: totalOrderAmount 
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




const LoadOrderView = async (req, res) => {
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

        const totalOrderAmount = order.amount;
        totalOrderAmount.toFixed(2);

        const detailedOrder = {
            ...order,
            user: userDetails,
            shippingAddress: shippingAddressDetails,
            orderItems: productDetails,
            amount: totalOrderAmount
        };

        res.render('adminOrderView', { order: detailedOrder });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
};


const ChangeStatus = async (req, res) => {
    const { orderId, orderStatus } = req.body;
  
    try {
      const updatedOrder = await Order.findByIdAndUpdate(orderId, { orderStatus }, { new: true });
  
      if (orderStatus === 'order returned') {
        const totalPrice = updatedOrder.amount;
      
        const userId = updatedOrder.user;
  
        let userWallet = await Wallet.findOne({ userId: userId });
  
        if (!userWallet) {
          userWallet = new Wallet({
            userId,
            balance: totalPrice,
            transactions: [{
              type: 'credit',
              amount: totalPrice,
              description: 'Order returned - refund added to wallet'
            }]
          });
        } else {
          userWallet.balance += totalPrice;
          userWallet.transactions.push({
            type: 'credit',
            amount: totalPrice,
            description: 'Order returned - refund added to wallet'
          });
        }
  
        await userWallet.save();
      }
  
      res.redirect(`/admin/orders`);
      
    } catch (error) {
      console.log(error.message);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  


module.exports = {
    loadorders,
    LoadOrderView,
    ChangeStatus
}