
const User = require('../models/userModel');
const Category = require('../models/category');
const Brands = require('../models/brandsModel');




const categoryLoad = async(req,res)=>{
    try {
        
        const userList = await Category.find({is_delete:false});
        res.render('category',{categories:userList,message:''});
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async(req,res)=>{
    
       const {categoryName} = req.body;
    try {

        const same = await Category.findOne({name:categoryName},{is_delete:true});
        const userList = await Category.find({is_delete:false});

        if(same){
            res.render('category',{categories:userList,message:'already existed category'})
        }else{
            const newCategory = new Category({
                name:categoryName,
                is_delete:false
            });
           
            await newCategory.save();
         
            res.redirect('/admin/category');
        }
        
       

    } catch (error) {
        console.log(error.message)
    }
}

const editCategory = async (req, res) => {
    try {
        const { categoryId, categoryName } = req.body;
        const updatedCategory = await Category.findByIdAndUpdate(
            categoryId,
            { $set: { name: categoryName } },
            { new: true }
        );
       
        res.redirect('/admin/category')
      
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Failed to update category.' });
    }
};

//delete category..

const deleteCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        await Category.findByIdAndUpdate({_id:id},{$set:{is_delete:true}});
        res.redirect('/admin/category');
    } catch (error) {
        console.log(error.message);
    }
}

const isdeletedCategory = async(req,res)=>{
    try {
        const userList = await Category.find({is_delete:true});
        res.render('deletedCategory',{categories:userList});
    } catch (error) {
        console.log(error.message);
    }
}
//recoverCategory..

const recoverCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        await Category.findByIdAndUpdate({_id:id},{$set:{is_delete:false}});
        res.redirect('/admin/deletedcategory');
    } catch (error) {
       console.log(error.message); 
    }
}

//brands area

const brandsLoad = async(req,res)=>{
    try {
        
        const userList = await Brands.find({is_delete:false});
        res.render('brands',{brands:userList});
    } catch (error) {
        console.log(error.message);
    }
}

const addBrand = async(req,res)=>{
    const {name} = req.body;
    try {
  
        const newBrands = new Brands({
            name:name,
            is_delete:false
        });
       
        await newBrands.save();
     
        res.redirect('/admin/brands');

    } catch (error) {
        console.log(error.message)
    }
}

const editBrand = async (req, res) => {
    try {
        const { brandId, brandName } = req.body;
      
        const updatedCategory = await Brands.findByIdAndUpdate(
            brandId,
            { $set: { name: brandName } },
            { new: true }
        );
       
        res.redirect('/admin/brands')
      
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ success: false, message: 'Failed to update category.' });
    }
};

//delete brands..

const deleteBrand = async(req,res)=>{
    try {
        const id = req.query.id;
        await Brands.findByIdAndUpdate({_id:id},{$set:{is_delete:true}});
        res.redirect('/admin/brands');
    } catch (error) {
        console.log(error.message);
    }
}

const deletedBrand = async(req,res)=>{
    try {
        const BrandList = await Brands.find({is_delete:true});
        res.render('deletedBrands',{brands:BrandList});
    } catch (error) {
        console.log(error.message);
    }
}

const recoverBrands = async(req,res)=>{
    try {
        const id = req.query.id;
        await Brands.findByIdAndUpdate({_id:id},{$set:{is_delete:false}});
        const BrandList = await Brands.find({is_delete:true});
        res.render('deletedBrands',{brands:BrandList});
    } catch (error) {
       console.log(error.message); 
    }
}




module.exports = {
    categoryLoad,
    addCategory,
    editCategory,
    deleteCategory,
    isdeletedCategory,
    recoverCategory,
    brandsLoad,
    addBrand,
    editBrand,
    deleteBrand,
    deletedBrand,
    recoverBrands,
    
}