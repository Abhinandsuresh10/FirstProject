const Admin = require('../models/adminModel');
const Category = require('../models/category');
const Brands = require('../models/brandsModel')
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
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const canceledOrders = await Order.countDocuments({ orderStatus: 'Canceled' });
    const returnedOrders = await Order.countDocuments({ orderStatus: 'order returned' });

 
    const revenue = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['Canceled', 'order returned'] } 
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const razorpayRevenue  = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['Canceled', 'order returned'] },
          paymentMethod: 'RazorPay' 
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const TotalOrderedAmount = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const discounts = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ['Canceled', 'order returned'] } 
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$AllDiscount' }
        }
      }
    ]);
    
    const totalDiscount = discounts[0] ? discounts[0].total : 0;

    const topProducts = await Product.find({is_delete:false}).sort({orderCount:-1}).limit(5) 
    const topCategory = await Category.find({is_delete:false}).sort({orderCount:-1}).limit(5)
    const topBrands = await Brands.find({is_delete:false}).sort({orderCount:-1}).limit(5) 

    res.render('dashboard', {
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      canceledOrders,
      returnedOrders,
      totalDiscount,
      revenue: revenue[0] ? revenue[0].total : 0,
      TotalOrderedAmount: TotalOrderedAmount[0] ? TotalOrderedAmount[0].total : 0,
      razorpayRevenue : razorpayRevenue[0] ? razorpayRevenue[0].total : 0,
      topProducts,
      topCategory,
      topBrands
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
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

const EditCoupon = async (req, res) => {
    try {
      const { code, discountValue, expiryDate, minPurchaseAmount, usageLimit } = req.body;
      const  { id } = req.params;
      
      const existingCoupon = await Coupon.findOne({ code, _id: { $ne: id } });
      
      if (existingCoupon) {
        return res.status(409).json({ message: 'Code already exists' });
      }

       const updatedCoupon = await Coupon.findByIdAndUpdate(id, {
        code,
        discountValue,
        expiryDate,
        minPurchaseAmount,
        usageLimit,
      }, { new: true }); 
  
      if (!updatedCoupon) {
        return res.status(404).json({ message: 'Coupon not found' });
      }

      res.status(201).json({ message: 'Coupon updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating coupon' });
    }
  }

  const InsertCoupon = async (req, res) => {
    try {
      const { code, discountValue, expiryDate, minPurchaseAmount, usageLimit } = req.body;

      const existingCoupon = await Coupon.findOne({ code });
      console.log(code ,'old code', existingCoupon, 'newibw code')
      if (existingCoupon) {
        return res.status(409).json({ message: 'Code already exists' });
      }else{
      
      const newCoupon = new Coupon({
        code,
        discountValue,
        expiryDate,
        minPurchaseAmount,
        usageLimit,
      });
      
      await newCoupon.save();
    }
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
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 6; 
        const skip = (page - 1) * limit;

        const totalSales = await Order.countDocuments({ orderStatus: 'delivered' });

        const sales = await Order.find({ orderStatus: 'delivered' })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        const grandTotalAmount = sales.reduce((total, order) => total + order.amount, 0);

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
        const discounts = await Order.aggregate([
          {
            $match: {
              orderStatus: { $nin: ['Canceled', 'order returned'] } 
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$AllDiscount' }
            }
          }
        ]);
        const totalDiscount = discounts[0] ? discounts[0].total : 0;

        const totalOrders = await Order.countDocuments({orderStatus: 'delivered'});
        const totalPages = Math.ceil(totalSales / limit);
        res.render('salesReport', { sales: salesWithDetails , currentPage: page,totalPages: totalPages,limit: limit,grandTotalAmount,totalDiscount,totalOrders});
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
};



const FilterSalesReport = async (req, res) => {
    try {

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 6;
      const skip = (page - 1) * limit;
  
      const buildFilterCriteria = (query) => {
        let filterCriteria = { orderStatus: 'delivered' };
  
        if (query.salesPeriod) {
          const now = new Date();
          switch (query.salesPeriod.toLowerCase()) {
            case 'daily':
              filterCriteria.createdAt = {
                $gte: new Date(now.setHours(0, 0, 0, 0)),
                $lte: new Date(now.setHours(23, 59, 59, 999)),
              };
              break;
            case 'weekly':
              const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
              const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6));
              filterCriteria.createdAt = {
                $gte: startOfWeek,
                $lte: endOfWeek,
              };
              break;
            case 'monthly':
              const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
              const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
              filterCriteria.createdAt = {
                $gte: startOfMonth,
                $lte: endOfMonth,
              };
              break;
            case 'yearly':
              const startOfYear = new Date(now.getFullYear(), 0, 1);
              const endOfYear = new Date(now.getFullYear(), 11, 31);
              filterCriteria.createdAt = {
                $gte: startOfYear,
                $lte: endOfYear,
              };
              break;
          }
        }
  
        if (query.startDate && query.endDate) {
          filterCriteria.createdAt = {
            $gte: new Date(query.startDate),
            $lte: new Date(query.endDate),
          };
        }
  
        return filterCriteria;
      };
  
      const filterCriteria = buildFilterCriteria(req.query);
  
      const totalDocs = await Order.countDocuments(filterCriteria);
  
      const sales = await Order.find(filterCriteria)
        .skip(skip)
        .limit(limit)
        .lean();
      const grandTotalAmount = sales.reduce((total, order) => total + order.amount, 0);
      const productIds = [];
      const userIds = [];
      sales.forEach((order) => {
        userIds.push(order.user.toString());
        order.orderItems.forEach((item) => {
          productIds.push(item.product.toString());
        });
      });
      const uniqueProductIds = [...new Set(productIds)];
      const uniqueUserIds = [...new Set(userIds)];
  
      const [products, users] = await Promise.all([
        Product.find({ _id: { $in: uniqueProductIds } }).lean(),
        User.find({ _id: { $in: uniqueUserIds } }).lean(),
      ]);
  
      const productMap = products.reduce((map, product) => {
        map[product._id.toString()] = product;
        return map;
      }, {});
  
      const userMap = users.reduce((map, user) => {
        map[user._id.toString()] = user;
        return map;
      }, {});
  
      const salesWithDetails = sales.map((order) => ({
        ...order,
        user: userMap[order.user.toString()] || { name: 'Unknown' },
        orderItems: order.orderItems.map((item) => ({
          ...item,
          product: productMap[item.product.toString()] || { name: 'Unknown' },
        })),
      }));
  
      const totalPages = Math.ceil(totalDocs / limit);

      const discounts = await Order.aggregate([
        {
          $match: {
            orderStatus: { $nin: ['Canceled', 'order returned'] } 
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$AllDiscount' }
          }
        }
      ]);
      const totalDiscount = discounts[0] ? discounts[0].total : 0;

      const totalOrders = await Order.countDocuments({orderStatus: 'delivered'});

      res.render('salesReport', {
        sales: salesWithDetails,
        currentPage: page,
        totalPages,
        limit,
        grandTotalAmount,
        totalDiscount,
        totalOrders
      });
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  };
  


  const LoadDashboardWeekly = async (req, res) => {
    try {
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);

        const weeklyOrders = await Order.find({ createdAt: { $gte: startOfWeek } });
     
        
        const revenue = weeklyOrders.reduce((total, order) => total + order.amount, 0);
       
        const orderCounts = {
            pending: weeklyOrders.filter(order => order.orderStatus === 'pending').length,
            shipped: weeklyOrders.filter(order => order.orderStatus === 'shipped').length,
            delivered: weeklyOrders.filter(order => order.orderStatus === 'delivered').length,
            canceled: weeklyOrders.filter(order => order.orderStatus === 'Canceled').length,
            returned: weeklyOrders.filter(order => order.orderStatus === 'order returned').length,
        };
        
        res.status(200).json({ revenue, orderCounts });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch weekly data' });
    }
};

const LoadDashboardMonthly = async (req, res) => {
  try {
      const startOfMonth = new Date();
      startOfMonth.setDate(1); 

      const monthlyOrders = await Order.find({ createdAt: { $gte: startOfMonth } });

      const revenue = monthlyOrders.reduce((total, order) => total + order.amount, 0);

      const orderCounts = {
          pending: monthlyOrders.filter(order => order.orderStatus === 'pending').length,
          shipped: monthlyOrders.filter(order => order.orderStatus === 'shipped').length,
          delivered: monthlyOrders.filter(order => order.orderStatus === 'delivered').length,
          canceled: monthlyOrders.filter(order => order.orderStatus === 'Canceled').length,
          returned: monthlyOrders.filter(order => order.orderStatus === 'order returned').length,
      };
    
     
      res.status(200).json({ revenue, orderCounts });
  } catch (error) {
      res.status(500).json({ error: 'Failed to fetch monthly data' });
  }
};



const LoadDashboardYearly = async (req, res) => {
  try {
      const startOfYear = new Date();
      startOfYear.setMonth(0); 
      startOfYear.setDate(1); 
      startOfYear.setHours(0, 0, 0, 0); 

      const endOfYear = new Date(startOfYear);
      endOfYear.setFullYear(startOfYear.getFullYear() + 1); 
      endOfYear.setDate(endOfYear.getDate() - 1); 

      const yearlyOrders = await Order.find({
          createdAt: { $gte: startOfYear, $lte: endOfYear }
      });

      const revenue = yearlyOrders.reduce((total, order) => total + order.amount, 0);

      const orderCounts = {
          pending: yearlyOrders.filter(order => order.orderStatus === 'pending').length,
          shipped: yearlyOrders.filter(order => order.orderStatus === 'shipped').length,
          delivered: yearlyOrders.filter(order => order.orderStatus === 'delivered').length,
          canceled: yearlyOrders.filter(order => order.orderStatus === 'Canceled').length,
          returned: yearlyOrders.filter(order => order.orderStatus === 'order returned').length,
      };
   
      res.status(200).json({ revenue, orderCounts });
  } catch (error) {
      console.error('Failed to fetch yearly data:', error.message);
      res.status(500).json({ error: 'Failed to fetch yearly data' });
  }
};


  
const LoadDashboardDaily = async (req, res) => {
  try {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0); 

      const endOfDay = new Date(startOfDay);
      endOfDay.setHours(23, 59, 59, 999); 

      const dailyOrders = await Order.find({
          createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const revenue = dailyOrders.reduce((total, order) => total + order.amount, 0);

      const orderCounts = {
          pending: dailyOrders.filter(order => order.orderStatus === 'pending').length,
          shipped: dailyOrders.filter(order => order.orderStatus === 'shipped').length,
          delivered: dailyOrders.filter(order => order.orderStatus === 'delivered').length,
          canceled: dailyOrders.filter(order => order.orderStatus === 'Canceled').length,
          returned: dailyOrders.filter(order => order.orderStatus === 'order returned').length,
      };

      res.status(200).json({ revenue, orderCounts });
  } catch (error) {
      console.error('Failed to fetch daily data:', error.message);
      res.status(500).json({ error: 'Failed to fetch daily data' });
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
    FilterSalesReport,
    EditCoupon,
    LoadDashboardWeekly,
    LoadDashboardMonthly,
    LoadDashboardYearly,
    LoadDashboardDaily
};
