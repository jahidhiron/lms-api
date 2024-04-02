const {
  Types: { ObjectId },
} = require("mongoose");
const { check, param } = require("express-validator");
const validUrl = require("../utils/validUrl");

// update profile validator
exports.updateValidator = [
  check("website").custom(async (website) => {
    if (website && !validUrl(website)) {
      throw "Invalid url";
    }
  }),

  check("linkedIn").custom(async (linkedIn) => {
    if (linkedIn && !validUrl(linkedIn)) {
      throw "Invalid url";
    }
  }),

  check("facebook").custom(async (facebook) => {
    if (facebook && !validUrl(facebook)) {
      throw "Invalid url";
    }
  }),

  check("youtube").custom(async (youtube) => {
    if (youtube && !validUrl(youtube)) {
      throw "Invalid url";
    }
  }),

  check("twitter").custom(async (twitter) => {
    if (twitter && !validUrl(twitter)) {
      throw "Invalid url";
    }
  }),
];
