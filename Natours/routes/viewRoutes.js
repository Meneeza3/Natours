const express = require("express");
const viewController = require("./../controllers/viewController");
const authController = require("./../controllers/authController");
const bookingController = require("./../controllers/bookingController");
const router = express.Router();

// to show the suitable bar (login OR user photo)
router.get("/me", authController.protect, viewController.getUserProfile);

router.get(
  "/",
  bookingController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverviewPage
);
router.get("/tour/:slug", authController.isLoggedIn, viewController.getTourPage);
router.get("/login", authController.isLoggedIn, viewController.getLoginPage);
router.get("/my-tours", authController.protect, viewController.getMyTours);

module.exports = router;
