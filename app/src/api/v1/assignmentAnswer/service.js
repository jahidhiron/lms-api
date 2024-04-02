// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { AssignmentAnswer } = require("../models");

// find single document
exports.findOneAssignmentAnswerService = async (keyValues, options = {}) => {
  const assignmentAnswer = await AssignmentAnswer.findOne(keyValues, options);
  return assignmentAnswer;
};

// create new assignment
exports.newAssignmentAnswerService = async ({ body, _id }) => {
  const newAssignment = new AssignmentAnswer({ ...body, updatedBy: _id });
  await newAssignment.save();

  newAssignment.isDelete = undefined;
  newAssignment.__v = undefined;

  return newAssignment;
};

// update assignment
exports.updateAssignmentAnswerService = async ({
  assignmentAnswer,
  answers,
  _id,
}) => {
  assignmentAnswer.answers = answers;
  assignmentAnswer.updatedBy = _id;

  // save assignment answer
  await assignmentAnswer.save();
  return assignmentAnswer;
};

// submit assignment answer
exports.submitAssignmentAnswerService = async ({ assignmentAnswer, _id }) => {
  assignmentAnswer.status = 2;
  assignmentAnswer.updatedBy = _id;

  // save assignment answer
  await assignmentAnswer.save();

  return assignmentAnswer;
};

// soft delete assignment answer
exports.deleteAssignmentAnswerService = async ({ assignmentAnswer, _id }) => {
  assignmentAnswer.isDelete = true;
  assignmentAnswer.deletedAt = new Date().getTime();
  assignmentAnswer.deletedBy = _id;

  // save assignment answer
  await assignmentAnswer.save();
};

// assignment answer list
exports.findassignmentAnswersService = async (
  keyValues = {},
  { page, size }
) => {
  const skip = (page - 1) * size;

  let query = {
    ...keyValues,
  };

  let project = {
    assignmentId: 1,
    assignment: 1,
    answers: 1,
    status: 1,
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await AssignmentAnswer.aggregate([
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
        from: "assignments",
        localField: "assignmentId",
        foreignField: "_id",
        as: "assignment",
      },
    },
    {
      $unwind: { path: "$assignment", preserveNullAndEmptyArrays: true },
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

  const { metadata, data: assignmentAnswers } = result[0];
  if (assignmentAnswers.length === 0) {
    return {
      assignmentAnswers: [],
      totalItem: 0,
      totalPage: 0,
    };
  }
  const { totalItem } = metadata[0];
  return {
    assignmentAnswers,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// detail assignment answer
exports.findassignmentAnswerService = async (keyValues = {}) => {
  let query = {
    isDelete: false,
    assignmentId: new ObjectId(keyValues["id"]),
  };

  let project = {
    assignmentId: 1,
    assignment: 1,
    answers: 1,
    status: 1,
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await AssignmentAnswer.aggregate([
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
        from: "assignments",
        localField: "assignmentId",
        foreignField: "_id",
        as: "assignment",
      },
    },
    {
      $unwind: { path: "$assignment", preserveNullAndEmptyArrays: true },
    },
    { $project: project },
  ]);

  const category = result.length > 0 ? result[0] : null;
  return category;
};
