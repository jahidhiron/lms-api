const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");

// new enrollment
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

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Category id not found";
    }
  }),
];
