
const isLogin = async (req,res,next)=>{
    if(req.session.user || req.session.userData){
        next();
    }else{
        res.redirect('/login');
       
    }
}

const isLogout = (req,res,next) =>{
    if(!req.session.user){
        next();
    }else{
        res.redirect('/');
     
    }
}

module.exports = {
    isLogin,
    isLogout
}
