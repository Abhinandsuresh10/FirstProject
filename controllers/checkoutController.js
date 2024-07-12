


const loadCheckout = async(req,res)=>{
    try {
        res.render('checkout',{isLoggedIn : req.session.userData})
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadCheckout
}