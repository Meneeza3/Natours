const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { promisify } = require("util");
const User = require("./../models/userModel");
const AppError = require("./../utils/appError");
const Email = require("./../utils/email");
const catchAsync = require("./../utils/catchAsync");
const jwt = require("jsonwebtoken");
// const { stat } = require("fs");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statsCode, req, res) => {
  const token = signToken(user._id);

  const cookieOption = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  };

  if (process.env.NODE_ENV === "production") cookieOption.secure = true; // In development we are not using https
  res.cookie("jwt", token, cookieOption);

  // Remove the password from the output
  user.password = undefined;

  res.status(statsCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.logout = (req, res) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now()), // only 10 sec
    httpOnly: true,
  });

  res.status(200).json({ status: "success" });
};

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    photo: req.body.photo,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  const url = `${req.protocol}://${req.get("host")}/me`;
  await new Email(newUser, url).sendWelcome();

  // after the user signup we loggin the user
  // the first object here is the payload
  createSendToken(newUser, 201, req, res);
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) return next(new AppError("Enter your email and password", 404));

  const user = await User.findOne({ email: email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password"), 401);
  }

  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // check if the user logged in
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) return next(new AppError("Please log in first!"), 401);

  // verfiy the token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // check if the user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(new AppError("The user belonging to this token no longer exists", 404));

  // check if the user changed his passwrod after the token created
  if (freshUser.doesChangePassword(decoded.iat)) {
    return next(new AppError("You changed your password Please log in again!", 401));
  }

  // put the user in the req, i will need his data in upcoming middleware
  req.user = freshUser; // for the req res cycle
  res.locals.user = freshUser; // to use in pug templates
  next();
});

// just check of logged in user, FOR THE BAR
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies && req.cookies.jwt == "loggedout") next();
  else if (req.cookies.jwt) {
    // verfiy the token
    const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

    // check if the user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) return next();

    // check if the user changed his passwrod after the token created
    if (freshUser.doesChangePassword(decoded.iat)) {
      return next();
    }

    // There is a logged in user
    res.locals.user = freshUser; // now we have access to user variable in pug
    next();
  } else next();
};

exports.restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("You don't have permission to perform this action!", 403));
    }
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) get the user based on the email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError("No user with this email!", 404));

  // 2) generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // 3) sent it to user's email
  const resetURL = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;

  try {
    // await sendEmail({
    //   email: user.email,
    //   subject: "Your password reset token (valid for 10 min)",
    //   message,
    // });

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "The token has been sent via the email!",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("There was an error sending the email. Try again later!", 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get the user based on the token
  const checkToken = crypto.createHash("sha256").update(req.params.token).digest("hex");
  const user = await User.findOne({ passwordResetToken: checkToken });
  if (!user || user.passwordResetExpires < Date.now())
    return next(new AppError("Can't find the user or the Token is now expired", 400));

  // 2) If token not expired, and there is user with this token => set the new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  //user.passwordChangedAt = Date.now();
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // 4) log the user in, send jwt
  createSendToken(user, 200, req, res);
});

module.exports.updatePassword = catchAsync(async (req, res, next) => {
  // receive oldPassword, newPassword
  const user = await User.findById(req.user._id).select("+password");
  if (!(await user.correctPassword(req.body.oldPassword, user.password)))
    return next(new AppError("Incorrect Password, Please try again!", 401));

  if (!req.body.newPasswordConfirm) {
    return next(new AppError("Please confirm your password!", 404));
  }

  if (req.body.newPassword !== req.body.newPasswordConfirm) {
    return next(new AppError("Password confirmation does not match the new password", 404));
  }
  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;

  await user.save();

  createSendToken(user, 200, req, res);
});
