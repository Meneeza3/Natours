const mongoose = require("mongoose");
const fs = require("fs");
const dotenv = require("dotenv");
const Tour = require("./../../models/tourModel");
const User = require("./../../models/userModel");
const Review = require("./../../models/reviewModel");
dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASS);
mongoose.connect(DB);

// Json.parse => convert the json file in a js object
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, "utf-8"));

const importTours = async () => {
  // create can accept an array of objects and put them in different documents
  await Tour.create(tours);
  await User.create(users, { validateBeforeSave: false });
  await Review.create(reviews);
};
importTours();

// const deleteTours = async () => {
//   await Tour.deleteMany();
//   await User.deleteMany();
//   await Review.deleteMany();
//   process.exit();
// };
// deleteTours();
