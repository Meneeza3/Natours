const mongoose = require("mongoose");
const { trim } = require("validator");
const Tour = require("./tourModel");
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      trim: true,
      required: [true, "Review can not be empty!"],
      maxlength: [200, "A review must have less or equal than 200 characters"],
      minlength: [3, "A tour name must have more or equal than 3 characters"],
    },
    rating: {
      type: Number,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "Review must belong to a tour!"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user!"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: "tour",
  //   select: "name",
  // }).populate({
  //   path: "user",
  //   select: "name photo",
  // });

  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const Tour = require("./tourModel");
  const stats = await this.aggregate([
    { $match: { tour: tourId } },
    { $group: { _id: "$tour", nRating: { $sum: 1 }, avgRating: { $avg: "$rating" } } },
  ]);
  await Tour.findByIdAndUpdate(tourId, {
    ratingsAverage: stats[0]?.avgRating || 4.5,
    ratingsQuantity: stats[0]?.nRating || 0,
  });
};

reviewSchema.post("save", async function () {
  // this here points to the current review doc
  await this.constructor.calcAverageRatings(this.tour); // tour is the id of the tour
});

reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc && doc.tour) await doc.constructor.calcAverageRatings(doc.tour);
});

reviewSchema.post("findOneAndUpdate", async function (doc) {
  if (doc && doc.tour) await doc.constructor.calcAverageRatings(doc.tour);
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
