const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");

// add sub category validator
exports.addValidator = [
  check("title").notEmpty().withMessage("Title is required"),

  check("categoryId")
    .notEmpty()
    .withMessage("Category is required")
    .custom(async (categoryId) => {
      if (categoryId && !ObjectId.isValid(categoryId)) {
        throw "Category id not found";
      }
    }),
];

// update sub category validator
exports.updateValidator = [
  check("categoryId").custom(async (categoryId) => {
    if (categoryId && !ObjectId.isValid(categoryId)) {
      throw "Sub category id not found";
    }
  }),
];

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Sub category id not found";
    }
  }),
];
