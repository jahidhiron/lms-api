// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { Note } = require("../models");

// find single document
exports.findOneNoteService = async (keyValues, options = {}) => {
  const note = await Note.findOne(keyValues, options);
  return note;
};

// create new note
exports.newNotetService = async ({ body, _id }) => {
  const newNote = new Note({ ...body, updatedBy: _id });
  await newNote.save();

  newNote.isDelete = undefined;
  newNote.__v = undefined;

  return newNote;
};

// update note
exports.updateNoteService = async ({
  note,
  title,
  noteInSecond,
  lectureId,
  _id,
}) => {
  note.title = title ? title : note.title;
  note.lectureId = lectureId ? lectureId : note.lectureId;
  note.noteInSecond = noteInSecond;
  note.updatedBy = _id;

  // save note
  await note.save();

  return note;
};

// soft delete note
exports.deleteNoteService = async ({ note, _id }) => {
  note.isDelete = true;
  note.deletedAt = new Date().getTime();
  note.deletedBy = _id;

  // save note
  await note.save();
};

// note list
exports.findNotesService = async (
  keyValues = {},
  { lectureId, page, size, q }
) => {
  let regex = new RegExp(q, "i");
  const skip = (page - 1) * size;

  let query = {
    ...keyValues,
    $or: [{ title: regex }],
  };

  if (lectureId) {
    query = { ...query, lectureId: new ObjectId(lectureId) };
  }

  let project = {
    title: 1,
    noteInSecond: 1,
    lectureId: 1,
    createdAt: 1,
    updatedAt: 1,
    lecture: {
      _id: "$lecture._id",
      title: "$lecture.title",
      slug: "$lecture.slug",
    },
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
      avatarId: "$user.avatarId",
      avatar: "$avatar",
    },
  };

  const result = await Note.aggregate([
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
        from: "lectures",
        localField: "lectureId",
        foreignField: "_id",
        as: "lecture",
      },
    },
    {
      $unwind: { path: "$lecture", preserveNullAndEmptyArrays: true },
    },
    {
      $lookup: {
        from: "files",
        localField: "user.avatarId",
        foreignField: "_id",
        as: "avatar",
      },
    },
    {
      $unwind: { path: "$avatar", preserveNullAndEmptyArrays: true },
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

  const { metadata, data: notes } = result[0];
  if (notes.length === 0) {
    return {
      notes: [],
      totalItem: 0,
      totalPage: 0,
    };
  }
  const { totalItem } = metadata[0];
  return {
    notes,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// detail note
exports.findNoteService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  let project = {
    title: 1,
    noteInSecond: 1,
    lecture: {
      _id: "$lecture._id",
      title: "$lecture.title",
      slug: "$lecture.slug",
    },
    lectureId: 1,
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
      avatarId: "$user.avatarId",
      avatar: "$avatar",
    },
  };

  const result = await Note.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "lectures",
        localField: "lectureId",
        foreignField: "_id",
        as: "lecture",
      },
    },
    {
      $unwind: { path: "$lecture", preserveNullAndEmptyArrays: true },
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
        from: "files",
        localField: "user.avatarId",
        foreignField: "_id",
        as: "avatar",
      },
    },
    {
      $unwind: { path: "$avatar", preserveNullAndEmptyArrays: true },
    },
    { $project: project },
  ]);

  const note = result.length > 0 ? result[0] : null;
  return note;
};
