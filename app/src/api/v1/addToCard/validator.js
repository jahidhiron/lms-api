const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");

// add addToCard validator
exports.addValidator = [
  check("courseId")
    .notEmpty()
    .withMessage("Course is required")
    .custom(async (courseId) => {
      if (courseId && !ObjectId.isValid(courseId)) {
        throw "Course id not found";
      }
    }),
];

// update addToCard validator
exports.updateValidator = [
  check("courseId").custom(async (courseId) => {
    if (courseId && !ObjectId.isValid(courseId)) {
      throw "Course id not found";
    }
  }),
];

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Add to card id not found";
    }
  }),
];
