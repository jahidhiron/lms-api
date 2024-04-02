// pre-defined module
const router = require("express").Router();

// custom module
const { isAuthenticated, validate, isAdmin } = require("../middlewares");
const {
  signupValidator,
  addAdminValidator,
  signinValidator,
  emailValidator,
  codeValidator,
  idValidator,
  passwordValidator,
  changePasswordValidator,
} = require("./validator");
const {
  signup,
  signin,
  refreshToken,
  currentUser,
  sendCodeToEmail,
  verifyEmail,
  forgotPassword,
  verifyForgotPasswordCode,
  resetPassword,
  changePassword,
  softDeleteUser,
  hardDeleteUser,
  userList,
  userDetail,
  signout,
} = require("./controller");

// routes
router.post("/signup", signupValidator, validate, signup);

router.post(
  "/add-admin",
  isAuthenticated,
  isAdmin,
  addAdminValidator,
  validate,
  signup
);

router.post("/signin", signinValidator, validate, signin);

router.get("/refresh-token", refreshToken);

router.get("/current", isAuthenticated, currentUser);

router.post("/send-code-to-email", emailValidator, validate, sendCodeToEmail);

router.post(
  "/verify-email",
  emailValidator,
  codeValidator,
  validate,
  verifyEmail
);

router.post("/forgot-password", emailValidator, validate, forgotPassword);

router.post(
  "/verify-forgot-password-code",
  emailValidator,
  codeValidator,
  validate,
  verifyForgotPasswordCode
);

router.post(
  "/reset-password",
  emailValidator,
  codeValidator,
  passwordValidator,
  validate,
  resetPassword
);

router.post(
  "/change-password",
  isAuthenticated,
  changePasswordValidator,
  validate,
  changePassword
);

router.delete(
  "/user/soft/:id",
  isAuthenticated,
  idValidator,
  validate,
  softDeleteUser
);

router.delete(
  "/user/hard/:id",
  isAuthenticated,
  idValidator,
  validate,
  hardDeleteUser
);

router.get("/list", isAuthenticated, isAdmin, userList);

router.get("/user/:id", isAuthenticated, idValidator, validate, userDetail);

router.get("/signout", isAuthenticated, signout);

module.exports = router;
