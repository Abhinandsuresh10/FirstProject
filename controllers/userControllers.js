const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const prducts = require('../models/produntsModel');
const Cart = require('../models/cartModal')
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
        const { name, email, mobile, password, confirmPassword } = req.body;

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
            image: req.file ? req.file.filename : ''
        };

        res.json({ success: true, redirectToOtp: true });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Failed to register user' });
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



// verify OTP

const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        if (otp == req.session.otp) {
        
            const userData = new User(req.session.user);
            const savedUser = await userData.save();

            if (savedUser) {
                delete req.session.otp;
                 req.session.userData = userData;
                res.status(201).json({ message: 'OTP verification successful' }); 
            } else {
                res.status(400).json({ message: 'Failed to register user' }); 
            }
        } else {
            res.status(400).json({ message: 'Invalid OTP. Please try again.' }); 
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'OTP verification failed' });
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
        const { email } = req.session.userData;

        const otp = generateOtp();
        req.session.otp = otp;
        sendOtpEmail(email, otp);

        res.json({ message: 'OTP has been resent to your email.' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: 'Failed to resend OTP' });
    }
};

//home....


const loginHome = async(req,res)=>{
    try {
       
        res.render('home',{ isLoggedIn : req.session.userData})
    } catch (error) {
        console.log(error.message)  
    }
}


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
   
};
