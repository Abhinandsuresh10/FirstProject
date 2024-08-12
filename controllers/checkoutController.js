const address = require('../models/addressModel');
const Product = require('../models/produntsModel');
const Cart = require('../models/cartModal');
const order = require('../models/orderSchema');
const User = require('../models/userModel');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Wallet = require('../models/walletModel');
const Coupon = require('../models/couponModal');
const Category = require('../models/category');
const Brands = require('../models/brandsModel')


const ApplyCoupon = async (req, res) => {
    const { couponCode , total , discount } = req.body;

    try {
        const coupon = await Coupon.findOne({ code: couponCode });
        const minPurchaseAmount = coupon.minPurchaseAmount;

        if (!coupon) {
            return res.json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        if (new Date() > new Date(coupon.expiryDate)) {
            return res.json({
                success: false,
                message: 'Coupon has expired'
            });
        }
      if(total < minPurchaseAmount){
        return res.json({
            success: false,
            message: `minimum total atleast ${minPurchaseAmount}` 
        });
      }

        const discounts = ((coupon.discountValue / 100) * total);
        const discountAmount = discounts + discount;
        await Coupon.findOneAndUpdate({code: couponCode},{$inc:{usedCount: 1}})
        
        req.session.coupon = {
            code: coupon.code,
            discountAmount,
            discount,
            
        };

        res.json({
            success: true,
            discountAmount,
            
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


const RemoveCoupon = async(req, res) => {
    const { total } = req.body;

    try {

        if (req.session.coupon) {
            const { coupon } = req.session;
            const newDiscount = coupon.discountAmount - coupon.discount;
            const newTotal = total + newDiscount; 
            await Coupon.findOneAndUpdate({code: coupon.code},{$inc:{usedCount: -1}})
            delete req.session.coupon;
            res.json({
                success: true,
                newDiscountAmount: coupon.discount,
                newTotalAmount: newTotal,
                message: 'Coupon has been removed '
            });
        } else {
            res.json({ success: false, message: 'No coupon to remove' });
        }
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const loadCheckout = async (req, res) => {
    try {
        const userId = req.session.userData._id;
        const addresses = await address.find({ userId });
        const cart = await Cart.findOne({ userId }).populate('products.productId');
        const coupons = await Coupon.find({})

        const outOfStockProduct = cart.products.find(cartProduct => {
            const product = cartProduct.productId;
            return product.stock <= 0; 
        });

        if (!cart || cart.products.length === 0 ) {
            return res.redirect('/cart');
        }
        if (outOfStockProduct){
            return res.redirect('/cart?message=out-of-stock');
        }

        let insufficientStock = false;
        let updatedProducts = [];

        for (const cartProduct of cart.products) {
            const product = cartProduct.productId;
            const requestedQuantity = cartProduct.quantity;

            if (requestedQuantity > product.stock) {
                insufficientStock = true;
                cartProduct.quantity = product.stock;
                await cart.save();

                updatedProducts.push({
                    product: product.name,
                    requestedQuantity,
                    availableStock: product.stock
                });
            }
        }

        res.render('checkout', {
            isLoggedIn: req.session.userData,
            addresses,
            cart,
            insufficientStock,
            updatedProducts,
            coupons
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Internal Server Error');
    }
};





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
        const { addressId, paymentMethod, orderItems, amount ,AllDiscount} = req.body;

        await address.findById(addressId);

        const amounts =  Math.ceil(amount);
        const AllDiscounts = Math.ceil(AllDiscount)

        if(amounts < 1000){
            res.status(200).json({ message: 'atleast 1000 needs on cash on delivery'});

        }else{

        const newOrder = new order({
            user: userId,
            shippingAddress: addressId,
            paymentMethod: paymentMethod,
            orderItems: orderItems.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                price: item.price
            })),
            amount : amounts,
            AllDiscount : AllDiscounts
        });

        
        await newOrder.save();

        for (const item of orderItems) {
            const product = await Product.findById(item.productId);

            if (product) {
                product.stock -= item.quantity;
                product.orderCount = product.orderCount ? product.orderCount + 1 : 1;
                const cate = product.category;
                const category = await Category.findOne({name:cate});
                if(category){
                    category.orderCount = category.orderCount ? category.orderCount + 1 : 1;
                    await category.save();
                }
                    const brand = product.brand;
                    const brands = await Brands.findOne({name:brand});
                if(brands){
                    brands.orderCount = brands.orderCount ? brands.orderCount + 1 : 1;
                    await brands.save();
                }
                await product.save();
            }
        }
        await Cart.findOneAndDelete({userId:userId})
      res.status(200).json({ message: 'Order placed successfully', redirectUrl:  `/userOrderDetails?orderId=${newOrder._id}`});
    }
    } catch (error) {
        console.log(error.message);
    }
}


//razorpay

const razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
    
});




const CreateRazorpay = async (req, res) => {
    try {
        
        const { amount, currency = 'INR', receipt = 'receipt#1' } = req.body;
        const options = {
            amount: amount * 100, 
            currency,
            receipt,
            payment_capture: 1 
        };
        
        const order = await razorpayInstance.orders.create(options);
        res.status(200).json({ orderId: order.id, amount: options.amount });
    } catch (error) {
        console.log(error);
        res.status(500).send('Server error');
    }
};


const VerifyRazorpay = async (req, res) => {
    try {
        const { paymentId, orderId, signature, addressId, paymentMethod, orderItems, amount, AllDiscount } = req.body;

        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(orderId + '|' + paymentId);
        const generatedSignature = hmac.digest('hex');

        const userId = req.session.userData._id;
        const shippingAddress = await address.findById(addressId);
        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address not found' });
        }

        const amounts = Math.ceil(amount);
        const AllDiscounts = Math.ceil(AllDiscount);

        let paymentStatus = 'pending'; 

        if (generatedSignature === signature) {
            paymentStatus = 'paid'; 
        }

        const newOrder = new order({
            user: userId,
            shippingAddress: addressId,
            paymentMethod: paymentMethod,
            orderItems: orderItems.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                price: item.price
            })),
            amount: amounts,
            AllDiscount: AllDiscounts,
            paymentStatus: paymentStatus
        });

        await newOrder.save();

        for (const item of orderItems) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                product.orderCount = product.orderCount ? product.orderCount + 1 : 1;
                const cate = product.category;
                const category = await Category.findOne({ name: cate });
                if (category) {
                    category.orderCount = category.orderCount ? category.orderCount + 1 : 1;
                    await category.save();
                }
                const brand = product.brand;
                const brands = await Brands.findOne({ name: brand });
                if (brands) {
                    brands.orderCount = brands.orderCount ? brands.orderCount + 1 : 1;
                    await brands.save();
                }
                await product.save();
            }
        }

        await Cart.findOneAndDelete({ userId: userId });

        if (paymentStatus === 'paid') {
            res.status(200).json({ message: 'Payment verified successfully', redirectUrl: `/userOrderDetails?orderId=${newOrder._id}` });
        } else {
            res.status(400).json({ message: 'Payment verification failed, order created with unpaid status', redirectUrl: `/userOrderDetails?orderId=${newOrder._id}` });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const PlaceOrderOnFailure = async (req, res) => {
    try {
       
        const { amount, addressId, paymentMethod, orderItems, AllDiscount } = req.body;

        const userId = req.session.userData._id;
        const shippingAddress = await address.findById(addressId);
        if (!shippingAddress) {
            return res.status(400).json({ message: 'Shipping address not found' });
        }

        const amounts = Math.ceil(amount);
        const AllDiscounts = Math.ceil(AllDiscount);

        const newOrder = new order({
            user: userId,
            shippingAddress: addressId,
            paymentMethod: paymentMethod,
            orderItems: orderItems.map(item => ({
                product: item.productId,
                quantity: item.quantity,
                price: item.price
            })),
            amount: amounts,
            AllDiscount: AllDiscounts,
            paymentStatus: 'pending' 
        });

        await newOrder.save();

        for (const item of orderItems) {
            const product = await Product.findById(item.productId);
            if (product) {
                product.stock -= item.quantity;
                product.orderCount = product.orderCount ? product.orderCount + 1 : 1;
                const cate = product.category;
                const category = await Category.findOne({ name: cate });
                if (category) {
                    category.orderCount = category.orderCount ? category.orderCount + 1 : 1;
                    await category.save();
                }
                const brand = product.brand;
                const brands = await Brands.findOne({ name: brand });
                if (brands) {
                    brands.orderCount = brands.orderCount ? brands.orderCount + 1 : 1;
                    await brands.save();
                }
                await product.save();
            }
        }

        await Cart.findOneAndDelete({ userId: userId });

        res.status(200).json({ message: 'Order placed successfully despite payment failure', redirectUrl: `/userOrderDetails?orderId=${newOrder._id}` });
    } catch (error) {
        console.error('Error placing order on failure:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

//pending razorpay 

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const PendingRazorpayCreate = async (req, res) => {
    const { amount, orderId } = req.body;
    try {
        const options = {
            amount: amount * 100,
            currency: 'INR',
            receipt: orderId, 
            payment_capture: 1
        };
        const razorpayOrder = await instance.orders.create(options);

        const orders = await order.findById(orderId);
        if (orders) {
            orders.razorpayOrderId = razorpayOrder.id; 
            await orders.save();
        }

        res.status(200).json({ orderId: razorpayOrder.id });
    } catch (error) {
        console.error('Error creating Razorpay order:', error);
        res.status(500).json({ message: 'Error creating order' });
    }
}


const verifyRazorPayPayment = async (req, res) => {
    const { paymentId, orderId, signature } = req.body;

    try {

        const orders = await order.findOne({ razorpayOrderId: orderId });
        if (!orders) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(orderId + '|' + paymentId);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature === signature) {
            orders.paymentStatus = 'paid';
            orders.razorpayPaymentId = paymentId;
            await orders.save();

            res.status(200).json({ message: 'Payment verified'});
        } else {
            res.status(400).json({ message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Error verifying payment' });
    }
}


//ordershow

const loadOrdersShow = async (req, res) => {
    try {
       
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 3;
        const skip = (page - 1) * limit;

        const orders = await order.find({ user: req.session.userData._id })
                                  .sort({ _id: -1 })
                                  .skip(skip)
                                  .limit(limit);

        const totalOrders = await order.countDocuments({ user: req.session.userData._id });
        const totalPages = Math.ceil(totalOrders / limit);

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
            orders: detailedOrders,
            currentPage: page,
            totalPages: totalPages
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Server Error');
    }
};



const CancelOrder = async (req, res) => {
    const { orderId } = req.params;

    try {
        const updatedOrder = await order.findByIdAndUpdate(
            orderId,
            { orderStatus: 'Canceled' },
            { new: true, runValidators: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const productPromises = updatedOrder.orderItems.map(item => 
            Product.findById(item.product).exec()
                .then(product => {
                    if (product) {
                        product.stock += item.quantity;
                        return product.save();
                    }
                })
        );

        await Promise.all(productPromises);

        if (updatedOrder.paymentMethod === 'RazorPay') {
            const totalPrice = updatedOrder.amount;

            const userId = req.session.userData._id;
            let userWallet = await Wallet.findOne({ userId: userId });

            if (!userWallet) {
                userWallet = new Wallet({
                    userId,
                    balance: totalPrice,
                    transactions: [{
                        type: 'credit',
                        amount: totalPrice,
                        description: 'Order canceled - refund added to wallet'
                    }]
                });
            } else {
                userWallet.balance += totalPrice;
                userWallet.transactions.push({
                    type: 'credit',
                    amount: totalPrice,
                    description: 'Order canceled - refund added to wallet'
                });
            }

            await userWallet.save();
        }

        res.json({ success: true, message: 'Order cancellation requested successfully', updatedOrder });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


const ReturnRequest = async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    try {
        const updatedOrder = await order.findByIdAndUpdate(
            orderId, 
            { returnStatus: 'requested', returnReason: reason }, 
            { new: true, runValidators: true } 
        );
        const productPromises = updatedOrder.orderItems.map(item => 
            Product.findById(item.product).exec()
                .then(product => {
                    if (product) {
                        product.stock += item.quantity;
                        return product.save();
                    }
                })
        );

        await Promise.all(productPromises);
        
       
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.json({ success: true, message: 'Order return requested successfully', updatedOrder });
        
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Server error' });  
    }
};



module.exports = {
    loadCheckout,
    insertCheckoutAddress,
    loadUserOrderDetails,
    insertPlaceOrder,
    loadOrdersShow,
    CancelOrder,
    ReturnRequest,
    CreateRazorpay,
    VerifyRazorpay,
    ApplyCoupon,
    RemoveCoupon,
    PlaceOrderOnFailure,
    PendingRazorpayCreate,
    verifyRazorPayPayment
}