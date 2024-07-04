const Admin = require('../models/adminModel');
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
      req.session.destroy();
      res.redirect('/admin')  

    } catch (error) {
     console.log(error.message);
    }
}

module.exports = {
    adminLogin,
    adminVerifyLogin,
    dashboardLoad,
    adminLogout
};
