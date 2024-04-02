// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { NotFound } = require("../utils/errors");
const {
  newQuizService,
  findOneQuizService,
  updateQuizService,
  deleteQuizService,
  findQuizsService,
  findQuizService,
} = require("./service");
const { findOneCourseService } = require("../course/service");

// add quiz
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
      throw new NotFound(req.__("courseNotFoundErr"));
    }

    // new quiz
    const quiz = await newQuizService({ body: req.body, _id });

    // save activity log
    await createActivityLog({
      title: `Add quiz`,
      desc: `Quiz by "${title}" title is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("quizAddSucc"),
      data: { quiz },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update quiz
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { courseId } = req.body;
  const { _id, role } = req.user;

  try {
    // find quiz
    const quiz = await findOneQuizService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!quiz) {
      throw new NotFound(req.__("quizNotFoundErr"));
    }

    // course checking
    const isCourseExist = await findOneCourseService({
      _id: courseId,
      isDelete: false,
    });
    if (!isCourseExist) {
      throw new NotFound(req.__("courseNotFoundErr"));
    }

    // update quiz
    const updatedQuiz = await updateQuizService({
      ...req.body,
      _id,
      role,
      quiz,
    });

    // save activity log
    await createActivityLog({
      title: `Update quiz`,
      desc: `${quiz._id} quiz id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("quizUpdateSucc"),
      data: { quiz: updatedQuiz },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove quiz
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find quiz
    const quiz = await findOneQuizService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!quiz) {
      throw new NotFound(req.__("quizNotFoundErr"));
    }

    // soft delete quiz
    await deleteQuizService({ quiz, _id });

    // save activity log
    await createActivityLog({
      title: `Delete quiz`,
      desc: `${quiz._id} quiz id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("quizDeleteSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list quiz
exports.quizs = async (req, res, next) => {
  const { role, _id } = req.user;
  const { q, page, size } = req.query;
  const query = { isDelete: false };
  let options = {
    q: q !== "undefined" && q !== undefined ? q : "",
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
    _id,
    role,
  };

  try {
    // list
    const quizs = await findQuizsService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("quizListSucc"),
      data: { ...quizs },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// quiz detail
exports.quiz = async (req, res, next) => {
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const quiz = await findQuizService(keyValues);
    if (!quiz) {
      throw new NotFound(req.__("quizNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("quizDetailSucc"),
      data: { quiz },
    });
  } catch (error) {
    next(error, req, res);
  }
};
