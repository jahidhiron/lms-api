// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { Assignment } = require("../models");

// find single document
exports.findOneAssignmentService = async (keyValues, options = {}) => {
  const assignment = await Assignment.findOne(keyValues, options);
  return assignment;
};

// create new assignment
exports.newAssignmentService = async ({ body, _id }) => {
  const newAssignment = new Assignment({ ...body, updatedBy: _id });
  await newAssignment.save();

  newAssignment.isDelete = undefined;
  newAssignment.__v = undefined;

  return newAssignment;
};

// update assignment
exports.updateAssignmentService = async ({
  assignment,
  title,
  desc,
  duration,
  instructionVideoId,
  instructionDesc,
  instructionFileId,
  solutionVideoId,
  solutionFileId,
  questions,
  courseId,
  _id,
}) => {
  assignment.title = title ? title : assignment.title;
  assignment.courseId = courseId ? courseId : assignment.courseId;
  assignment.desc = desc;
  assignment.duration = duration;
  assignment.instructionVideoId = instructionVideoId;
  assignment.instructionDesc = instructionDesc;
  assignment.instructionFileId = instructionFileId;
  assignment.solutionVideoId = solutionVideoId;
  assignment.solutionFileId = solutionFileId;
  assignment.questions = questions;
  assignment.updatedBy = _id;

  // save assignment
  await assignment.save();

  return assignment;
};

// soft delete assignment
exports.deleteAssignmentService = async ({ assignment, _id }) => {
  assignment.isDelete = true;
  assignment.deletedAt = new Date().getTime();
  assignment.deletedBy = _id;

  // save assignment
  await assignment.save();
};

// assignment list
exports.findAssignmentsService = async (keyValues = {}, { q, page, size }) => {
  let regex = new RegExp(q, "i");
  const skip = (page - 1) * size;

  let query = {
    ...keyValues,
    $or: [{ title: regex }],
  };

  let project = {
    title: 1,
    desc: 1,
    duration: 1,
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await Assignment.aggregate([
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
    { $project: project },
    { $sort: { _id: -1 } },
    {
      $facet: {
        metadata: [{ $count: "totalItem" }, { $addFields: { page } }],
        data: [{ $skip: skip }, { $limit: size }],
      },
    },
  ]);

  const { metadata, data: assignments } = result[0];
  if (assignments.length === 0) {
    return {
      assignments: [],
      totalItem: 0,
      totalPage: 0,
    };
  }
  const { totalItem } = metadata[0];
  return {
    assignments,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// detail assignment
exports.findAssignmentService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  let project = {
    title: 1,
    desc: 1,
    duration: 1,
    courseId: 1,
    instructionVideoId: 1,
    instructionDesc: 1,
    instructionFileId: 1,
    solutionVideoId: 1,
    solutionFileId: 1,
    questions: 1,
    course: {
      _id: "$course._id",
      title: "$course.title",
      slug: "$course.slug",
    },
    instructionVideo: {
      _id: "$instructionVideo._id",
      name: "$instructionVideo.name",
      path: "$instructionVideo.path",
      mimetype: "$instructionVideo.mimetype",
      timeLength: "$instructionVideo.timeLength",
    },
    instructionFile: {
      _id: "$instructionFile._id",
      name: "$instructionFile.name",
      path: "$instructionFile.path",
      mimetype: "$instructionFile.mimetype",
      timeLength: "$instructionFile.timeLength",
    },
    solutionVideo: {
      _id: "$solutionVideo._id",
      name: "$solutionVideo.name",
      path: "$solutionVideo.path",
      mimetype: "$solutionVideo.mimetype",
      timeLength: "$solutionVideo.timeLength",
    },
    solutionFile: {
      _id: "$solutionFile._id",
      name: "$solutionFile.name",
      path: "$solutionFile.path",
      mimetype: "$solutionFile.mimetype",
      timeLength: "$solutionFile.timeLength",
    },
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
    createdAt: 1,
    updatedAt: 1,
  };

  const result = await Assignment.aggregate([
    {
      $match: query,
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
    {
      $lookup: {
        from: "files",
        localField: "instructionVideoId",
        foreignField: "_id",
        as: "instructionVideo",
      },
    },
    {
      $unwind: { path: "$instructionVideo", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "files",
        localField: "instructionFileId",
        foreignField: "_id",
        as: "instructionFile",
      },
    },
    {
      $unwind: { path: "$instructionFile", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "files",
        localField: "solutionVideoId",
        foreignField: "_id",
        as: "solutionVideo",
      },
    },
    {
      $unwind: { path: "$solutionVideo", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "files",
        localField: "solutionFileId",
        foreignField: "_id",
        as: "solutionFile",
      },
    },
    {
      $unwind: { path: "$solutionFile", preserveNullAndEmptyArrays: true },
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
    { $project: project },
  ]);

  const assignment = result.length > 0 ? result[0] : null;
  return assignment;
};
