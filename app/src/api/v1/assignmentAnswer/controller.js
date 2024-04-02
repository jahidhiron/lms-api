// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { BadRequest, NotFound } = require("../utils/errors");
const {
  newAssignmentAnswerService,
  findOneAssignmentAnswerService,
  deleteAssignmentAnswerService,
  findassignmentAnswersService,
  findassignmentAnswerService,
  submitAssignmentAnswerService,
  updateAssignmentAnswerService,
} = require("./service");
const { findOneAssignmentService } = require("../assignment/service");

// add assignment answer
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { assignmentId } = req.body;
  const { _id } = req.user;

  try {
    // assignment checker
    const isAssignmentExist = await findOneAssignmentService({
      _id: assignmentId,
      isDelete: false,
    });
    if (!isAssignmentExist) {
      throw new BadRequest(req.__("assignmentNotFoundErr"));
    }

    const isAssignmentAnswerExist = await findOneAssignmentAnswerService({
      assignmentId,
      updatedBy: _id,
      isDelete: false,
    });
    if (isAssignmentAnswerExist) {
      throw new BadRequest(req.__("assignmentAnswerExistErr"));
    }

    // add assignment answer
    const assignment = await newAssignmentAnswerService({
      body: req.body,
      _id,
    });

    // save activity log
    await createActivityLog({
      title: `Add assignment answer`,
      desc: `Assignment answer by "${assignmentId}" assignment id is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("assignmentAnswerAddSucc"),
      data: { assignment },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    const assignmentAnswer = await findOneAssignmentAnswerService({
      _id: id,
      isDelete: false,
    });
    if (!assignmentAnswer) {
      throw new NotFound(req.__("assignmentAnswerNotFoundErr"));
    }

    // add assignment answer
    const updatedAssignmentAnswer = await updateAssignmentAnswerService({
      ...req.body,
      assignmentAnswer,
      _id,
    });

    // save activity log
    await createActivityLog({
      title: `Update assignment answer`,
      desc: `Assignment answer by "${id}" assignment answer id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("assignmentAnswerUpdateSucc"),
      data: { assignmentAnswer: updatedAssignmentAnswer },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// submit assignment
exports.submit = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    const assignmentAnswer = await findOneAssignmentAnswerService({
      _id: id,
      isDelete: false,
    });
    if (!assignmentAnswer) {
      throw new NotFound(req.__("assignmentAnswerNotFoundErr"));
    }

    if (assignmentAnswer.status === 2) {
      throw new BadRequest(req.__("assignmentAnswerAlreadySubmitErr"));
    }

    // submit assignment answer
    const updatedAssignmentAnswer = await submitAssignmentAnswerService({
      assignmentAnswer,
      _id,
    });

    // save activity log
    await createActivityLog({
      title: `Submit assignment answer`,
      desc: `Submit assignment answer by "${id}" assignment answer id`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("submitAssignmentAnswerSucc"),
      data: { assignmentAnswer: updatedAssignmentAnswer },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove assignment answer
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find assignment answer
    const assignmentAnswer = await findOneAssignmentAnswerService({
      _id: id,
      isDelete: false,
    });
    if (!assignmentAnswer) {
      throw new NotFound(req.__("assignmentAnswerNotFoundErr"));
    }

    // soft delete assignment answer
    await deleteAssignmentAnswerService({ assignmentAnswer, _id });

    // save activity log
    await createActivityLog({
      title: `Delete assignment answer`,
      desc: `"${assignmentAnswer._id}" assignment answer id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("assignmentAnswerDeletedSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list assignment answer
exports.assignmentAnswers = async (req, res, next) => {
  const { page, size } = req.query;
  const query = { isDelete: false };
  let options = {
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
  };

  try {
    // list
    const assignmentAnswers = await findassignmentAnswersService(
      query,
      options
    );

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("assignmentAnswerListSucc"),
      data: { ...assignmentAnswers },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// assignment answer detail
exports.assignmentAnswer = async (req, res, next) => {
  const { id } = req.params;
  const keyValues = { id };

  try {
    // list
    const assignmentAnswer = await findassignmentAnswerService(keyValues);
    if (!assignmentAnswer) {
      throw new NotFound(req.__("assignmentAnswerNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("assignmentAnswerDetailSucc"),
      data: { assignmentAnswer },
    });
  } catch (error) {
    next(error, req, res);
  }
};
