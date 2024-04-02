// pre-defined module
const { Types } = require("mongoose");
const { check, param } = require("express-validator");

// signup validator
exports.signupValidator = [
  check("name").notEmpty().withMessage("Name is required"),

  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .notEmpty()
    .withMessage("Email is required")
    .trim(),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 character long")
    .notEmpty()
    .withMessage("Password is required"),

  check("role")
    .notEmpty()
    .withMessage("Role is required")
    .custom(async (role) => {
      if (role && isNaN(role)) {
        throw "Role is a numeric value";
      }
      if (role < 2 || role > 3) {
        throw "Role value should be between 2-3";
      }
    }),
];

// add admin validator
exports.addAdminValidator = [
  check("name").notEmpty().withMessage("Name is required"),

  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .notEmpty()
    .withMessage("Email is required")
    .trim(),

  check("password")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 character long")
    .notEmpty()
    .withMessage("Password is required"),
];

// signin validator
exports.signinValidator = [
  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .notEmpty()
    .withMessage("Email is required")
    .trim(),

  check("password").notEmpty().withMessage("Password is required"),
];

// send code to email validator
exports.emailValidator = [
  check("email")
    .isEmail()
    .withMessage("Invalid email address")
    .notEmpty()
    .withMessage("Email is required")
    .trim(),
];

// password validator
exports.passwordValidator = [
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password should be at least 6 character long")
    .notEmpty()
    .withMessage("Password is required"),
];

// email verification
exports.codeValidator = [
  check("code").notEmpty().withMessage("Code is required"),
];

// change password
exports.changePasswordValidator = [
  check("oldPassword").notEmpty().withMessage("Old password is required"),

  check("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password should be at least 6 character long")
    .notEmpty()
    .withMessage("New password is required"),
];

// change profile validator
exports.updateValidator = [
  check("avatar").custom(async (avatar) => {
    if (avatar && !Types.ObjectId.isValid(avatar)) {
      throw "No file id found in database";
    }
  }),
];

// db id validation
exports.idValidator = [
  param("id").custom(async (id) => {
    if (!Types.ObjectId.isValid(id)) {
      throw "User id not found";
    }
  }),
];
