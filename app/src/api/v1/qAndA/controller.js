// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { NotFound } = require("../utils/errors");
const {
  newQAService,
  findOneQAService,
  updateQAService,
  deleteQAService,
  findQAsService,
  findQAService,
  qAVoteService,
  addReplyService,
  updateReplyService,
  deleteReplyService,
  qAReplyVoteService,
} = require("./service");
const { findOneCourseService } = require("../course/service");
const { findOneLectureService } = require("../lecture/service");

// add qa
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { title, courseId, lectureId } = req.body;
  const { _id } = req.user;

  try {
    // course checking
    const isCourseExist = await findOneCourseService({
      _id: courseId,
      isDelete: false,
    });
    if (!isCourseExist) {
      throw new NotFound(req.__("courseNotFoundErr"));
    }

    // lecture checking
    const isLectureExist = await findOneLectureService({
      _id: lectureId,
      isDelete: false,
    });
    if (!isLectureExist) {
      throw new NotFound(req.__("lectureNotFoundErr"));
    }

    // add qa
    const qa = await newQAService({ body: req.body, _id });

    // save activity log
    await createActivityLog({
      title: `Add qa`,
      desc: `QA by "${title}" title is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("qaAddSucc"),
      data: { qa },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update qa
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find qa
    const qa = await findOneQAService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!qa) {
      throw new NotFound(req.__("qaNotFoundErr"));
    }

    // update qa
    const updatedQA = await updateQAService({
      ...req.body,
      _id,
      qa,
    });

    // save activity log
    await createActivityLog({
      title: `Update qa`,
      desc: `${updatedQA._id} qa id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("qaUpdatedSucc"),
      data: { qa: updatedQA },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// vote qa
exports.vote = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find qa
    const qa = await findOneQAService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!qa) {
      throw new NotFound(req.__("qaNotFoundErr"));
    }

    // update qa
    const { qa: updatedQA, voted } = await qAVoteService({
      userId: _id,
      qa,
    });

    // save activity log
    await createActivityLog({
      title: `Vote ${voted ? "added" : "withdrawn"}`,
      desc: `Vote ${voted ? "added" : "withdrawn"} by ${updatedQA._id} qa id`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("voteAppSucc"),
      data: { qa: updatedQA },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// vote qa
exports.replyVote = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;
  const { replyId } = req.body;

  try {
    // find qa
    const qa = await findOneQAService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!qa) {
      throw new NotFound(req.__("qaNotFoundErr"));
    }

    // update qa
    const { updatedQA, voted } = await qAReplyVoteService({
      replyId,
      userId: _id,
      qa,
    });

    // save activity log
    await createActivityLog({
      title: `Vote ${voted ? "added" : "withdrawn"}`,
      desc: `Vote ${voted ? "added" : "withdrawn"} by ${
        updatedQA._id
      } qa id & ${replyId} replied id`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("replyVoteAppSucc"),
      data: { qa: updatedQA },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// add qa reply
exports.addReply = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find qa
    const qa = await findOneQAService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!qa) {
      throw new NotFound(req.__("qaNotFoundErr"));
    }

    // add review reply
    const updatedQA = await addReplyService({
      qa,
      ...req.body,
      _id,
    });

    // save activity log
    await createActivityLog({
      title: `Add QA reply`,
      desc: `QA reply by ${qa._id} id is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("qAReplyAddSucc"),
      data: { qa: updatedQA },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update qa reply
exports.updateReply = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;
  const { replyId } = req.body;

  try {
    // find qa
    const qa = await findOneQAService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!qa) {
      throw new NotFound(req.__("qaNotFoundErr"));
    }

    // add review reply
    const { replyIdNotFound, updatedQA } = await updateReplyService({
      qa,
      ...req.body,
      replyId,
      _id,
    });

    if (replyIdNotFound) {
      throw new NotFound(req.__("replyIdNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `Update qa reply`,
      desc: `${replyId} reply id of ${qa._id} qa id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("qAReplyUpdatedSucc"),
      data: { qa: updatedQA },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// delete qa reply
exports.deleteReply = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;
  const { replyId } = req.query;

  try {
    // find qa
    const qa = await findOneQAService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!qa) {
      throw new NotFound(req.__("qaNotFoundErr"));
    }

    // add review reply
    const { replyIdNotFound, qa: udpatedQA } = await deleteReplyService({
      qa,
      replyId,
      _id,
    });

    if (replyIdNotFound) {
      throw new NotFound(req.__("replyIdNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `Delete qa reply`,
      desc: `${replyId} reply id of ${qa._id} qa id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("replyDeleteSucc"),
      data: { qa: udpatedQA },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove qa
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find qa
    const qa = await findOneQAService({
      _id: id,
      isDelete: false,
    });
    if (!qa) {
      throw new NotFound(req.__("qaNotFoundErr"));
    }

    // soft delete qa
    await deleteQAService({ qa, _id });

    // save activity log
    await createActivityLog({
      title: `Delete qa`,
      desc: `${qa._id} qa id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("qaDeletedSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list qa
exports.qas = async (req, res, next) => {
  const { q, page, size, courseId, lectureId } = req.query;
  const query = { isDelete: false };
  let options = {
    q: q !== "undefined" && q !== undefined ? q : "",
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
    courseId,
    lectureId,
  };

  try {
    // list
    const qas = await findQAsService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("qaListSucc"),
      data: { ...qas },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// qa detail
exports.qa = async (req, res, next) => {
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const qa = await findQAService(keyValues);
    if (!qa) {
      throw new NotFound(req.__("qaNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("qaDetailSucc"),
      data: { qa },
    });
  } catch (error) {
    next(error, req, res);
  }
};
