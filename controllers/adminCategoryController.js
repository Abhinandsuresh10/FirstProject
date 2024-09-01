
const User = require('../models/userModel');
const Category = require('../models/category');
const Brands = require('../models/brandsModel');
const Product = require('../models/produntsModel');
const CategoryOffer = require('../models/CategoryOffer');
const productOffer = require('../models/ProductOfferModel');




const categoryLoad = async(req,res)=>{
    try {
        const perPage = 6;
        const currentPage = parseInt(req.query.page) || 1;

        const totalBrands = await Category.countDocuments({is_delete:false});

        const totalPages = Math.ceil(totalBrands / perPage);

        const userList = await Category.find({is_delete:false})
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .exec();

        res.render('category',{categories:userList,message:'',currentPage,totalPages});
    } catch (error) {
        console.log(error.message);
    }
}

const addCategory = async(req,res)=>{
    
       const {categoryName} = req.body;
    try {

        const same = await Category.findOne({name:categoryName},{is_delete:true});

        if(same){
            const perPage = 6;
            const currentPage = parseInt(req.query.page) || 1;
    
            const totalBrands = await Category.countDocuments({is_delete:false});
    
            const totalPages = Math.ceil(totalBrands / perPage);
    
            const userList = await Category.find({is_delete:false})
            .skip((currentPage - 1) * perPage)
            .limit(perPage)
            .exec();
    
            res.render('category',{categories:userList,message:'already existed category',currentPage,totalPages});
      
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
        re.render('500');
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
        const perPage = 6;
        const currentPage = parseInt(req.query.page) || 1;

        const totalBrands = await Brands.countDocuments({is_delete:false});

        const totalPages = Math.ceil(totalBrands / perPage);

        const userList = await Brands.find({is_delete:false})
          .skip((currentPage - 1) * perPage)
          .limit(perPage)
          .exec();

        res.render('brands',{brands:userList,message:'',currentPage,totalPages});
    } catch (error) {
        console.log(error.message);
    }
}

const addBrand = async(req,res)=>{
    const {name} = req.body;
    try {
        const same = await Brands.findOne({name:name},{is_delete:true});

        if(same){

        const perPage = 6;
        const currentPage = parseInt(req.query.page) || 1;

        const totalBrands = await Brands.countDocuments({is_delete:false});

        const totalPages = Math.ceil(totalBrands / perPage);

        const userList = await Brands.find({is_delete:false})
          .skip((currentPage - 1) * perPage)
          .limit(perPage)
          .exec();

        res.render('brands',{brands:userList,message:'already existed brand',currentPage,totalPages});

        }else{
            
        const newBrands = new Brands({
            name:name,
            is_delete:false
        });
       
        await newBrands.save();
        res.redirect('/admin/brands');
    }
     
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
        re.render('500');
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

        const perPage = 6;
        const currentPage = parseInt(req.query.page) || 1;

        const totalOffers = await CategoryOffer.countDocuments({});
        const totalPages = Math.ceil(totalOffers / perPage);

        const categoryOffer = await CategoryOffer.find({})
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate('categoryId');

        const category = await Category.find({is_delete:false})
        res.render('categoryOffer',{category,categoryOffer,currentPage,totalPages})
        
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
        re.render('500');
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
        res.render('500');
    }
};

const DeleteCategoryOffer = async (req, res) => {
    try {
        const { id } = req.params;
        
        const offer = await CategoryOffer.findById(id);
        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }
        const categoryId = offer.categoryId;
        const category = await Category.findById(categoryId);

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        await Product.updateMany(
            { category: category.name, discount: { $gt: 0 } },
            { $set: { discount: 0 } }
        );
        await CategoryOffer.findByIdAndDelete(id);

        res.json({ success: true, message: 'Offer and product discounts removed successfully' });
    } catch (error) {
        console.error(error);
        re.render('500');
    }
};



const LoadProductOffers = async(req,res)=>{
    try {
        const perPage = 1;
        const currentPage = parseInt(req.query.page) || 1;

        const totalOffers = await productOffer.countDocuments({});
        const totalPages = Math.ceil(totalOffers / perPage);

        const productOffers = await productOffer.find({})
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate('productId');

        const products = await Product.find({ is_delete: false });

        res.render('productOffers',{products,productOffers,currentPage,totalPages})

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
      res.render('500');
    }
}


const UpdateProductOffer = async(req,res)=>{
    try {
        const { offerId, product, offerPercentage, expiryDate } = req.body;

        if (!offerId || !product || !offerPercentage || !expiryDate) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

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
        res.render('500')
    }
}


const DeleteProductOffer = async (req, res) => {
    try {
        const { id } = req.params;

        const offer = await productOffer.findById(id);
        if (!offer) {
            return res.status(404).json({ success: false, message: 'Offer not found' });
        }

        const productId = offer.productId;
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        product.discount = 0;
        await product.save();

        await productOffer.findByIdAndDelete(id);

        res.json({ success: true, message: 'Offer and product discount removed successfully' });
    } catch (error) {
        console.error(error);
        res.render('500')
    }
};




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