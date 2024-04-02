const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param, query } = require("express-validator");

// add rating validator
exports.addValidator = [
  check("rating")
    .notEmpty()
    .withMessage("Rating is required")
    .custom(async (rating) => {
      if (rating) {
        if (isNaN(rating)) {
          throw "Rating is a numeric value";
        }
        if (rating < 0 || rating > 5) {
          throw "Rating value is between 0 to 5";
        }
      }
    }),

  check("courseId")
    .notEmpty()
    .withMessage("Course is required")
    .custom(async (courseId) => {
      if (courseId && !ObjectId.isValid(courseId)) {
        throw "Course id not found";
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
      throw "Rating id not found";
    }
  }),
];
