const Category = require('../models/category');
const prducts = require('../models/produntsModel');
const brand = require('../models/brandsModel');

const productsLoad = async(req,res)=>{
    try {
       
        const isProducts = await prducts.find({is_delete:false});
        res.render('products',{product:isProducts});
    } catch (error) {
        console.log(error.message);
    }
}

const addProductsLoad = async(req,res)=>{
    try {
        const categories = await Category.find({is_delete:false});
        const brands = await brand.find({is_delete:false});
        res.render('addProducts',{categories:categories,brand:brands});
    } catch (error) {
        console.log(error.message);
    }
}

const insertProducts = async(req,res)=>{
    const {name,category,brand,model,material,price,discount,stock,discription} = req.body;
    try {
     
        const imagePaths = req.files.map(file => file.filename);
        const newproduct = await prducts({
            name:name,
            category:category,
            brand:brand,
            model:model,
            material:material,
            price:price,
            discount:discount,
            stock:stock,
            discription:discription,
            image: imagePaths,
            is_delete:false
        });
        await newproduct.save();
        res.redirect('/admin/products')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteProduct = async(req,res)=>{
    try {     
        const id = req.query.id;
        await prducts.findByIdAndUpdate({_id:id},{$set:{is_delete:true}});
        res.redirect('/admin/products');
    } catch (error) {
        
    }
}


const deletedProductspage = async(req,res)=>{
    try {
        const product = await prducts.find({is_delete:true});
     
        res.render('deletedProducts',{product:product})
    } catch (error) {
        console.log(error.message);
    }
}

const recoverProduct = async(req,res)=>{
    try {
        const id = req.query.id;
      
        await prducts.findByIdAndUpdate(id,{$set:{is_delete:false}});
        res.redirect('/admin/deletedProducts');
    } catch (error) {
        console.log(error.message);
    }
}

//edit product

const editProductLoad  = async(req,res)=>{
    try {
        const id = req.query.id;
        const product = await prducts.findOne({_id:id})
        const categories = await Category.find({is_delete:false});
        const brands = await brand.find({is_delete:false})
        res.render('editProducts',{product,categories,brands});
    } catch (error) {
        console.log(error.message);
    }
}


const editProduct = async (req, res) => {
    try {
        const imagePaths = req.files.map(file => file.filename);
        const { name, category, brand, model, material, price, discount, stock, discription } = req.body;
        const id = req.query.pid;
        let updateData = {
            name,
            category,
            brand,
            model,
            material,
            price,
            discount,
            stock,
            discription
        };
        if (imagePaths.length > 0) {
            updateData.image = imagePaths;
        }

        await prducts.updateOne({ _id: id }, { $set: updateData });
        const isProducts = await prducts.find({ is_delete: false });
        res.render('products', { product: isProducts });
    } catch (error) {
        console.log(error.message);
    }
}




module.exports = {
    productsLoad,
    addProductsLoad,
    insertProducts,
    deleteProduct,
    deletedProductspage,
    recoverProduct,
    editProductLoad,
    editProduct
}