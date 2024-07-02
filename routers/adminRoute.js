const express = require('express');
const adminController = require('../controllers/adminControllers');
const adminUserController = require('../controllers/adminUserController');
const adminCategoryController = require('../controllers/adminCategoryController');
const adminProductsController = require('../controllers/adminProductsController');
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

adminRoute.get('/', adminController.adminLogin);
adminRoute.post('/login', adminController.adminVerifyLogin);
adminRoute.get('/dashboard', adminController.dashboardLoad);
adminRoute.get('/users',adminUserController.userLoad);
adminRoute.get('/category',adminCategoryController.categoryLoad);

adminRoute.post('/category',adminCategoryController.addCategory);
adminRoute.post('/editCategory',adminCategoryController.editCategory);
adminRoute.get('/delete-category',adminCategoryController.deleteCategory);
adminRoute.get('/deletedcategory',adminCategoryController.isdeletedCategory);
adminRoute.get('/recover',adminCategoryController.recoverCategory)

//user block unblock..
adminRoute.post('/block',adminUserController.blockUser);
adminRoute.post('/unblock',adminUserController.unblockUser);

//products...

adminRoute.get('/products',adminProductsController.productsLoad);
adminRoute.get('/addProducts',adminProductsController.addProductsLoad);
adminRoute.post('/insertProducts',upload.array('image',3),adminProductsController.insertProducts);

//delete product


adminRoute.get('/deleteProducts',adminProductsController.deleteProduct);
adminRoute.get('/deletedProducts',adminProductsController.deletedProductspage);
adminRoute.get('/recoverProducts',adminProductsController.recoverProduct);


//edit Product

adminRoute.get('/editProducts',adminProductsController.editProductLoad);
adminRoute.post('/insertEditProducts',upload.array('image',3),adminProductsController.editProduct)

module.exports = adminRoute;