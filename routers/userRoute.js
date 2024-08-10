const express = require('express');
const userRoute = express();
const session = require('express-session');
const config = require('../config/config');
const userAuth = require('../middilewares/userAuth');

require('dotenv').config();


userRoute.use(session({
    secret: config.sessionSecret,
    saveUninitialized: false,
    resave: false,
    cookie: { secure: false }
}));

const bodyParser = require('body-parser');

userRoute.use(bodyParser.json());
userRoute.use(bodyParser.urlencoded({ extended: true }));

userRoute.set('view engine', 'ejs');
userRoute.set('views', './views/user');

const multer = require('multer');
const path = require('path');

userRoute.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/userImages'));
    },
    filename: (req, file, cb) => {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const upload = multer({ storage: storage });

//-------------------

const userController = require('../controllers/userControllers.js');

const userShopControllers = require('../controllers/userShopController.js');
const userProfileController = require('../controllers/userProfileController.js');
const cartController = require('../controllers/addToCartController.js');
const checkoutController = require('../controllers/checkoutController.js')
const passport = require('../config/googleAuth');

userRoute.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

userRoute.get(process.env.CALLBACKURL,
    passport.authenticate('google', { failureRedirect: '/login' }),
    userController.googleLoginCallback
);
//---------------------


userRoute.get('/', userController.loginHome);
userRoute.get('/login',userAuth.isLogout,userController.loginLoad);
userRoute.get('/register',userAuth.isLogout,userController.registerLoad);
userRoute.post('/register', upload.single('image'), userController.insertUser);
userRoute.post('/verify-otp', userController.verifyOtp);
userRoute.post('/resend-otp', userController.resendOtp);
userRoute.post('/login',userController.verifyLogin);
userRoute.get('/home',userAuth.isLogin,userController.loginHome);
userRoute.get('/registerOTP',userAuth.isLogout, userController.otpLoad);

//forgot password

userRoute.get('/forgot',userAuth.isLogout, userController.ForgotPage);
userRoute.post('/sendEmail',userController.ForgotEmailSent);
userRoute.get('/reset/:token',userController.forgotPassword);
userRoute.post('/resetPassword',userAuth.isLogout,userController.insertNewPawword)

//logout

userRoute.get('/logout',userController.userLogout);

//shop controls

userRoute.get('/productShop',userAuth.isLogin,userShopControllers.shopLoad);
userRoute.get('/productDetails',userAuth.isLogin,userShopControllers.loadProductDetails);

//profile..

userRoute.get('/userProfile',userAuth.isLogin,userProfileController.loadProfile);
userRoute.get('/address',userAuth.isLogin,userProfileController.loadAddress);
userRoute.post('/userUpdate', upload.single('image'),userProfileController.userUpdates);
userRoute.post('/change-password',userProfileController.changePassword)


//address..

userRoute.post('/addAddress',userProfileController.insertAddress);
userRoute.get('/deleteAddress',userProfileController.deleteAddress);
userRoute.post('/editAddress',userProfileController.editAddress);

//cart..

userRoute.get('/cart',userAuth.isLogin,cartController.cartLoad);
userRoute.post('/addToCart',cartController.insertCart);
userRoute.post('/removeFromCart/:productId',cartController.deleteCart);
userRoute.post('/updateCartQuantity',cartController.quantityAdd)

//checkout..

userRoute.get('/checkout',userAuth.isLogin,checkoutController.loadCheckout);
userRoute.post('/addAddressCheckout',checkoutController.insertCheckoutAddress);
userRoute.get('/userOrderDetails',userAuth.isLogin,checkoutController.loadUserOrderDetails);
userRoute.post('/placeOrder',checkoutController.insertPlaceOrder);
userRoute.post('/createOrder',checkoutController.CreateRazorpay);
userRoute.post('/verifyPayment',checkoutController.VerifyRazorpay);
userRoute.post('/placeOrderOnFailure',checkoutController.PlaceOrderOnFailure );
userRoute.post('/pendingRazorpayOrder',checkoutController.PendingRazorpayCreate);
userRoute.post('/verifyPaymentAndUpdateOrder',checkoutController.verifyRazorPayPayment)


//orders..
userRoute.get('/orderShow',userAuth.isLogin,checkoutController.loadOrdersShow);
userRoute.patch('/cancelOrders/:orderId',checkoutController.CancelOrder);
userRoute.patch('/returnOrders/:orderId',checkoutController.ReturnRequest);

//wishlist 

userRoute.get('/wishlist',userAuth.isLogin,cartController.loadWishlist);
userRoute.post('/insertWishlist',userAuth.isLogin,cartController.InsertWishlist);
userRoute.delete('/removeFromWishlist/:productId',cartController.RemoveFromWishlist);

//wallet

userRoute.get('/wallet',userAuth.isLogin,cartController.LoadWallet);
userRoute.post('/create-order',cartController.InsertWallet);
userRoute.post('/payment-success',cartController.AddToWallet);

//coupon

userRoute.post('/applyCoupon',checkoutController.ApplyCoupon);
userRoute.post('/removeCoupon',checkoutController.RemoveCoupon)


module.exports = userRoute;
