const AppError = require("./../utils/appError");
const catchAsync = require("./../utils/catchAsync");
const APIfeatures = require("./../utils/apiFeatures");

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndDelete(req.params.id);
    if (!document) {
      return next(new AppError("No document found with that ID", 404));
    }
    res.status(204).json({ status: "success", data: null });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    console.log("here");
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true, // run the DB validators again at the input
      new: true,
    });
    if (!document) {
      return next(new AppError("No document found with that ID", 404));
    }
    console.log("here");
    res.status(200).json({ status: "success", data: { document } });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);
    res.status(201).json({
      status: "success",
      data: document,
    });
  });

exports.getOne = (Model, populateField) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (populateField) query.populate(populateField);

    const document = await query;
    if (!document) {
      return next(new AppError("Can't find a document with this ID", 404));
    }
    res.status(200).json({ status: "success", data: { document } });
  });

exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    let filter;
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .fields()
      .pagination();

    //const documents = await features.query.explain("executionStats");
    const documents = await features.query;

    res.status(200).json({
      status: "success",
      length: documents.length,
      data: {
        documents,
      },
    });
  });
