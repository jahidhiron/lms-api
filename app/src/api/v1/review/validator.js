const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");

// add comment validator
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

// add comment reply validator
exports.addReplyValidator = [
  check("msg").notEmpty().withMessage("Comment message is required"),
];

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Review id not found";
    }
  }),
];
