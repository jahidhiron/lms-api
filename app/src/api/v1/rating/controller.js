// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { BadRequest, NotFound } = require("../utils/errors");
const {
  findOneRatingService,
  newRatingService,
  deleteRatingService,
  findRatingsService,
  findRatingService,
} = require("./service");
const { findOneCourseService } = require("../course/service");

// add rating
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { number, courseId } = req.body;
  const { _id } = req.user;

  try {
    // course checking
    const isCourseExist = await findOneCourseService({
      _id: courseId,
      isDelete: false,
    });
    if (!isCourseExist) {
      throw new NotFound(req.__("courseExistErr"));
    }

    // find rating
    const isRatingExist = await findOneRatingService({
      courseId,
      updatedBy: _id,
      isDelete: false,
    });
    if (isRatingExist) {
      throw new BadRequest(req.__("ratingExistErr"));
    }

    // add rating
    const rating = await newRatingService({ body: req.body, _id });

    // save activity log
    await createActivityLog({
      title: `Add rating`,
      desc: `Course "${courseId}", rating ${number} is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("ratingAddSucc"),
      data: { rating },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove rating
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find rating
    const rating = await findOneRatingService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!rating) {
      throw new NotFound(req.__("ratingNotFoundErr"));
    }

    // soft delete rating
    await deleteRatingService({ rating, _id });

    // save activity log
    await createActivityLog({
      title: `Delete rating`,
      desc: `${rating._id} rating id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("ratingDeleteSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list rating
exports.ratings = async (req, res, next) => {
  const { page, size, courseId } = req.query;
  const query = { isDelete: false };
  let options = {
    courseId,
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
  };

  try {
    // list
    const ratings = await findRatingsService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("ratingListSucc"),
      data: { ...ratings },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// rating detail
exports.rating = async (req, res, next) => {
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const rating = await findRatingService(keyValues);
    if (!rating) {
      throw new NotFound(req.__("ratingNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("ratingDetailSucc"),
      data: { rating },
    });
  } catch (error) {
    next(error, req, res);
  }
};
