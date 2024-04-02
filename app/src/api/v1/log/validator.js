const { Types } = require("mongoose");
const { param } = require("express-validator");

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!Types.ObjectId.isValid(id)) {
      throw "No log id found in database";
    }
  }),
];
