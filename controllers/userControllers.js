const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Product = require('../models/produntsModel');
const Cart = require('../models/cartModal');
const Wallet = require('../models/walletModel');
require('dotenv').config();


// configure nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MYEMAIL,
        pass: process.env.MYPASSWORD
    }
});

// register load
const registerLoad = async (req, res) => {
    
    try {
        res.render('register', { data: {} ,isLoggedIn : req.session.userData});
    } catch (error) {
        res.send(error.message);
    }
};

// password bcrypt
const securePassword = async (password) => {
    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
};

// generate OTP
const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();  
};

// send OTP email
const sendOtpEmail = (email, otp) => {
    const mailOptions = {
        from: process.env.MYEMAIL,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
};


const insertUser = async (req, res) => {
    try {
        const { name, email, mobile, password, confirmPassword , Refferel} = req.body;
        
        function generateReferralCode(length = 8) {
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890';
            let referralCode = '';
            
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                referralCode += characters[randomIndex];
            }
            
            return referralCode;
        }
        
        const newReferralCode =  generateReferralCode(); 

        const ReffererdUser = await User.findOne({Refferel:Refferel});

        if (ReffererdUser) {
            const refAmount = 100;
            let wallet = await Wallet.findOne({ userId: ReffererdUser._id });
                wallet.balance += refAmount;
                await wallet.save();
            }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'Email already exists', data: { name, mobile, email, password, confirmPassword } });
        }

        if (password !== confirmPassword) {
            return res.json({ success: false, message: 'Passwords do not match', data: { name, email, mobile, password, confirmPassword } });
        }

        const sPassword = await securePassword(password);
        const otp = generateOtp();
        req.session.otp = otp;
        sendOtpEmail(email, otp);

        req.session.user = {
            name,
            email,
            mobile,
            password: sPassword,
            is_blocked:false,
            image: req.file ? req.file.filename : '',
            Refferel:newReferralCode,
            RefferedBy: Refferel ? Refferel: null
        };

        res.json({ success: true, redirectToOtp: true });
    } catch (error) {
        console.log(error.message);
        res.render('500');
    }
};

// otpLoad....


const otpLoad =async(req,res)=>{
    try {
        res.render('registerOTP',{isLoggedIn : req.session.userData})
    } catch (error) {
        console.log(error.message)
    }
}


// verify OTP....

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        if (otp == req.session.otp) {
        
            const userData = new User(req.session.user);
           
            const savedUser = await userData.save();

            if (savedUser) {
                delete req.session.otp;
                 req.session.userData = userData;
                 const RefferedBy = req.session.userData.RefferedBy;
                 
                 const userId = req.session.userData._id;

                 let userWallet = await Wallet.findOne({ userId: userId });
                 if (!userWallet && RefferedBy === null) {
                     userWallet = new Wallet({
                         userId: userId,
                         balance: 0.00
                     });
                 }else{
                    userWallet = new Wallet({
                        userId: userId,
                        balance: 50.00
                    });
                 }
        
                 await userWallet.save();

                res.status(201).json({ message: 'OTP verification successful' }); 
            } else {
                res.status(400).json({ message: 'Failed to register user' }); 
            }
        } else {
            res.status(400).json({ message: 'Invalid OTP. Please try again.' }); 
        }
    } catch (error) {
        console.error(error);
        res.render('500');
    }
};





// login page
const loginLoad = async (req, res) => {
    try {

        res.render('login', { data: {}, message: '',isLoggedIn : req.session.userData });

    } catch (error) {
        console.log(error.message);
    }
};

//verifyLogin..

const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;
      
         const userData = await User.findOne({email:email});

         if(userData){
            
            if(userData.is_blocked){
              return  res.render('login',{message:'user is blocked',data: {email,password},isLoggedIn : req.session.userData })
          }

        const passwordMatch = await bcrypt.compare(password,userData.password);
     if(passwordMatch){
        req.session.userData = userData;
        res.redirect('/home');
    }else{
        res.render('login',{message:'password incorrect', data: {email,password},isLoggedIn : req.session.userData })
    }
   }else{
    res.render('login', {message: 'email is not valid', data: {email,password },isLoggedIn : req.session.userData })
   }

    } catch (error) {
        console.log(error.message);
    }
}

//timer...

const resendOtp = async (req, res) => {
    try {
       
        const { email } = req.session.user;

        const otp = generateOtp();
        req.session.otp = otp;
        sendOtpEmail(email, otp);

        res.json({ message: 'OTP has been resent to your email.' });
    } catch (error) {
        console.log(error.message);
        res.render('500');
    }
};

//home....


const loginHome = async (req, res) => {
    try {
        const Products = await Product.find({ is_delete: false }).sort({ orderCount: -1 }).limit(4);
        res.render('home', { isLoggedIn: req.session.userData, product: Products });
    } catch (error) {
        console.log(error.message);
    }
};



// Google login callback
const googleLoginCallback = async(req, res) => {
    try{
        if(!req.user){
          return  res.redirect('/login');
        }
        if(req.user.is_blocked){
            const email = req.body.email;
            const password = req.body.password;
         return  res.render('login',{message:'user is blocked',data: {email,password},isLoggedIn : req.session.userData})
        }
        req.session.userData = req.user;
        
        const userId = req.session.userData._id;

        let userWallet = await Wallet.findOne({ userId: userId });
        if (!userWallet) {
            userWallet = new Wallet({
                userId: userId,
                balance: 0.00
            });
        }

          await userWallet.save();
          return res.redirect('/home');
    }catch(error){
        console.log(error);
    }
};



//userLogout...

const userLogout = async(req,res)=>{
try {
     
    delete req.session.userData;
    res.redirect('/home');
} catch (error) {
    console.log(error.message);
}
}


//forgot password 

const ForgotPage = async(req,res)=>{
    try {
        res.render('forgotEmail',{message:''})
    } catch (error) {
       console.log(error.message) 
    }
}


const ForgotEmailSent = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            res.render('forgotEmail',{message:'No user found with this email address. please check email'})
           
        }

        const token = crypto.randomBytes(20).toString('hex');
        const resetTokenExpires = Date.now() + 3600000; 

        user.resetPasswordToken = token;
        user.resetPasswordExpires = resetTokenExpires;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.MYEMAIL,
                pass: process.env.MYPASSWORD
            }
        });
        const mailOptions = {
            to: user.email,
            from: process.env.MYEMAIL,
            subject: 'Password Reset Request',
            html: `
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click the button below to complete the process:</p>
                <p><a href="http://${req.headers.host}/reset/${token}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Your Password</a></p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            `
        };

        await transporter.sendMail(mailOptions);
        res.render('forgotEmail',{message:'Password reset email sent.'});
    } catch (error) {
        console.error(error.message);
        res.render('500');
    }
};

const forgotPassword = async (req, res) => {
    const { token } = req.params;

    try {
       
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
        }
       res.render('resetPassword',{token})
    } catch (error) {
        console.error(error.message);
        res.render('500');
    }
};

const insertNewPawword = async(req,res)=>{
    const { token , newPassword} = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Password reset token is invalid or has expired.' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.redirect('/login');
    } catch (error) {
        console.error(error.message);
        res.render('500');
    }
}


module.exports = {
    loginLoad,
    registerLoad,
    insertUser,
    verifyOtp,
    resendOtp,
    verifyLogin,
    loginHome,
    otpLoad,
    googleLoginCallback,
    userLogout,
    ForgotPage,
    ForgotEmailSent,
    forgotPassword,
    insertNewPawword
   
};
