// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { NotFound, BadRequest } = require("../utils/errors");
const { findOneCourseService } = require("../course/service");
const {
  deleteReplyService,
  newReviewService,
  findOneReviewService,
  newReviewReplyService,
  updateReviewService,
  deleteReviewService,
  findReviewsService,
  findReviewService,
  updateReplyService,
} = require("./service");

// add review
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { courseId } = req.body;
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

    const isReviewExist = await findOneReviewService({
      courseId,
      updatedBy: _id,
    });
    if (isReviewExist) {
      throw new BadRequest(res.__("reviewAlreadyExistErr"));
    }

    // add review
    const review = await newReviewService({ body: req.body, _id });

    // save activity log
    await createActivityLog({
      title: `Add review`,
      desc: `Review by "${review._id}" id for course id "${courseId}" is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("reviewAddSucc"),
      data: { review },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// add review reply
exports.addReply = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    const isReviewExist = await findOneReviewService({
      _id: id,
      isDelete: false,
    });
    if (!isReviewExist) {
      throw new NotFound(req.__("reviewNotFoundErr"));
    }

    // add review reply
    const review = await newReviewReplyService({
      review: isReviewExist,
      ...req.body,
      _id,
    });

    // save activity log
    await createActivityLog({
      title: `Add review reply`,
      desc: `Review reply by ${review._id} id is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("replyAddSucc"),
      data: { review },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update review
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id, role } = req.user;
  const query = { _id: id, isDelete: false };
  if (role !== 1) {
    query.updatedBy = _id;
  }

  try {
    // find review
    const review = await findOneReviewService(query, { __v: 0, isDelete: 0 });
    if (!review) {
      throw new NotFound(req.__("reviewNotFoundErr"));
    }

    // update review
    const updatedReview = await updateReviewService({
      ...req.body,
      _id,
      review,
      role,
    });

    // save activity log
    await createActivityLog({
      title: `Update review`,
      desc: `${review._id} review id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("reviewUpdateSucc"),
      data: { review: updatedReview },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update review
exports.updateReply = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { replyId } = req.query;
  const { _id, role } = req.user;
  const { msg } = req.body;

  try {
    // find review
    const review = await findOneReviewService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!review) {
      throw new NotFound(req.__("reviewNotFoundErr"));
    }

    // delete review reply
    const { notReplyIdNotFound, updatedReview } = await updateReplyService({
      review,
      replyId,
      msg,
      role,
      _id,
    });

    if (notReplyIdNotFound) {
      throw new NotFound(req.__("replyIdNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `Update review reply`,
      desc: `${replyId} reply id of ${review._id} review id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("reviewReplyUpdateSucc"),
      data: {
        review: updatedReview,
      },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove review
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id, role } = req.user;
  const query = { _id: id, isDelete: false };
  if (role !== 1) {
    query.updatedBy = _id;
  }

  try {
    // find review
    const review = await findOneReviewService(query, { __v: 0, isDelete: 0 });
    if (!review) {
      throw new NotFound(req.__("reviewNotFoundErr"));
    }

    // soft delete review
    await deleteReviewService({ review, _id, role });

    // save activity log
    await createActivityLog({
      title: `Delete review`,
      desc: `${review._id} review id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("reviewDeleteSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove reply
exports.removeReply = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { replyId } = req.query;
  const { _id, role } = req.user;

  try {
    // find review
    const review = await findOneReviewService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!review) {
      throw new NotFound(req.__("reviewNotFoundErr"));
    }

    // delete review reply
    const { notReplyIdNotFound } = await deleteReplyService({
      review,
      replyId,
      role,
      _id,
    });

    if (notReplyIdNotFound) {
      throw new NotFound(req.__("replyIdNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `Delete review reply`,
      desc: `${replyId} reply id of ${review._id} review id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("replyDeleteSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list review
exports.reviews = async (req, res, next) => {
  const { page, size, courseId } = req.query;
  const query = { isDelete: false };
  let options = {
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
    courseId,
  };

  try {
    // list
    const reviews = await findReviewsService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("reviewListSucc"),
      data: { ...reviews },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// review detail
exports.review = async (req, res, next) => {
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const review = await findReviewService(keyValues);
    if (!review) {
      throw new NotFound(req.__("reviewNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("reviewDetailSucc"),
      data: { review },
    });
  } catch (error) {
    next(error, req, res);
  }
};
