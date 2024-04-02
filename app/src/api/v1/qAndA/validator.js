const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");

// add qa validator
exports.addValidator = [
  check("title").notEmpty().withMessage("Title is required"),

  check("courseId")
    .notEmpty()
    .withMessage("Course id is required")
    .custom(async (courseId) => {
      if (courseId && !ObjectId.isValid(courseId)) {
        throw "Course id not found";
      }
    }),

  check("lectureId")
    .notEmpty()
    .withMessage("Lecture id is required")
    .custom(async (lectureId) => {
      if (lectureId && !ObjectId.isValid(lectureId)) {
        throw "Lecture id not found";
      }
    }),
];

// update qa validator
exports.updateValidator = [
  check("lectureId").custom(async (lectureId) => {
    if (lectureId && !ObjectId.isValid(lectureId)) {
      throw "Lecture id not found";
    }
  }),
];

// qa reply validator
exports.qAReplyValidator = [
  check("desc").notEmpty().withMessage("Description is required"),
];

exports.qAUpdateReplyValidator = [
  check("replyId")
    .notEmpty()
    .withMessage("Reply id is required")
    .custom(async (replyId) => {
      if (replyId && !ObjectId.isValid(replyId)) {
        throw "Reply id not found";
      }
    }),

  check("desc").notEmpty().withMessage("Description is required"),
];

// qa vote validator
exports.replyVoteValidator = [
  check("replyId")
    .notEmpty()
    .withMessage("Reply id is required")
    .custom(async (replyId) => {
      if (replyId && !ObjectId.isValid(replyId)) {
        throw "Reply id not found";
      }
    }),
];

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Id not found";
    }
  }),
];
