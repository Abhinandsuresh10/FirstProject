const prducts = require('../models/produntsModel');



//shop load...

const shopLoad = async(req,res)=>{
    try {
        const products = await prducts.find({is_delete:false})
        res.render('productShop',{product:products,isLoggedIn : req.session.userData})
    } catch (error) {
        console.log(error.message);
    }
}


//load prductdetails..

const loadProductDetails = async(req,res)=>{
    try {
        const {id} = req.query;
        const products = await prducts.findOne({_id:id})
        res.render('productDetails',{product:products,isLoggedIn : req.session.userData})  
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    shopLoad,
    loadProductDetails
}