const express = require("express");
const tourController = require("./../controllers/tourController");
const authController = require("./../controllers/authController");
const reviewRouter = require("./../routes/reviewRoutes");

const router = express.Router();

router.use("/:tourId/reviews", reviewRouter);
router.route("/tour-stats").get(tourController.getTourStats);
router
  .route("/monthly-plan/:year")
  .get(
    authController.protect,
    authController.restrictTo("admin", "guide", "lead-guide"),
    tourController.getMonthlyPlan
  );
router.route("/top-5-cheap").get(tourController.topToursAlias, tourController.getAllTours);
router.route("/tour-within/:distance/center/:latlng/unit/:unit").get(tourController.getToursWithin);
router.route("/distances/:latlng/unit/:unit").get(tourController.getDistances);

router.route("/").get(tourController.getAllTours).post(tourController.createNewTour);

router
  .route("/:id")
  .get(tourController.getTourById)
  .patch(
    authController.protect,
    authController.restrictTo("admin", "lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(authController.protect, authController.restrictTo("admin"), tourController.deleteTour);

module.exports = router;
