const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
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
        res.render('register', { data: {} });
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

        req.session.userData = {
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

//otpLoad....


const otpLoad =async(req,res)=>{
    try {
        res.render('registerOTP')
    } catch (error) {
        console.log(error.message)
    }
}



// verify OTP
const verifyOtp = async (req, res) => {
    try {
        const { otp } = req.body;

        let otp2 = otp.join('');

       if (otp2 == req.session.otp) {
        
            const userData = new User(req.session.userData);
         
            const savedUser = await userData.save();
            if (savedUser) {
                delete req.session.otp;
                delete req.session.userData;
                return res.redirect('/login');
            } else {
                res.render('register', { message: 'Failed to register user' });
            }
        } else {
            res.render('registerOTP', { message: 'Invalid OTP. Please try again.' });
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ message: 'OTP verification failed' });
    }
};

// login page
const loginLoad = async (req, res) => {
    try {

        res.render('login', { data: {}, message: '' });

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

        if(userData.is_blocked){
          return  res.render('login',{message:'user is blocked',data: {email,password}})
             }
        if(userData){

        const passwordMatch = await bcrypt.compare(password,userData.password);
     if(passwordMatch){
        req.session.userData = userData;
        res.redirect('/home');
    }else{
        res.render('login',{message:'password incorrect', data: {email,password}})
    }
   }else{
    res.render('login', {message: 'email is not valid', data: {email,password }})
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
        res.render('home',{ isLoggedIn : req.session.userData })
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
         return  res.render('login',{message:'user is blocked',data: {email,password}})
        }
        req.session.userData = req.user;
          return res.redirect('/home');
    }catch(error){
        console.log(error);
    }
};

//shop load...

const shopLoad = async(req,res)=>{
    try {
        res.render('productShop')
    } catch (error) {
        console.log(error.message);
    }
}

//userLogout...

const userLogout = async(req,res)=>{
try {
     
    req.session.destroy();
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
    shopLoad,
    userLogout,
   
};
