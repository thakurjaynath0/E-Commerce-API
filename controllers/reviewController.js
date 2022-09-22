const Review = require('../models/Review');
const Product = require('../models/Product');
const {StatusCodes} = require('http-status-codes');
const CustomError = require('../errors');
const {checkPermissions} = require('../utils');


const createReview = async(req,res)=>{
    const {product:productId} = req.body;
    const isValidproduct = await Product.findOne({_id:productId});

    if(!isValidproduct){
        throw new CustomError.NotFoundError(`No product with id:${productId}`);
    }

    const alreadySubmitted = await Review.findOne({
        product: productId,
        user: req.user.userId,
    });

    if(alreadySubmitted){
        throw new CustomError.BadRequestError('Already submitted review for this product');
    }

    req.body.user = req.user.userId;
    const review = await Review.create(req.body);
    console.log(review.user);
    res.status(StatusCodes.CREATED).json({review});
};

const getAllReviews = async(req,res)=>{
    const reviews  = await Review.find({}).populate({path:'product', select:'name company price'});
    res.status(StatusCodes.OK).json({reviews, count: reviews.length});
};

const getSingleReview = async(req,res)=>{
    const {id} = req.params;
    const review = await Review.findOne({_id:id});

    if(!review){
        throw new CustomError.NotFoundError(`No review found with id:${id}`);
    }

    console.log(review);
    
    res.status(StatusCodes.OK).json({review});
};

const updateReview = async(req,res)=>{
   const {id} = req.params;
   const {rating, title, comment} = req.body;

   const review = await Review.findOne({_id:id});

   if(!review){
    throw new CustomError.NotFoundError(`No review found with id:${id}`);
   } 

  checkPermissions(req.user,review.user);

  review.rating = rating;
  review.title = title;
  review.comment = comment;

  await review.save();

  res.status(StatusCodes.OK).json({review});

};

const deleteReview = async(req,res)=>{
    const {id} = req.params; 
    const review = await Review.findOne({_id:id});

    if(!review){
        throw new CustomError.NotFoundError(`No review found with id:${id}`);
    }

    checkPermissions(req.user, review.user);

    await review.remove();
    res.status(StatusCodes.OK).json({msg: 'Review successfully deleted'});
};

const getSingleProductReviews = async(req,res)=>{
    const {id:productId} = req.params;
    const review = await Review.find({product:productId});
    res.status(StatusCodes.OK).json({review});
}

module.exports = {
    createReview,
    getAllReviews,
    getSingleReview,
    updateReview,
    deleteReview,
    getSingleProductReviews,
}