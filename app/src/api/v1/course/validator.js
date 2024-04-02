const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param, query } = require("express-validator");

// add course validator
exports.addValidator = [
  check("title").notEmpty().withMessage("Title is required"),

  check("price").custom(async (price) => {
    if (price && price.amount && isNaN(price.amount)) {
      throw "Price amount is a numeric value";
    }
  }),
];

// update course validator
exports.updateValidator = [
  check("price").custom(async (price) => {
    if (price && price.amount && isNaN(price.amount)) {
      throw "Price amount is a numeric value";
    }
  }),
];

// public course validator
exports.publicCourseValidator = [
  query("rating").custom(async (rating) => {
    if (rating && isNaN(rating)) {
      throw "Rating is a numeric value";
    }
  }),
];

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Course id not found";
    }
  }),
];
