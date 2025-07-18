const express = require("express");
const bookingController = require("../controllers/bookingController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect);

router.get("/checkout-session/:tourId", bookingController.getCheckoutSession);

router.use(authController.restrictTo("admin", "lead-guide"));

router.route("/").get(bookingController.getAllBookings).post(bookingController.createBooking);
router
  .route("/:id")
  .get(bookingController.getOneBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteOneBooking);

module.exports = router;
