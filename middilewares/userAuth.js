const User = require('../models/userModel');


const isLogin = async (req,res,next)=>{
    if(req.session.user){
        res.redirect('/login');
    }else{
        next();
    }
}

const isLogout = (req,res,next) =>{
    if(!req.session.user){
        res.redirect('/');
    }else{
        next();
    }
}

module.exports = {
    isLogin,
    isLogout
}
