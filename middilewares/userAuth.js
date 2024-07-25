
const User = require('../models/userModel'); 

const isLogin = async (req, res, next) => {
    if (req.session.userData ) {
        try {
            const userData = await User.findById(req.session.userData._id);
           
            if ( userData.is_blocked) { 
                delete req.session.userData;
                    res.redirect('/');
               
            } else {
                next();
            }
        } catch (error) {
            console.log(error.message);
            res.redirect('/login');
        }
    } else {
        next();
    }
};

const isLogout = (req,res,next) =>{
    if(!req.session.userData ){
        next();
    }else{
        res.redirect('/home');
     
    }
}

module.exports = {
    isLogin,
    isLogout
}
