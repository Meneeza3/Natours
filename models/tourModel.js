const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require("validator");
const Review = require("./reviewModel");

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A tour must have a name"],
      unique: true,
      trim: true,
      maxlength: [40, "A tour name must have less or equal than 40 characters"],
      minlength: [10, "A tour name must have more or equal than 10 characters"],
      // validate: [validator.isAlpha, "Tour name must only contain characters"],
    },
    slug: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "A tour must have a price"],
    },
    duration: {
      type: Number,
      required: [true, "A tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "A group must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "A tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either: easy, medium, difficult",
      },
    },
    priceDiscount: {
      type: Number,
      // u cant have a price discount bigger than the original price
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW documnet creation
          return val <= this.price;
        },
        message: "Discount price should be below the regular price",
      },
    },
    summary: {
      type: String,
      trim: true, // remove the spaces at the front and at the back
      required: [true, "A tour must have a summary"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String, // you put the name of the photo not the photo itself in the db
      required: [true, "A tour must have a cover image"],
    },
    images: [String], // array of strings
    createdAt: {
      type: Date, // Date is built in datatype in js
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // GeoJson => to store geo data
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
tourSchema.index({ price: 1, ratingsAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

tourSchema.virtual("reviews", {
  ref: "Review", // name of the model
  foreignField: "tour", // name of the property in Reivews model
  localField: "_id",
  // so with each query to db to get a specific tour
  // a second query made to get from the reviews collection our matched tour id
});

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "name role photo",
  });
  next();
});

tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query Middleware
tourSchema.pre(/^find/, function (next) {
  //this.find({ secretTour: { $ne: true } });
  this.find().where("secretTour").ne(true);
  next();
});

// Aggregation Middleware
// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
