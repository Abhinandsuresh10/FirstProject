const prducts = require('../models/produntsModel');



//shop load...

const shopLoad = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 5; 
        const skip = (page - 1) * limit; 

        const totalProducts = await prducts.countDocuments({ is_delete: false });
        
        const products = await prducts.find({ is_delete: false }).skip(skip).limit(limit);
        
        res.render('productShop', {
            product: products,
            currentPage: page,
            totalPages: Math.ceil(totalProducts / limit),
            isLoggedIn: req.session.userData
        });
    } catch (error) {
        console.log(error.message);
    }
};


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