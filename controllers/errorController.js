const AppError = require("./../utils/appError");

const handleJwtExpiredError = () =>
  new AppError("Your token has been Expired, Please log in again!", 401);

const handleJwtError = () => new AppError("Invalid Token, Please log in again!", 401);

const handleValidationsErrorDB = (err) => {
  const errorMessages = Object.values(err.errors).map((err) => err.message);
  return new AppError(`Invalid input data. ${errorMessages.join(". ")}`, 404);
};

const handleDuplicateFieldsDB = (err) => {
  const message = `${err.keyValue.name} is Duplicate name, Choose another name please!`;
  return new AppError(message, 404);
};

const handleCastErrorDDB = (err) => {
  const message = `invalid ${err.path} with the value of ${err.value}`;

  return new AppError(message, 404);
};

// DEVELOPMENT
const sendErrorDev = (err, req, res) => {
  // API (postman)
  // req.originalUrl gives u the string after "127.0.0.1:3000"
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  // FOR RENDERED WEBSITE
  else {
    res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
};

// PRODUCTION
const sendErrorProd = (err, req, res) => {
  // API
  if (req.originalUrl.startsWith("/api")) {
    // Trusted errors => send message to the client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // programming or other unknown errors => don't leak error details
    else {
      console.error("ERROR💥", err);
      res.status(500).json({
        status: "error",
        message: "something went very wrong",
      });
    }
  }
  // FOR RENDERED WEBSITE
  else {
    // Trusted errors => send message to the client
    if (err.isOperational) {
      res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: err.message,
      });
    }
    // programming or other unknown errors => don't leak error details
    else {
      console.error("ERROR💥", err);
      res.status(err.statusCode).render("error", {
        title: "Something went wrong!",
        msg: "Please try again later!",
      });
    }
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { name: err.name, message: err.message, stack: err.stack, ...err };
    if (error.name === "CastError") error = handleCastErrorDDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationsErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJwtError();
    if (error.name === "TokenExpiredError") error = handleJwtExpiredError();
    sendErrorProd(error, req, res);
  }
};
