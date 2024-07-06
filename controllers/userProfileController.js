const user = require('../models/userModel');
const address = require('../models/addressModel');


const loadProfile = async(req,res)=>{
    try {
      const id = req.session.userData._id;
      const users = await user.findOne({_id:id});
      
    res.render('userProfile',{isLoggedIn : req.session.userData,users})
    } catch (error) {
        console.log(error.message);
    }
}

const loadAddress = async(req,res)=>{
    try {
        const addresses = await address.find();
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
        res.status(500).json({ error: 'Server error' });
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


module.exports = {
    loadProfile,
    loadAddress,
    insertAddress,
    deleteAddress,
    editAddress
}