const Review = require("./../models/reviewModel");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./factory");

exports.setTourandUserId = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};

exports.createReview = factory.createOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
// Gets you either all Reviews or just the Reviews for one tour
exports.getAllReviews = factory.getAll(Review);
