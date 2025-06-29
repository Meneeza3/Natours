//const { findByIdAndUpdate } = require("../models/tourModel");
const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const factory = require("./factory");
const multer = require("multer");
const sharp = require("sharp");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     // filename => user-userId-date.now.ext
//     const ext = file.originalname.split(".").pop();
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

// MILTER CONFIGURATION
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  // Test the file is a photo
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image!, Please upload only images.", 400), false);
  }
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// The multer middlewares
exports.uploadUserPhoto = upload.single("photo");
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  // To be Availble at update me handler
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

const filterObj = (obj, ...allowedfields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedfields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError("This route is not for password updates. Please use /updatePassword .", 400)
    );
  }

  // Filter unwanted fields
  const filteredBody = filterObj(req.body, "name", "email");
  if (req.file) filteredBody.photo = req.file.filename;

  // Update the user
  const updatedUser = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// my function
exports.reactiveMyAccount = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  // Find user without applying the "active: false" filter
  const user = await User.findOne({ email }).select("+active").setOptions({ bypassFilter: true });
  if (!user) return next(new AppError("User not found", 403));

  if (user.active) return next(new AppError("Account is already active", 403));

  // Reactivate the user
  user.active = true;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    status: "success",
    data: user,
    message: "Account reactivated successfully",
  });
});

exports.createNewUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This route is not defined! Please use /signup instead",
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getAllUsers = factory.getAll(User);
exports.getOneUser = factory.getOne(User);

// For Admin
exports.updatedUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
