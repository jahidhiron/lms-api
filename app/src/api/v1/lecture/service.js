const {
  Types: { ObjectId },
} = require("mongoose");
// custom module
const { Lecture } = require("../models");
const { createSlug } = require("../utils/createSlug");

// find single document
exports.findOneLectureService = async (keyValues, options = {}) => {
  const lecture = await Lecture.findOne(keyValues, options);
  return lecture;
};

// create new lecture
exports.newLectureService = async ({ body, _id }) => {
  const slugItem = [];
  slugItem.push(body.title);
  let slug = createSlug(slugItem);

  const lectures = await Lecture.find({ slug: new RegExp(slug, "i") });
  if (lectures.length > 0) {
    slug = `${slug}-${lectures.length}`;
  }

  const newLceture = new Lecture({ ...body, slug, updatedBy: _id });
  await newLceture.save();

  newLceture.isDelete = undefined;
  newLceture.__v = undefined;

  return newLceture;
};

// update lecture
exports.updateLectureService = async ({
  lecture,
  title,
  videoId,
  resources,
  cations,
  desc,
  preview,
  _id,
  role,
}) => {
  const slugItem = [];
  let slug = null;

  if (title) {
    slugItem.push(title);
    slug = createSlug(slugItem);
  }

  const lectures = await Lecture.find({ slug: new RegExp(slug, "i") });
  if (lectures.length > 0) {
    slug = `${slug}-${lectures.length}`;
  }

  lecture.title = title ? title : lecture.title;
  lecture.slug = slug ? slug : lecture.slug;
  lecture.desc = desc;
  lecture.videoId = videoId;
  lecture.preview = preview == true ? true : false;
  lecture.resources = resources;
  lecture.cations = cations;

  if (role === 2) {
    lecture.updatedBy = _id;
  } else if (role === 1) {
    lecture.updatedByAdmin = _id;
  }

  // save lecture
  await lecture.save();

  return lecture;
};

// soft delete lecture
exports.deleteLectureService = async ({ lecture, _id }) => {
  lecture.isDelete = true;
  lecture.deletedAt = new Date().getTime();
  lecture.deletedBy = _id;

  // save lecture
  await lecture.save();
};

// lecture list
exports.findLecturesService = async (
  keyValues = {},
  { q, page, size, role, _id }
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
    preview: 1,
    slug: 1,
    desc: 1,
    video: {
      name: "$video.name",
      path: "$video.path",
      timeLength: "$video.timeLength",
      mimetype: "$video.mimetype",
      updatedBy: "$video.updatedBy",
    },
    resources: 1,
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

  const result = await Lecture.aggregate([
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
        from: "files",
        localField: "videoId",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: { path: "$video", preserveNullAndEmptyArrays: true },
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

  const { metadata, data: lectures } = result[0];
  if (lectures.length === 0) {
    return {
      lectures: [],
      totalItem: 0,
      totalPage: 0,
    };
  }
  const { totalItem } = metadata[0];
  return {
    lectures,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// detail lecture
exports.findLectureService = async (keyValues = {}, { role, _id, id }) => {
  let query = {
    ...keyValues,
  };

  if (ObjectId.isValid(id)) {
    query = { ...query, _id: new ObjectId(id) };
  } else {
    query = { ...query, slug: id };
  }

  if (role === 2) {
    query = { ...query, updatedBy: new ObjectId(_id) };
  }

  let project = {
    title: 1,
    preview: 1,
    slug: 1,
    desc: 1,
    videoId: "$video._id",
    video: 1,
    resources: 1,
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

  const result = await Lecture.aggregate([
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
        from: "files",
        localField: "videoId",
        foreignField: "_id",
        as: "video",
      },
    },
    {
      $unwind: { path: "$video", preserveNullAndEmptyArrays: true },
    },
    { $project: project },
  ]);

  const lecture = result.length > 0 ? result[0] : null;
  return lecture;
};
