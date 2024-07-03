const prducts = require('../models/produntsModel');


//shop load...

const shopLoad = async(req,res)=>{
    try {
        const products = await prducts.find({is_delete:false})
        res.render('productShop',{product:products})
    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    shopLoad,
}