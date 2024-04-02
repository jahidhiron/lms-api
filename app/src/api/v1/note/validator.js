const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");

// add note validator
exports.addValidator = [
  check("title").notEmpty().withMessage("Title is required"),

  check("noteInSecond").custom(async (noteInSecond) => {
    if (noteInSecond && isNaN(noteInSecond)) {
      throw "Note in second is numeric value";
    }
  }),

  check("lectureId")
    .notEmpty()
    .withMessage("Lecture is required")
    .custom(async (lectureId) => {
      if (lectureId && !ObjectId.isValid(lectureId)) {
        throw "Lecture id not found";
      }
    }),
];

// update note validator
exports.updateValidator = [
  check("lectureId").custom(async (lectureId) => {
    if (lectureId && !ObjectId.isValid(lectureId)) {
      throw "Lecture id not found";
    }
  }),

  check("noteInSecond").custom(async (noteInSecond) => {
    if (noteInSecond && isNaN(noteInSecond)) {
      throw "Note in second is numeric value";
    }
  }),
];

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Announcement id not found";
    }
  }),
];
