
const express = require('express');
const adminController = require('../controllers/adminControllers');
const adminUserController = require('../controllers/adminUserController');
const adminCategoryController = require('../controllers/adminCategoryController');
const adminProductsController = require('../controllers/adminProductsController');
const adminOrderController = require('../controllers/adminOrderController')
const adminAuth = require('../middilewares/adminAuth') 
const session = require('express-session');
const config = require('../config/config');

const adminRoute = express();

adminRoute.use(session({
    secret: config.sessionSecret,
    saveUninitialized: false,
    resave: false,
    cookie: { secure: false }
}));

const multer = require('multer');
const path = require('path');

adminRoute.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/productImages'));
    },
    filename: (req, file, cb) => {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const upload = multer({ storage: storage });

const bodyParser = require('body-parser');
adminRoute.use(bodyParser.json());
adminRoute.use(bodyParser.urlencoded({ extended: true }));

adminRoute.set('view engine', 'ejs');
adminRoute.set('views', './views/admin');

// Public routes
adminRoute.get('/', adminAuth.isAdminLogout, adminController.adminLogin);
adminRoute.post('/login', adminAuth.isAdminLogout, adminController.adminVerifyLogin);

// Protected routes
adminRoute.get('/dashboard', adminAuth.isAdminLogin, adminController.dashboardLoad);
adminRoute.get('/users', adminAuth.isAdminLogin, adminUserController.userLoad);
adminRoute.get('/category', adminAuth.isAdminLogin, adminCategoryController.categoryLoad);

adminRoute.post('/category', adminAuth.isAdminLogin, adminCategoryController.addCategory);
adminRoute.post('/editCategory', adminAuth.isAdminLogin, adminCategoryController.editCategory);
adminRoute.post('/delete-category', adminAuth.isAdminLogin, adminCategoryController.deleteCategory);
adminRoute.get('/deletedcategory', adminAuth.isAdminLogin, adminCategoryController.isdeletedCategory);
adminRoute.get('/recover', adminAuth.isAdminLogin, adminCategoryController.recoverCategory);

// User block/unblock
adminRoute.post('/block', adminAuth.isAdminLogin, adminUserController.blockUser);
adminRoute.post('/unblock', adminAuth.isAdminLogin, adminUserController.unblockUser);

// Products
adminRoute.get('/products', adminAuth.isAdminLogin, adminProductsController.productsLoad);
adminRoute.get('/addProducts', adminAuth.isAdminLogin, adminProductsController.addProductsLoad);
adminRoute.post('/insertProducts', adminAuth.isAdminLogin, upload.array('image', 10), adminProductsController.insertProducts);

// Delete product
adminRoute.get('/deleteProducts', adminAuth.isAdminLogin, adminProductsController.deleteProduct);
adminRoute.get('/deletedProducts', adminAuth.isAdminLogin, adminProductsController.deletedProductspage);
adminRoute.get('/recoverProducts', adminAuth.isAdminLogin, adminProductsController.recoverProduct);

// Edit product
adminRoute.get('/editProducts', adminAuth.isAdminLogin, adminProductsController.editProductLoad);
adminRoute.post('/insertEditProducts', adminAuth.isAdminLogin, upload.array('image', 10), adminProductsController.editProduct);

// Brands
adminRoute.get('/brands', adminAuth.isAdminLogin, adminCategoryController.brandsLoad);
adminRoute.post('/brands', adminAuth.isAdminLogin, adminCategoryController.addBrand);
adminRoute.post('/editBrand', adminAuth.isAdminLogin, adminCategoryController.editBrand);
adminRoute.post('/delete-brand', adminAuth.isAdminLogin, adminCategoryController.deleteBrand);
adminRoute.get('/deletedBrand', adminAuth.isAdminLogin, adminCategoryController.deletedBrand);
adminRoute.get('/brandrecover', adminAuth.isAdminLogin, adminCategoryController.recoverBrands);

//orders

adminRoute.get('/orders', adminAuth.isAdminLogin, adminOrderController.loadorders);
adminRoute.get('/adminOrderView',adminOrderController.LoadOrderView);
adminRoute.post('/updateOrderStatus',adminOrderController.ChangeStatus);


//offers

adminRoute.get('/CategoryOffers', adminAuth.isAdminLogin,adminCategoryController.LoadCategoryOffers);
adminRoute.post('/addCetegoryOffer',adminCategoryController.InsertCategoryOffer);
adminRoute.put('/editCategoryOffer',adminCategoryController.UpdateCategoryOffer);
adminRoute.delete('/deletecategoryoffer/:id',adminCategoryController.DeleteCategoryOffer);
adminRoute.get('/productOffers', adminAuth.isAdminLogin,adminCategoryController.LoadProductOffers);
adminRoute.post('/addProductOffer',adminCategoryController.InsertProductOffer);
adminRoute.put('/editProductOffer',adminCategoryController.UpdateProductOffer);
adminRoute.delete('/deleteproductoffer/:id',adminCategoryController.DeleteProductOffer);


//coupons

adminRoute.get('/Coupons', adminAuth.isAdminLogin,adminController.LoadCoupons);
adminRoute.post('/addCoupon',adminController.InsertCoupon);
adminRoute.put('/editCoupon/:id',adminController.EditCoupon)
adminRoute.delete('/deleteCoupon/:id',adminController.DeleteCoupon);

//sales report

adminRoute.get('/SalesReport', adminAuth.isAdminLogin,adminController.LoadSalesReport);
adminRoute.get('/FilterSalesReport',adminController.FilterSalesReport);
adminRoute.get('/DashboardWeekly',adminController.LoadDashboardWeekly);
adminRoute.get('/DashboardMonthly',adminController.LoadDashboardMonthly);
adminRoute.get('/DashboardYearly',adminController.LoadDashboardYearly);
adminRoute.get('/DashboardDaily',adminController.LoadDashboardDaily)

//logout

adminRoute.get('/logout',adminController.adminLogout);

adminRoute.use((req,res,next)=> {
    res.status(500).render('500')
})

module.exports = adminRoute;