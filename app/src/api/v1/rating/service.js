// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { Rating } = require("../models");

// find single document
exports.findOneRatingService = async (keyValues, options = {}) => {
  const rating = await Rating.findOne(keyValues, options);
  return rating;
};

// create new rating
exports.newRatingService = async ({ body, _id }) => {
  const newRating = new Rating({ ...body, updatedBy: _id });
  await newRating.save();

  newRating.isDelete = undefined;
  newRating.__v = undefined;

  return newRating;
};

// soft delete rating
exports.deleteRatingService = async ({ rating, _id }) => {
  rating.isDelete = true;
  rating.deletedAt = new Date().getTime();
  rating.deletedBy = _id;

  // save rating
  await rating.save();
};

// rating list
exports.findRatingsService = async (
  keyValues = {},
  { courseId, page, size }
) => {
  const skip = (page - 1) * size;

  let query = {
    ...keyValues,
  };

  if (courseId) {
    query = { ...keyValues, courseId: new ObjectId(courseId) };
  }

  let project = {
    rating: 1,
    createdAt: 1,
    updatedAt: 1,
    course: {
      _id: "$course._id",
      title: "$course.title",
      slug: "$course.slug",
    },
    updatedBy: "$user._id",
    name: "$user.name",
    email: "$user.email",
  };

  const result = await Rating.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: { path: "$course", preserveNullAndEmptyArrays: true },
    },
    { $project: project },
    { $sort: { _id: -1 } },
    {
      $facet: {
        metadata: [{ $count: "totalItem" }, { $addFields: { page } }],
        data: [{ $skip: skip }, { $limit: size }],
      },
    },
  ]);

  const { metadata, data: ratings } = result[0];
  if (ratings.length === 0) {
    return {
      ratings: [],
      totalItem: 0,
      totalPage: 0,
      totalRating: 0,
      avgRating: 0,
    };
  }
  const { totalItem } = metadata[0];
  let totalRating = 0;

  for (let item of ratings) {
    totalRating += item.rating;
  }

  const avgRating = parseFloat((totalRating / ratings.length).toFixed(2));

  return {
    ratings,
    totalRating,
    avgRating,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// detail rating
exports.findRatingService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  let project = {
    rating: 1,
    createdAt: 1,
    updatedAt: 1,
    courseId: "$course._id",
    course: {
      _id: "$course._id",
      title: "$course.title",
      slug: "$course.slug",
    },
    updatedBy: "$user._id",
    name: "$user.name",
    email: "$user.email",
  };

  const result = await Rating.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: { path: "$course", preserveNullAndEmptyArrays: true },
    },
    { $project: project },
  ]);

  const rating = result.length > 0 ? result[0] : null;
  return rating;
};
