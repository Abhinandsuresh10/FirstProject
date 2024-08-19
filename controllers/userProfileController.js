const user = require('../models/userModel');
const address = require('../models/addressModel');
const bcrypt = require('bcrypt');



const loadProfile = async(req,res)=>{
    try {
      const id = req.session.userData._id;
      const users = await user.findOne({_id : id});

    res.render('userProfile',{isLoggedIn : req.session.userData,users})
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddress = async(req,res)=>{
    
    try {
        const id = req.session.userData._id;
        const addresses = await address.find({userId : id});
        console.log(address);
        res.render('address',{isLoggedIn : req.session.userData,address:addresses})
    } catch (error) {
        console.log(error.message);
    }
}   

const insertAddress = async(req,res)=>{
    try {
        const userId = req.session.userData._id;
        const {name,mobile,street,city,state,zipcode,country} = req.body;
  
        const newAddress = await address({
            userId:userId,
            name:name,
            mobile:mobile,
            street:street,
            city:city,
            state:state,
            zipcode:zipcode,
            country:country
        });
        await newAddress.save();
        res.redirect('/address')
    } catch (error) {
        console.log(error.message);
    }
}

const deleteAddress = async(req, res) => {
    try {
        const id = req.query.id;
        const deletedAddress = await address.findByIdAndDelete(id);

        if (!deletedAddress) {
            return res.status(404).json({ error: 'Address not found' });
        }

        res.status(200).json({ message: 'Address deleted successfully' });
    } catch (error) {
        console.error(error);
        res.render('500');
    }
};

const editAddress = async(req,res)=>{
    try {
        const {name,mobile,street,city,state,zipcode,country} = req.body;
        const id = req.query.id;
        await address.findByIdAndUpdate(id,{
            name,
            mobile,
            street,
            city,
            state,
            zipcode,
            country
        });
        res.redirect('/address')
    } catch (error) {
      console.log(error.message);  
    }
}


const userUpdates = async (req, res) => {
    try {
        const { name, mobile } = req.body;
        const image = req.file;
        const userId = req.session.userData._id;
        if(image){
            await user.findByIdAndUpdate(userId, {
                $set: {
                    name: name,
                    mobile: mobile,
                    image:image.filename
                }
            });
        }else{
            await user.findByIdAndUpdate(userId, {
                $set: {
                    name: name,
                    mobile: mobile,
                }
            });
        }

        res.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.render('500');
    }
};

const changePassword = async(req,res)=>{
    const { currentPassword, newPassword } = req.body;
    const userId = req.session.userData._id; 

    try {
       
       
        const User = await user.findById(userId);
        
        if (!User) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, User.password);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Current password is incorrect' });
        }

        const salt = await bcrypt.genSalt(10);
        User.password = await bcrypt.hash(newPassword, salt);
        await User.save();

        res.status(200).json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.render('500');
    }
}

module.exports = {
    loadProfile,
    loadAddress,
    insertAddress,
    deleteAddress,
    editAddress,
    userUpdates,
    changePassword

}