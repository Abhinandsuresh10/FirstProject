
const User = require('../models/userModel');
const Category = require('../models/category');




const categoryLoad = async(req,res)=>{
    try {
        
        const userList = await Category.find({is_delete:false});
        res.render('category',{categories:userList});
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async(req,res)=>{
    
       const {categoryName} = req.body;
    try {
        
        const newCategory = new Category({
            name:categoryName,
            is_delete:false
        });
       
        await newCategory.save();
     
        res.redirect('/admin/category');

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

module.exports = {
    categoryLoad,
    addCategory,
    editCategory,
    deleteCategory,
    isdeletedCategory,
    recoverCategory
}