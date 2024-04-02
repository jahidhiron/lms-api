const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");

// add new payment order validator
exports.addValidator = [
  check("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .custom(async (amount) => {
      if (amount && isNaN(amount)) {
        throw "Amount is a numeric value";
      }
    }),

  check("currency").notEmpty().withMessage("Currency is required"),
];

// confirm order
exports.captureValidator = [
  check("courseId")
    .notEmpty()
    .withMessage("Course id is required")
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
      throw "Payment id not found";
    }
  }),
];
