const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param, query } = require("express-validator");

// add question answer validator
exports.addValidator = [
  check("quizId")
    .notEmpty()
    .withMessage("Quiz id is required")
    .custom(async (quizId) => {
      if (quizId && !ObjectId.isValid(quizId)) {
        throw "Quiz id not found";
      }
    }),
];

exports.listValidator = [
  query("courseId").custom(async (courseId) => {
    if (courseId && !ObjectId.isValid(courseId)) {
      throw "Course id not found";
    }
  }),
];

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Question answer id not found";
    }
  }),
];
