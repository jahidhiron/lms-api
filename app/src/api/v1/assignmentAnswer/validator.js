const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");

// add assignment answer validator
exports.addValidator = [
  check("assignmentId")
    .notEmpty()
    .withMessage("Assignment id is required")
    .custom(async (assignmentId) => {
      if (assignmentId && !ObjectId.isValid(assignmentId)) {
        throw "Assignment id not found";
      }
    }),
];

// id validation
exports.assignmentIdValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Assignment id not found";
    }
  }),
];

exports.assignmentAnswerIdValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Assignment answer id not found";
    }
  }),
];
