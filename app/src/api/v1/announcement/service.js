// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { Announcement } = require("../models");

// find single document
exports.findOneAnnouncementService = async (keyValues, options = {}) => {
  const announcement = await Announcement.findOne(keyValues, options);
  return announcement;
};

// create new Announcement
exports.newAnnouncementService = async ({ body, _id }) => {
  const newAnnouncement = new Announcement({ ...body, updatedBy: _id });
  await newAnnouncement.save();

  newAnnouncement.isDelete = undefined;
  newAnnouncement.__v = undefined;

  return newAnnouncement;
};

// update announcement
exports.updateAnnouncementService = async ({
  announcement,
  title,
  desc,
  courseId,
  _id,
}) => {
  announcement.title = title ? title : announcement.title;
  announcement.desc = desc;
  announcement.courseId = courseId ? courseId : announcement.courseId;
  announcement.updatedBy = _id;

  // save announcement
  await announcement.save();

  return announcement;
};

// add comment to announcement
exports.addCommentService = async ({ title, _id, id }) => {
  const updatedAnnouncement = await Announcement.findOneAndUpdate(
    {
      _id: id,
      isDelete: false,
    },
    { $push: { comments: { title, updatedBy: _id } } },
    { fields: { isDelete: 0, __v: 0 }, new: true }
  );

  return updatedAnnouncement;
};

// update comment to announcement
exports.updateCommentService = async ({ id, title, commentId, _id }) => {
  const updatedAnnouncement = await Announcement.findOneAndUpdate(
    {
      _id: id,
      isDelete: false,
      comments: { $elemMatch: { _id: commentId, updatedBy: _id } },
    },
    { $set: { "comments.$.title": title, "comments.$.updatedBy": _id } },
    { fields: { isDelete: 0, __v: 0 }, new: true }
  );

  return updatedAnnouncement;
};

// delete comment from announcement
exports.deleteCommentService = async ({ id, commentId, _id }) => {
  const updatedAnnouncement = await Announcement.findOneAndUpdate(
    {
      _id: id,
      isDelete: false,
      comments: { $elemMatch: { _id: commentId, updatedBy: _id } },
    },
    { $pull: { comments: { _id: commentId } } },
    { fields: { isDelete: 0, __v: 0 }, new: true }
  );

  return updatedAnnouncement;
};

// soft delete announcement
exports.deleteAnnouncementService = async ({ announcement, _id }) => {
  announcement.isDelete = true;
  announcement.deletedAt = new Date().getTime();
  announcement.deletedBy = _id;

  // save announcement
  await announcement.save();
};

// announcement list
exports.findAnnouncementsService = async (
  keyValues = {},
  { courseId, page, size }
) => {
  const sizeNumber = parseInt(size) || 10;
  const pageNumber = parseInt(page) || 1;

  let query = {
    ...keyValues,
  };

  if (courseId) {
    query = { ...query, courseId };
  }

  const announcements = await Announcement.find(query, { isDelete: 0, __v: 0 })
    .sort({ updatedAt: -1 })
    .populate([
      {
        path: "comments.updatedBy",
        select: "name avatarId",
        populate: [{ path: "avatarId" }],
      },
    ])
    .skip((pageNumber - 1) * sizeNumber)
    .limit(sizeNumber);

  const totalDocuments = await Announcement.countDocuments(query);

  if (announcements.length === 0) {
    return {
      announcements: [],
      totalItem: 0,
      totalPage: 0,
    };
  }

  const totalPage = Math.ceil(totalDocuments / sizeNumber);
  return {
    announcements,
    totalItem: totalDocuments,
    totalPage,
  };
};

// detail announcement
exports.findAnnouncementService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  const announcement = await Announcement.findOne(query, {
    isDelete: 0,
    __v: 0,
  }).populate([
    {
      path: "comments.updatedBy",
      select: "name avatarId",
      populate: [{ path: "avatarId" }],
    },
  ]);

  return announcement;
};
