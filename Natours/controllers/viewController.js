const Tour = require("./../models/tourModel");
const User = require("./../models/userModel");
const Booking = require("./../models/bookingModel");
const catchAsync = require("./../utils/catchAsync");
const AppError = require("./../utils/appError");
const factory = require("./factory");

exports.alerts = (req, res, next) => {
  // the req.query.alert comes from the bookingController
  const alert = req.query.alert;
  if (alert === "booking") {
    // alert variable will be available in base.pug now
    res.locals.alert =
      "Your booking was successful!. If your booking does not show up here immediatly, please come back later.";
  }

  next();
};

exports.getOverviewPage = catchAsync(async (req, res) => {
  const tours = await Tour.find();

  res.status(200).render("overview", {
    title: "All Tours",
    tours,
  });
});

exports.getTourPage = catchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!tour) return next(new AppError("There is no tour with that name", 404));

  res.status(200).render("tour", {
    title: tour.name,
    tour,
  });
});

exports.getLoginPage = catchAsync(async (req, res) => {
  res.status(200).render("login", {
    title: "Log into your account",
  });
});

exports.getUserProfile = catchAsync(async (req, res) => {
  res.status(200).render("userProfile", {
    title: "Your account",
  });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
  const bookingDocs = await Booking.find({ user: req.user.id });
  const tourIds = bookingDocs.map((el) => el.tour.id);

  // fetch tours from the Tour collection where _id is in the list
  const tours = await Tour.find({ _id: { $in: tourIds } });

  res.status(200).render("overview", {
    title: "MY Tours",
    tours,
  });
});
