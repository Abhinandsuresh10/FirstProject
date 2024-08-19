const User = require('../models/userModel');



//users..

const userLoad = async(req,res)=>{
    try {
        const userList = await User.find();
        res.render('users',{users:userList});
    } catch (error) {
        console.log(error.message);
    }
}

const blockUser = async (req, res) => {
    try {
        const { user_id } = req.body; 
        
        await User.findByIdAndUpdate(user_id, { $set: { is_blocked: true } });
        res.json({ success: true, message: 'User has been blocked successfully.' });
    } catch (error) {
        console.error('Error blocking user:', error);
        res.render('500');
    }
};

const unblockUser = async (req, res) => {
    try {
        const { user_id } = req.body;
        await User.findByIdAndUpdate(user_id,{ $set: { is_blocked: false }});
        res.json({ success: true, message: 'User has been unblocked successfully.' });
    } catch (error){
        console.error('Error unblocking user:', error);
        res.render('500');
    }
};

module.exports = {
    userLoad,
    blockUser,
    unblockUser
};