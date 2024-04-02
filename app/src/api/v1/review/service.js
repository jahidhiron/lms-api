// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { Review } = require("../models");

// find single review document
exports.findOneReviewService = async (keyValues, options = {}) => {
  const review = await Review.findOne(keyValues, options);
  return review;
};

// create new review
exports.newReviewService = async ({ body, _id }) => {
  const newReview = new Review({ ...body, updatedBy: _id });
  await newReview.save();

  newReview.isDelete = undefined;
  newReview.__v = undefined;

  return newReview;
};

// add new review reply
exports.newReviewReplyService = async ({ review, msg, _id }) => {
  review.reply.push({
    msg,
    updatedBy: _id,
    createdAt: new Date().getTime(),
    updatedAt: new Date().getTime(),
  });

  await review.save();

  return review;
};

// update review
exports.updateReviewService = async ({ review, msg, rating, _id, role }) => {
  review.msg = msg;
  review.rating = rating ? rating : review.rating;

  if (role === 1) {
    review.updatedByAdmin = _id;
  } else {
    review.updatedBy = _id;
  }

  // save review
  await review.save();

  return review;
};

// update reply
exports.updateReplyService = async ({ review, replyId, msg, role, _id }) => {
  const reply = review.reply;
  const updatedReply = [];

  let notReplyIdNotFound = true;

  reply.map((item) => {
    if (String(item._id) !== String(replyId)) {
      updatedReply.push(item);
    }

    if (String(item._id) === String(replyId)) {
      if (role === 1 || String(_id) === String(item.updatedBy)) {
        const replied = { ...item, msg };
        if (role === 1) {
          replied.updatedByAdmin = _id;
        } else {
          replied.updatedBy = _id;
        }
        updatedReply.push(replied);
        notReplyIdNotFound = false;
      } else {
        updatedReply.push(item);
      }
    }
  });

  review.reply = updatedReply;

  // save review
  await review.save();

  return { notReplyIdNotFound, updatedReview: review };
};

// soft delete review
exports.deleteReviewService = async ({ review, _id, role }) => {
  review.isDelete = true;
  review.deletedAt = new Date().getTime();
  if (role === 1) {
    review.deletedByAdmin = _id;
  } else {
    review.deletedBy = _id;
  }

  // save review
  await review.save();
};

// delete reply
exports.deleteReplyService = async ({ review, replyId, role, _id }) => {
  const reply = review.reply;
  const updatedReply = [];

  let notReplyIdNotFound = true;

  reply.map((item) => {
    if (String(item._id) !== String(replyId)) {
      updatedReply.push(item);
    }

    if (String(item._id) === String(replyId)) {
      if (role === 1 || String(_id) === String(item.updatedBy)) {
        notReplyIdNotFound = false;
      } else {
        updatedReply.push(item);
      }
    }
  });

  review.reply = updatedReply;

  // save review
  await review.save();

  return { notReplyIdNotFound };
};

// review list
exports.findReviewsService = async (
  keyValues = {},
  { page, size, courseId }
) => {
  const sizeNumber = parseInt(size) || 10;
  const pageNumber = parseInt(page) || 1;
  let query = {
    ...keyValues,
  };

  if (courseId) {
    query = { ...query, courseId };
  }

  const reviews = await Review.find(query)
    .populate({ path: "updatedBy", select: "name email" })
    .populate({ path: "courseId", select: "title slug" })
    .populate({
      path: "reply",
      populate: [
        {
          path: "updatedBy",
          select: "name email",
        },
        {
          path: "updatedByAdmin",
          select: "name email",
        },
      ],
    })
    .sort({ updatedAt: -1 })
    .skip((pageNumber - 1) * sizeNumber)
    .limit(sizeNumber);

  const totalDocuments = await Review.countDocuments(query);
  const totalPage = Math.ceil(totalDocuments / sizeNumber);

  return {
    reviews,
    totalItem: totalDocuments,
    totalPage,
  };
};

// detail review
exports.findReviewService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  const review = await Review.findOne(query)
    .populate({ path: "updatedBy", select: "name email" })
    .populate({ path: "courseId", select: "title slug" })
    .populate({
      path: "reply",
      populate: [
        {
          path: "updatedBy",
          select: "name email",
        },
        {
          path: "updatedByAdmin",
          select: "name email",
        },
      ],
    });

  const formattedReview = {
    ...review._doc,
    course: review._doc.courseId,
    courseId: review._doc.courseId._id,
  };

  return formattedReview;
};
