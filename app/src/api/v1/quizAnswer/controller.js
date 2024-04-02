// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { NotFound } = require("../utils/errors");
const {
  newQuizAnswerService,
  findOneQuizAnswerService,
  deleteQuizAnswerService,
  findQuizAnswersService,
  findQuizAnswerService,
  updateQuizAnswerService,
} = require("./service");
const { findOneQuizService } = require("../quiz/service");
const singleAnswerChecking = require("../utils/singleAnswerCehcking");

// add quiz answer
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { quizId, answers } = req.body;
  const { _id } = req.user;

  try {
    // quiz checking
    const quiz = await findOneQuizService({
      _id: quizId,
      isDelete: false,
    });
    if (!quiz) {
      throw new NotFound(req.__("quizNotFoundErr"));
    }

    const questions = quiz.questions;
    const checkedAnswers = [];

    for (const item of questions) {
      for (let innerItem of answers) {
        let question = null;
        if (String(item._id) === String(innerItem.questionId)) {
          question = item;
          const checkedAnswer = singleAnswerChecking({
            answer: question,
            answerProvided: innerItem.answerProvided,
          });
          checkedAnswers.push(checkedAnswer);
        }
      }
    }

    const isQuizAnswerExist = await findOneQuizAnswerService({
      quizId,
      updatedBy: _id,
      isDelete: false,
    });

    let quizAnswer = null;
    if (!isQuizAnswerExist) {
      quizAnswer = await newQuizAnswerService({
        body: { quizId, answer: checkedAnswers },
        _id,
      });
    } else {
      const body = {
        quizAnswer: isQuizAnswerExist,
        answer: checkedAnswers,
        oldAnswer: [...isQuizAnswerExist.oldAnswer],
        _id,
      };
      if (isQuizAnswerExist.answer.length > 0) {
        body.oldAnswer.push(isQuizAnswerExist.answer);
      }

      quizAnswer = await updateQuizAnswerService(body);
    }

    // save activity log
    await createActivityLog({
      title: `Submit quiz answer`,
      desc: `Submit quiz answer for quiz id "${quizId}"`,
      ip,
      user: _id,
    });

    // response
    const code = isQuizAnswerExist ? 200 : 201;
    res.status(code).json({
      code,
      status: "success",
      message: req.__("quizAnswerSubmitSucc"),
      data: { quizAnswer },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove quiz answer
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find quiz answer
    const quizAnswer = await findOneQuizAnswerService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!quizAnswer) {
      throw new NotFound(req.__("quizAnswerNotFoundErr"));
    }

    // soft delete quiz answer
    await deleteQuizAnswerService({ quizAnswer, _id });

    // save activity log
    await createActivityLog({
      title: `Delete quiz answer`,
      desc: `${quizAnswer._id} quiz answer id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("quizAnswerDeleteSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list quiz answer
exports.quizAnswers = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { page, size, quizId, courseId, q } = req.query;
  const query = { isDelete: false };
  let options = {
    q,
    quizId,
    courseId,
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
  };

  try {
    // list
    const quizAnswers = await findQuizAnswersService(query, options);

    // save activity log
    await createActivityLog({
      title: `Quiz answer list`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("QuizAnswerListSucc"),
      data: { ...quizAnswers },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// quiz answer detail
exports.quizAnswer = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { id } = req.params;
  const keyValues = { quizId: id, _id };

  try {
    // list
    const quizAnswer = await findQuizAnswerService(keyValues);
    if (!quizAnswer) {
      throw new NotFound(req.__("quizAnswerNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `Quiz answer detail`,
      desc: `${quizAnswer._id} quiz answer id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("quizAnswerDetailSucc"),
      data: { quizAnswer },
    });
  } catch (error) {
    next(error, req, res);
  }
};
