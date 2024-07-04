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

const userShopControllers = require('../controllers/userShopController.js')
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
userRoute.get('/home',userAuth.isLogout,userController.loginHome);
userRoute.get('/registerOTP', userController.otpLoad);

userRoute.get('/logout',userController.userLogout);

//shop controls

userRoute.get('/productShop',userAuth.isLogin,userShopControllers.shopLoad);
userRoute.get('/productDetails',userAuth.isLogin,userShopControllers.loadProductDetails);



module.exports = userRoute;
