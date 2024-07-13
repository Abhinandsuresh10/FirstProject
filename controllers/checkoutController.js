const address = require('../models/addressModel')


const loadCheckout = async(req,res)=>{
    try {
        const id = req.session.userData._id;
        const addresses = await address.find({userId : id})
        res.render('checkout',{isLoggedIn : req.session.userData,address:addresses})
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadCheckout
}