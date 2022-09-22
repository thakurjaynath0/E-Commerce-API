const User = require('../models/User');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const {attachCookiesToResponse,createTokenUser,checkPermissions} = require('../utils');


const getAllUsers = async(req,res)=>{ 
   const users = await User.find({role:'admin'}).select('-password');

   if(!users){
       throw new CustomError.NotFoundError('No users found');
   }

   res.status(StatusCodes.OK).json({users});

};


const getSingleUser = async(req,res)=>{
   const {id} = req.params;
   const user = await User.findOne({_id:id,role:'user'}).select('-password');

   if(!user){
    throw new CustomError.NotFoundError(`No user found with id:${id}`);
}

    checkPermissions(req.user,user._id);

    res.status(StatusCodes.OK).json({user});
   
};


const showCurrentUser = async(req,res)=>{
    res.status(StatusCodes.OK).json({user:req.user});
};

const updateUser = async(req,res)=>{
    const {name,email} = req.body;
    if(!name || !email){
        throw new CustomError.BadRequestError('Please provide name and email');
    }

    const user = await User.findOne({_id:req.user.userId});
    user.name = name;
    user.email = email;

    await user.save();

    const tokenUser = createTokenUser(user);
    attachCookiesToResponse({res,user:tokenUser});
    res.status(StatusCodes.OK).json({user:tokenUser});    

};


const updateUserPassword = async(req,res)=>{
    const {oldPassword, newPassword} = req.body;

    if(!oldPassword || !newPassword){
        throw new CustomError.BadRequestError('Please provide old and new password');
    }

    const user = await User.findOne({_id:req.user.userId});

    const isPasswordCorrect = await user.comparePassword(oldPassword);

    if(!isPasswordCorrect){
        throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }

    user.password = newPassword;
    await user.save();
    res.status(StatusCodes.OK).json({msg:'Successfully updated password'});

};


module.exports = {
    getAllUsers,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
}


//update user with findOneAndUpdate
// const updateUser = async(req,res)=>{
//     const {name,email} = req.body;
//     if(!name || !email){
//         throw new CustomError.BadRequestError('Please provide name and email');
//     }

//     const user = await User.findOneAndUpdate(
//         {_id:req.user.userId},
//         {name,email},
//         {new:true,runValidators:true});

//     const tokenUser = createTokenUser(user);
//     attachCookiesToResponse({res,user:tokenUser});
//     res.status(StatusCodes.OK).json({user:tokenUser});    

// };