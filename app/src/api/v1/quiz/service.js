// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { Quiz } = require("../models");

// find single document
exports.findOneQuizService = async (keyValues, options = {}) => {
  const quiz = await Quiz.findOne(keyValues, options);
  return quiz;
};

// create new quiz
exports.newQuizService = async ({ body, _id }) => {
  const newQuiz = new Quiz({ ...body, updatedBy: _id });
  await newQuiz.save();

  newQuiz.isDelete = undefined;
  newQuiz.__v = undefined;

  return newQuiz;
};

// update quiz
exports.updateQuizService = async ({
  quiz,
  title,
  desc,
  questions,
  courseId,
  _id,
  role,
}) => {
  quiz.title = title ? title : quiz.title;
  quiz.desc = desc;
  quiz.courseId = courseId ? courseId : quiz.courseId;
  quiz.questions = questions;

  if (role === 2) {
    quiz.updatedBy = _id;
  } else if (role === 1) {
    quiz.updatedByAdmin = _id;
  }

  // save quiz
  await quiz.save();

  return quiz;
};

// soft delete quiz
exports.deleteQuizService = async ({ quiz, _id }) => {
  quiz.isDelete = true;
  quiz.deletedAt = new Date().getTime();
  quiz.deletedBy = _id;

  // save quiz
  await quiz.save();
};

// quiz list
exports.findQuizsService = async (
  keyValues = {},
  { q, page, size, _id, role }
) => {
  let regex = new RegExp(q, "i");
  const skip = (page - 1) * size;

  let query = {
    ...keyValues,
    $or: [{ title: regex }],
  };

  if (role === 2) {
    query = { ...query, updatedBy: new ObjectId(_id) };
  }

  let project = {
    title: 1,
    desc: 1,
    questions: 1,
    course: {
      _id: "$course._id",
      title: "$course.title",
      updatedBy: "$course.updatedBy",
    },
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
    updatedByAdmin: {
      _id: "$admin._id",
      name: "$admin.name",
      email: "$admin.email",
    },
  };

  const result = await Quiz.aggregate([
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
        from: "users",
        localField: "updatedByAdmin",
        foreignField: "_id",
        as: "admin",
      },
    },
    {
      $unwind: { path: "$admin", preserveNullAndEmptyArrays: true },
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

  const { metadata, data: quizs } = result[0];
  if (quizs.length === 0) {
    return {
      quizs: [],
      totalItem: 0,
      totalPage: 0,
    };
  }
  const { totalItem } = metadata[0];
  return {
    quizs,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// detail quiz
exports.findQuizService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  let project = {
    title: 1,
    desc: 1,
    questions: 1,
    courseId: "$course._id",
    course: {
      _id: "$course._id",
      title: "$course.title",
      updatedBy: "$course.updatedBy",
    },
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
    updatedByAdmin: {
      _id: "$admin._id",
      name: "$admin.name",
      email: "$admin.email",
    },
  };

  const result = await Quiz.aggregate([
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
        from: "users",
        localField: "updatedByAdmin",
        foreignField: "_id",
        as: "admin",
      },
    },
    {
      $unwind: { path: "$admin", preserveNullAndEmptyArrays: true },
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

  const quiz = result.length > 0 ? result[0] : null;
  return quiz;
};
