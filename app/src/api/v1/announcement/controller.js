// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { NotFound } = require("../utils/errors");
const {
  newAnnouncementService,
  findOneAnnouncementService,
  updateAnnouncementService,
  addCommentService,
  deleteAnnouncementService,
  findAnnouncementsService,
  findAnnouncementService,
  updateCommentService,
  deleteCommentService,
} = require("./service");
const { findOneCourseService } = require("../course/service");

// add announcement
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { title, courseId } = req.body;
  const { _id } = req.user;

  try {
    // course checking
    const isCourseExist = await findOneCourseService({
      _id: courseId,
      isDelete: false,
    });
    if (!isCourseExist) {
      throw new NotFound(res.__("courseNotFoundErr"));
    }

    // add announcement
    const announcement = await newAnnouncementService({ body: req.body, _id });

    // save activity log
    await createActivityLog({
      title: `Add announcement`,
      desc: `Announcement by "${title}" title is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("announcementAddSucc"),
      data: { announcement },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update announcement
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;
  const { courseId } = req.body;

  try {
    // find announcement
    const announcement = await findOneAnnouncementService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!announcement) {
      throw new NotFound(req.__("announcementNotFoundErr"));
    }

    // course checking
    const isCourseExist = await findOneCourseService({
      _id: courseId,
      isDelete: false,
    });
    if (!isCourseExist) {
      throw new NotFound(res.__("courseNotFoundErr"));
    }

    // update announcement
    const updatedAnnouncement = await updateAnnouncementService({
      ...req.body,
      _id,
      announcement,
    });

    // save activity log
    await createActivityLog({
      title: `Update announcement`,
      desc: `${announcement._id} announcement id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("announcementUpdatedSucc"),
      data: { announcement: updatedAnnouncement },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// add comment
exports.addComment = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // update announcement
    const announcement = await addCommentService({
      ...req.body,
      _id,
      id,
    });
    if (!announcement) {
      throw new NotFound(req.__("announcementNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `Add comment to announcement`,
      desc: `Comment is added to ${announcement._id} announcement id`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("announcementCommentAddSucc"),
      data: { announcement },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update comment
exports.updateComment = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // update announcement
    const announcement = await updateCommentService({
      ...req.body,
      id,
      _id,
    });
    if (!announcement) {
      throw new NotFound(req.__("announcementNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `Add comment to announcement`,
      desc: `Comment is added to ${announcement._id} announcement id`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("announcementCommentUpdateSucc"),
      data: { announcement },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// delete comment
exports.deleteComment = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // update announcement
    const announcement = await deleteCommentService({
      ...req.body,
      id,
      _id,
    });
    if (!announcement) {
      throw new NotFound(req.__("announcementNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `Add comment to announcement`,
      desc: `Comment is added to ${announcement._id} announcement id`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("announcementCommentDeleteSucc"),
      data: { announcement },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove announcement
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find announcement
    const announcement = await findOneAnnouncementService(
      {
        _id: id,
        updatedBy: _id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!announcement) {
      throw new NotFound(req.__("announcementNotFoundErr"));
    }

    // soft delete announcement
    await deleteAnnouncementService({ announcement, _id });

    // save activity log
    await createActivityLog({
      title: `Delete announcement`,
      desc: `${announcement._id} announcement id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("announcementDeletedSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list announcement
exports.announcements = async (req, res, next) => {
  const { page, size, courseId } = req.query;
  const query = { isDelete: false };
  let options = {
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
    courseId,
  };

  try {
    // list
    const announcement = await findAnnouncementsService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("announcementListSucc"),
      data: { ...announcement },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// announcement detail
exports.announcement = async (req, res, next) => {
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const announcement = await findAnnouncementService(keyValues);
    if (!announcement) {
      throw new NotFound(req.__("announcementNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("announcementDetailSucc"),
      data: { announcement },
    });
  } catch (error) {
    next(error, req, res);
  }
};
