const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");

// add category validator
exports.addValidator = [
  check("title").notEmpty().withMessage("Title is required"),
];

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Category id not found";
    }
  }),
];
