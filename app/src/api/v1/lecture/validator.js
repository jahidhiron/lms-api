const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");

// add lecture validator
exports.addValidator = [
  check("title").notEmpty().withMessage("Title is required"),
];

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "Lecture id not found";
    }
  }),
];
