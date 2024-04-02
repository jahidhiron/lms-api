// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { QuizAnswer } = require("../models");

// find single document
exports.findOneQuizAnswerService = async (keyValues, options = {}) => {
  const quizAnswer = await QuizAnswer.findOne(keyValues, options);
  return quizAnswer;
};

// create new quiz answer
exports.newQuizAnswerService = async ({ body, _id }) => {
  const newQuizAnswer = new QuizAnswer({ ...body, updatedBy: _id });
  await newQuizAnswer.save();

  newQuizAnswer.isDelete = undefined;
  newQuizAnswer.__v = undefined;

  return newQuizAnswer;
};

// update quiz answer
exports.updateQuizAnswerService = async ({
  quizAnswer,
  answer,
  oldAnswer,
  _id,
}) => {
  quizAnswer.answer = answer;
  quizAnswer.oldAnswer = oldAnswer;
  quizAnswer.updatedBy = _id;

  await quizAnswer.save();

  return quizAnswer;
};

// soft delete quiz answer
exports.deleteQuizAnswerService = async ({ quizAnswer, _id }) => {
  quizAnswer.isDelete = true;
  quizAnswer.deletedAt = new Date().getTime();
  quizAnswer.deletedBy = _id;

  // save quiz answer
  await quizAnswer.save();
};

// quiz answer list
exports.findQuizAnswersService = async (
  keyValues = {},
  { quizId, courseId, page, size, q }
) => {
  const skip = (page - 1) * size;

  let query = {
    ...keyValues,
  };

  if (quizId) {
    query = { ...keyValues, quizId: new ObjectId(quizId) };
  }

  let courseQuery = {};
  if (courseId) {
    courseQuery = { ...courseQuery, "course._id": new ObjectId(courseId) };
  }

  let searchQuery = {};
  if (q) {
    let regex = new RegExp(q, "i");
    searchQuery = { ...searchQuery, $or: [{ "course.title": regex }] };
  }

  let project = {
    quiz: {
      _id: "$quiz._id",
      title: "$quiz.title",
    },
    answer: 1,
    totalScore: 1,
    totalAcquireScore: 1,
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await QuizAnswer.aggregate([
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
        from: "quizzes",
        localField: "quizId",
        foreignField: "_id",
        as: "quiz",
      },
    },
    {
      $unwind: { path: "$quiz", preserveNullAndEmptyArrays: true },
    },
    { $project: { ...project, courseId: "$quiz.courseId" } },
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
    {
      $project: {
        ...project,
        updatedBy: 1,
        quiz: 1,
        course: {
          _id: "$course._id",
          title: "$course.title",
          slug: "$course.slug",
        },
      },
    },
    { $match: courseQuery },
    { $match: searchQuery },
    { $sort: { _id: -1 } },
    {
      $facet: {
        metadata: [{ $count: "totalItem" }, { $addFields: { page } }],
        data: [{ $skip: skip }, { $limit: size }],
      },
    },
  ]);

  const { metadata, data: quizAnswers } = result[0];
  if (quizAnswers.length === 0) {
    return {
      quizAnswers: [],
      totalItem: 0,
      totalPage: 0,
    };
  }
  const { totalItem } = metadata[0];

  return {
    quizAnswers,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// detail quiz answer
exports.findQuizAnswerService = async (keyValues = {}) => {
  let query = {
    isDelete: false,
    quizId: new ObjectId(keyValues["quizId"]),
    updatedBy: new ObjectId(keyValues["_id"]),
  };

  let project = {
    quizId: "$quiz._id",
    quiz: {
      _id: "$quiz._id",
      title: "$quiz.title",
    },
    answer: 1,
    totalScore: 1,
    totalAcquireScore: 1,
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await QuizAnswer.aggregate([
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
        from: "quizzes",
        localField: "quizId",
        foreignField: "_id",
        as: "quiz",
      },
    },
    {
      $unwind: { path: "$quiz", preserveNullAndEmptyArrays: true },
    },
    { $project: { ...project, courseId: "$quiz.courseId" } },
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
    {
      $project: {
        ...project,
        updatedBy: 1,
        quiz: 1,
        course: {
          _id: "$course._id",
          title: "$course.title",
          slug: "$course.slug",
        },
      },
    },
  ]);

  const quizAnswer = result.length > 0 ? result[0] : null;
  return quizAnswer;
};
