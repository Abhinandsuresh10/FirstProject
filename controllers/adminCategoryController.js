
const User = require('../models/userModel');
const Category = require('../models/category');
const Brands = require('../models/brandsModel');
const Product = require('../models/produntsModel');
const CategoryOffer = require('../models/CategoryOffer');
const productOffer = require('../models/ProductOfferModel');




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
        const cat = await Category.findByIdAndUpdate({_id:id},{$set:{is_delete:true}});
        
        await Product.updateMany({ category: cat.name }, { $set: { is_delete: true } });

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

//category offer

const LoadCategoryOffers = async(req,res)=>{
    try {
        const categoryOffer = await CategoryOffer.find({}).populate('categoryId');
        const category = await Category.find({is_delete:false})
        res.render('CategoryOffer',{category,categoryOffer})
        
    } catch (error) {
        console.log(error.message)
    }
}

 const InsertCategoryOffer = async (req, res) => {

        const { category, offerPercentage, expiryDate } = req.body;
    
        try {
        const cate = await Category.findById(category);
        if (!cate) {
            return res.status(404).json({ error: 'Category not found' });
        }
    
        const products = await Product.find({ category: cate.name });
    
        for (let product of products) {
            const originalPrice = product.price;
            const discountAmount = (originalPrice * offerPercentage) / 100;
            const result = Math.ceil(discountAmount);
            if(discountAmount > product.discount){
                product.discount = result;
                await product.save();
            }

            
        }
    
        const newOffer = new CategoryOffer({
            categoryId: category,
            discountPercentage: offerPercentage,
            expiryDate: new Date(expiryDate),
            isActive: true
        });
    
        await newOffer.save();
        res.status(200).json({ message: 'Offer added and products updated successfully!' });
        } catch (error) {
        console.error('Error adding offer:', error);
        res.status(500).json({ error: 'An error occurred while adding the offer.' });
        }
    };
  

  const UpdateCategoryOffer = async (req, res) => {
    try {
        const { offerId, category, offerPercentage, expiryDate } = req.body;

        if (!offerId || !category || !offerPercentage || !expiryDate) {
            return res.status(400).json({ error: 'All fields are required.' });
        }
        const cate = await Category.findById(category);
        if (!cate) {
            return res.status(404).json({ error: 'Category not found' });
        }
    
        const products = await Product.find({ category: cate.name });
    
        for (let product of products) {
            const originalPrice = product.price;
            const discountAmount = (originalPrice * offerPercentage) / 100;
            const result = Math.ceil(discountAmount);
            if(discountAmount > product.discount){
                product.discount = result;
                await product.save();
            }

            
        }

        const updatedOffer = await CategoryOffer.findByIdAndUpdate(
            offerId,
            {
                categoryId: category,
                discountPercentage: offerPercentage,
                expiryDate: new Date(expiryDate)
            },
            { new: true } 
        );

        if (!updatedOffer) {
            return res.status(404).json({ error: 'Offer not found.' });
        }
        res.status(200).json(updatedOffer);
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ error: 'An error occurred while updating the offer.' });
    }
};

const DeleteCategoryOffer =async(req,res) => {
    try {
        const { id } = req.params;
        await CategoryOffer.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to delete offer' });
    }
}


const LoadProductOffers = async(req,res)=>{
    try {
        const productOffers = await productOffer.find({}).populate('productId');
        const products = await Product.find({is_delete:false})
        res.render('productOffers',{products,productOffers})
    } catch (error) {
        console.log(error.message)
    }
}


const InsertProductOffer = async(req,res)=>{
    const { product, offerPercentage, expiryDate } = req.body;

    try {
        const productData = await Product.findById(product);   
        if (!productData) {
          return res.status(404).json({ error: 'Product not found' });
        }
    
        const originalPrice = productData.price;
        const discountAmount = (originalPrice * offerPercentage) / 100;
        const result = Math.ceil(discountAmount);
        if(discountAmount > productData.discount){
            productData.discount = result;
            await productData.save();
        }
        

      const newOffer = new productOffer({
        productId: product,
        discountPercentage: offerPercentage,
        expiryDate: new Date(expiryDate),
        isActive: true
      });
  
      await newOffer.save();
      res.status(200).json({ message: 'Offer added successfully!' });
    } catch (error) {
      console.error('Error adding offer:', error);
      res.status(500).json({ error: 'An error occurred while adding the offer.' });
    }
}


const UpdateProductOffer = async(req,res)=>{
    try {
        const { offerId, product, offerPercentage, expiryDate } = req.body;

        if (!offerId || !product || !offerPercentage || !expiryDate) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const updatedOffer = await productOffer.findByIdAndUpdate(
            offerId,
            {
                productId: product,
                discountPercentage: offerPercentage,
                expiryDate: new Date(expiryDate)
            },
            { new: true } 
        );

        if (!updatedOffer) {
            return res.status(404).json({ error: 'Offer not found.' });
        }
        res.status(200).json(updatedOffer);
    } catch (error) {
        console.error('Error updating offer:', error);
        res.status(500).json({ error: 'An error occurred while updating the offer.' });
    }
}


const DeleteProductOffer = async(req,res)=>{
    try {
        const { id } = req.params;
        await productOffer.findByIdAndDelete(id);
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Failed to delete offer' });
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
    LoadCategoryOffers,
    InsertCategoryOffer,
    UpdateCategoryOffer,
    DeleteCategoryOffer,
    LoadProductOffers,
    InsertProductOffer,
    UpdateProductOffer,
    DeleteProductOffer
    
}