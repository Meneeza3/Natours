require("dotenv").config({ path: "./config.env" });

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("./../models/tourModel");
const User = require("./../models/userModel");
const Booking = require("./../models/bookingModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./factory");
const { sign } = require("jsonwebtoken");
const { json } = require("express");

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1- get the booked tour
  const tour = await Tour.findById(req.params.tourId);
  if (!tour) return next(new AppError("No Tour found with this Id", 400));
  // 2- create checkout session
  // 2-1 session details
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    // success_url: `${req.protocol}://${req.get("host")}/my-tours/?tour=${req.params.tourId}&user=${
    //   req.user.id
    // }&price=${tour.price}`,
    success_url: `${req.protocol}://${req.get("host")}/my-tours?alert=booking`,
    cancel_url: `${req.protocol}://${req.get("host")}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: tour.price * 100, // السعر بـ cents
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary,
            images: [`${req.protocol}://${req.get("host")}/img/tours/${tour.imageCover}`],
          },
        },
        quantity: 1,
      },
    ],
  });

  // send the session to the client
  res.status(200).json({
    status: "success",
    session,
  });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//   const { tour, user, price } = req.query;

//   if (!tour || !user || !price) return next();
//   await Booking.create({ tour, user, price });

//   // clear the req from the query string
//   res.redirect(req.originalUrl.split("?")[0]);
// });

// This func is related to getCheckoutSession func
const createBookingCheckout = async (session) => {
  // in getCheckoutSession
  // customer_email: req.user.email,
  // client_reference_id: req.params.tourId,
  const tour = session.client_reference_id;
  const user = (await User.findOne({ email: session.customer_email })).id;
  const price = session.amount_total / 100;

  await Booking.create({ tour, user, price });
};

// this Will deal with the booking DB
exports.webhookCheckout = async (req, res, next) => {
  const signature = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    await createBookingCheckout(event.data.object);
  }

  res.status(200).json({ received: true });
};

// For Admins and Lead Guides
exports.getAllBookings = factory.getAll(Booking);
exports.createBooking = factory.createOne(Booking);
exports.getOneBooking = factory.getOne(Booking);
exports.deleteOneBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
