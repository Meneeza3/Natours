const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");

const router = express.Router();

// No need for protect
router.route("/signup").post(authController.signup);
router.route("/signin").post(authController.signin);
router.route("/logout").get(authController.logout);
router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

// The rest routes Need to be protected
router.use(authController.protect);

router.route("/me").get(userController.getMe, userController.getOneUser);
router
  .route("/updateMe")
  .patch(userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.route("/updatePassword").patch(authController.updatePassword);
router.route("/deleteMe").delete(userController.deleteMe);
router.route("/reactiveMyAccount").patch(userController.reactiveMyAccount);

// Routes For Admin
router.use(authController.restrictTo("admin"));
router.route("/").get(userController.getAllUsers).post(userController.createNewUser);

router
  .route("/:id")
  .get(userController.getOneUser)
  .patch(userController.updatedUser)
  .delete(userController.deleteUser);

module.exports = router;
