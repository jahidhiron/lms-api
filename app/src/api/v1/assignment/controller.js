// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { NotFound } = require("../utils/errors");
const {
  newAssignmentService,
  findOneAssignmentService,
  updateAssignmentService,
  deleteAssignmentService,
  findAssignmentsService,
  findAssignmentService,
} = require("./service");
const { findOneFileService } = require("../file/service");
const { findOneCourseService } = require("../course/service");

// add assignment
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const {
    title,
    instructionVideoId,
    instructionFileId,
    solutionVideoId,
    solutionFileId,
    courseId,
  } = req.body;
  const { _id } = req.user;

  try {
    // course checking
    const course = await findOneCourseService({
      _id: courseId,
      isDelete: false,
    });
    if (!course) {
      throw new NotFound(req.__("courseNotFoundErr"));
    }

    // instruction video file checking
    if (instructionVideoId) {
      const file = await findOneFileService({
        _id: instructionVideoId,
        isDelete: false,
      });
      if (!file) {
        throw new NotFound("Instruction video file not found");
      }
    }

    // instruction resource file checking
    if (instructionFileId) {
      const file = await findOneFileService({
        _id: instructionFileId,
        isDelete: false,
      });
      if (!file) {
        throw new NotFound("Instruction resource file not found");
      }
    }

    // solution video file checking
    if (solutionVideoId) {
      const file = await findOneFileService({
        _id: solutionVideoId,
        isDelete: false,
      });
      if (!file) {
        throw new NotFound("Solution video file not found");
      }
    }

    // solution resource file checking
    if (solutionFileId) {
      const file = await findOneFileService({
        _id: solutionFileId,
        isDelete: false,
      });
      if (!file) {
        throw new NotFound("Solution resource file not found");
      }
    }

    // add assignment
    const assignment = await newAssignmentService({ body: req.body, _id });

    // save activity log
    await createActivityLog({
      title: `Add assignment`,
      desc: `Assignment by "${title}" title is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("assignmentAddSucc"),
      data: { assignment },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update assignment
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;
  const {
    title,
    instructionVideoId,
    instructionFileId,
    solutionVideoId,
    solutionFileId,
    courseId,
  } = req.body;

  try {
    // find assignment
    const assignment = await findOneAssignmentService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!assignment) {
      throw new NotFound(req.__("assignmentNotFoundErr"));
    }

    // course checking
    if (courseId) {
      const course = await findOneCourseService({
        _id: courseId,
        isDelete: false,
      });
      if (!course) {
        throw new NotFound(req.__("courseNotFoundErr"));
      }
    }

    // instruction video file checking
    if (instructionVideoId) {
      const file = await findOneFileService({
        _id: instructionVideoId,
        isDelete: false,
      });
      if (!file) {
        throw new NotFound("Instruction video file not found");
      }
    }

    // instruction resource file checking
    if (instructionFileId) {
      const file = await findOneFileService({
        _id: instructionFileId,
        isDelete: false,
      });
      if (!file) {
        throw new NotFound("Instruction resource file not found");
      }
    }

    // solution video file checking
    if (solutionVideoId) {
      const file = await findOneFileService({
        _id: solutionVideoId,
        isDelete: false,
      });
      if (!file) {
        throw new NotFound("Solution video file not found");
      }
    }

    // solution resource file checking
    if (solutionFileId) {
      const file = await findOneFileService({
        _id: solutionFileId,
        isDelete: false,
      });
      if (!file) {
        throw new NotFound("Solution resource file not found");
      }
    }

    // update assignment
    const updatedAssignment = await updateAssignmentService({
      ...req.body,
      _id,
      assignment,
    });

    // save activity log
    await createActivityLog({
      title: `Update assignment`,
      desc: `${assignment._id} assignment id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("assignmentUpdateSucc"),
      data: { assignment: updatedAssignment },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove assignment
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find assignment
    const assignment = await findOneAssignmentService({
      _id: id,
      isDelete: false,
    });
    if (!assignment) {
      throw new NotFound(req.__("assignmentNotFoundErr"));
    }

    // soft delete assignment
    await deleteAssignmentService({ assignment, _id });

    // save activity log
    await createActivityLog({
      title: `Delete assignment`,
      desc: `${assignment._id} assignment id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("assignmentDeleteSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list assignment
exports.assignments = async (req, res, next) => {
  const { q, page, size } = req.query;
  const query = { isDelete: false };
  let options = {
    q: q !== "undefined" && q !== undefined ? q : "",
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
  };

  try {
    // list
    const assignments = await findAssignmentsService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("assignmentListSucc"),
      data: { ...assignments },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// assignment detail
exports.assignment = async (req, res, next) => {
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const assignment = await findAssignmentService(keyValues);
    if (!assignment) {
      throw new NotFound(req.__("assignmentNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("assignmentDetailSucc"),
      data: { assignment },
    });
  } catch (error) {
    next(error, req, res);
  }
};
