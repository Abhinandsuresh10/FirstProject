const Admin = require('../models/adminModel');
const Coupon = require('../models/couponModal');
const Order = require('../models/orderSchema');
const Product = require('../models/produntsModel');
const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const adminLogin = async (req, res) => {
    try {
      res.render('adminLogin', { message: null, data: { email: '', password: '' } });
    } catch (error) {
        console.log(error.message);
    }
};

const adminVerifyLogin = async (req, res) => {

    try {
        const email = req.body.email;
        const password = req.body.password;

        const adminData = await Admin.findOne({ email: email });
   

        if (adminData) {
            const passwordMatch = await bcrypt.compare(password, adminData.password);

            if (passwordMatch) {
                req.session.adminData = adminData;
                res.redirect('/admin/dashboard'); 
              
            } else {
                res.render('adminLogin', { message: 'Password incorrect', data: { email, password } });
            }
        } else {
            res.render('adminLogin', { message: 'Email is not valid', data: { email, password } });
        }
    } catch (error) {
        console.log(error.message);
    }
};


//dashboard...

const dashboardLoad = async (req, res) => {
    try {
        res.render('dashboard'); 
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

//logout

const adminLogout = async(req,res)=>{
    try {
      delete req.session.adminData;
      res.redirect('/admin')  

    } catch (error) {
     console.log(error.message);
    }
}

//coupons

const LoadCoupons = async(req,res)=>{
    try {
        const coupons = await Coupon.find({})
        res.render('coupons',{coupons})
    } catch (error) {
       console.log(error.message) 
    }
}

const InsertCoupon = async (req, res) => {
    try {
      const { code, discountValue, expiryDate, minPurchaseAmount, usageLimit } = req.body;
      
      const existingCoupon = await Coupon.findOne({ code });
      
      if (existingCoupon) {
        return res.status(409).json({ message: 'Code already exists' });
      }
      
      const newCoupon = new Coupon({
        code,
        discountValue,
        expiryDate,
        minPurchaseAmount,
        usageLimit,
      });
      
      await newCoupon.save();
      res.status(201).json({ message: 'Coupon added successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error adding coupon' });
    }
  }


  const DeleteCoupon =async(req,res)=>{
    try {
        const { id } = req.params;
        const result = await Coupon.findByIdAndDelete(id);
        if (result) {
          res.status(200).json({ message: 'Coupon deleted successfully' });
        } else {
          res.status(404).json({ message: 'Coupon not found' });
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error deleting coupon' });
    }
  }


  const LoadSalesReport = async (req, res) => {
    try {
        const sales = await Order.find({ orderStatus: 'delivered' }).lean();

        const productIds = [];
        const userIds = [];

        sales.forEach(order => {
            userIds.push(order.user.toString());
            order.orderItems.forEach(item => {
                productIds.push(item.product.toString());
            });
        });

        const uniqueProductIds = [...new Set(productIds)];
        const uniqueUserIds = [...new Set(userIds)];

        const [products, users] = await Promise.all([
            Product.find({ _id: { $in: uniqueProductIds } }).lean(),
            User.find({ _id: { $in: uniqueUserIds } }).lean()
        ]);

        const productMap = products.reduce((map, product) => {
            map[product._id.toString()] = product;
            return map;
        }, {});

        const userMap = users.reduce((map, user) => {
            map[user._id.toString()] = user;
            return map;
        }, {});

        const salesWithDetails = sales.map(order => {
            return {
                ...order,
                user: userMap[order.user.toString()] || { name: 'Unknown' },
                orderItems: order.orderItems.map(item => ({
                    ...item,
                    product: productMap[item.product.toString()] || { name: 'Unknown' }
                }))
            };
        });

        res.render('salesReport', { sales: salesWithDetails });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};



const FilterSalesReport = async (req, res) => {
  try {

      const buildFilterCriteria = (query) => {
          let filterCriteria = { orderStatus: 'delivered' };

          if (query.salesPeriod) {
              const now = new Date();
              switch (query.salesPeriod) {
                  case 'Daily':
                      filterCriteria.createdAt = {
                          $gte: new Date(now.setHours(0, 0, 0, 0)),
                          $lte: new Date(now.setHours(23, 59, 59, 999))
                      };
                      break;
                  case 'weekly':
                      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                      const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
                      filterCriteria.createdAt = {
                          $gte: startOfWeek,
                          $lte: endOfWeek
                      };
                      break;
                  case 'monthly':
                      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                      filterCriteria.createdAt = {
                          $gte: startOfMonth,
                          $lte: endOfMonth
                      };
                      break;
                  case 'yearly':
                      const startOfYear = new Date(now.getFullYear(), 0, 1);
                      const endOfYear = new Date(now.getFullYear(), 11, 31);
                      filterCriteria.createdAt = {
                          $gte: startOfYear,
                          $lte: endOfYear
                      };
                      break;
              }
          }

          if (query.startDate && query.endDate) {
              filterCriteria.createdAt = {
                  $gte: new Date(query.startDate),
                  $lte: new Date(query.endDate)
              };
          }

          return filterCriteria;
      };

      const filterCriteria = buildFilterCriteria(req.query);

      const sales = await Order.find(filterCriteria).lean();

      const productIds = [];
      const userIds = [];

      sales.forEach(order => {
          userIds.push(order.user.toString());
          order.orderItems.forEach(item => {
              productIds.push(item.product.toString());
          });
      });

      const uniqueProductIds = [...new Set(productIds)];
      const uniqueUserIds = [...new Set(userIds)];

      const [products, users] = await Promise.all([
          Product.find({ _id: { $in: uniqueProductIds } }).lean(),
          User.find({ _id: { $in: uniqueUserIds } }).lean()
      ]);

      const productMap = products.reduce((map, product) => {
          map[product._id.toString()] = product;
          return map;
      }, {});

      const userMap = users.reduce((map, user) => {
          map[user._id.toString()] = user;
          return map;
      }, {});

      const salesWithDetails = sales.map(order => {
          return {
              ...order,
              user: userMap[order.user.toString()] || { name: 'Unknown' },
              orderItems: order.orderItems.map(item => ({
                  ...item,
                  product: productMap[item.product.toString()] || { name: 'Unknown' }
              }))
          };
      });

      console.log('Sales with Details:', salesWithDetails);

      res.render('salesReport', { sales: salesWithDetails });
  } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
  }
};




  


module.exports = {
    adminLogin,
    adminVerifyLogin,
    dashboardLoad,
    adminLogout,
    LoadCoupons,
    InsertCoupon,
    DeleteCoupon,
    LoadSalesReport,
    FilterSalesReport
};
