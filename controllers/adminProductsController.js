const Category = require('../models/category');
const prducts = require('../models/produntsModel');
const brand = require('../models/brandsModel');
const CategoryOffer = require('../models/CategoryOffer');


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
    const {name,category,brand,model,material,price,stock,discription} = req.body;
    try {

        const cate = await Category.findOne({name:category});
        const discount = await CategoryOffer.findOne({categoryId:cate._id});
        const offerDisc = discount?.discountPercentage;
        const resDisc = Math.ceil((price * offerDisc) / 100);
   
      if(discount){
        const imagePaths = req.files.map(file => file.filename);
        console.log(imagePaths)
        const newproduct = await prducts({
            name:name,
            category:category,
            brand:brand,
            model:model,
            material:material,
            price:price,
            discount:resDisc,
            stock:stock,
            discription:discription,
            image: imagePaths,
            is_delete:false
        });
        await newproduct.save();
      }else{
        const imagePaths = req.files.map(file => file.filename);
        const newproduct = await prducts({
            name:name,
            category:category,
            brand:brand,
            model:model,
            material:material,
            price:price,
            stock:stock,
            discription:discription,
            image: imagePaths,
            is_delete:false
        });
        await newproduct.save();
      }
      
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

        const existingProduct = await prducts.findById(id);
        const existingImages = existingProduct.image || [];

        const updatedImages = [...existingImages, ...imagePaths];


        const updateData = {
            name,
            category,
            brand,
            model,
            material,
            price,
            discount,
            stock,
            discription,
            image: updatedImages
        };

        
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