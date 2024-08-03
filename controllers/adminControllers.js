const Admin = require('../models/adminModel');
const Coupon = require('../models/couponModal');
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
  


module.exports = {
    adminLogin,
    adminVerifyLogin,
    dashboardLoad,
    adminLogout,
    LoadCoupons,
    InsertCoupon,
    DeleteCoupon
};
