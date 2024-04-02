const {
  Types: { ObjectId },
} = require("mongoose");
const { param, check } = require("express-validator");

exports.validateExtension = (ext) => {
  if (
    ext === ".jpg" ||
    ext === ".jpeg" ||
    ext === ".png" ||
    ext === ".mp4" ||
    ext === ".wmv" ||
    ext === ".doc" ||
    ext === ".docx" ||
    ext === ".pdf" ||
    ext === ".text" ||
    ext === ".txt" ||
    ext === ".vtt" ||
    ext === ".srt"
  ) {
    return true;
  } else {
    return false;
  }
};

// upload file validator
exports.uploadFileValidator = [
  check("type")
    .notEmpty()
    .withMessage("File type is required")
    .custom(async (type) => {
      if (type && isNaN(type)) {
        throw "File type is a numeric value";
      }
    }),

  check("courseId").custom(async (courseId) => {
    if (courseId && !ObjectId.isValid(courseId)) {
      throw "Course id not found";
    }
  }),
];

// id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!ObjectId.isValid(id)) {
      throw "File id not found";
    }
  }),
];
