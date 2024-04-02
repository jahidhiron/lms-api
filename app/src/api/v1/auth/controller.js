// custom module
const {
  findOneUserService,
  findUsersService,
  newUserService,
  storeVerifyEmailCodeService,
  storeForgotPsswordCodeService,
  verifyUserServices,
  verifyCodeService,
  passwordResetService,
  changePasswordService,
  lastLoginService,
  softDeleteOneService,
  hardDeleteOneService,
  findUserDetailService,
} = require("./service");
const { newProfileService } = require("../profile/service");
const { sendEmailService } = require("../services");
const {
  findOneAddToCardService,
  newAddToCardService,
} = require("../addToCard/service");
const { BadRequest, Unauthorized, NotFound } = require("../utils/errors");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  clearRefreshToken,
} = require("../utils/jwtHelper");
const { createActivityLog } = require("../utils/createActivityLog");
const { comparePassword } = require("../utils/bcryptHelper");
const { env } = require("../../../config");

// signup
exports.signup = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { email } = req.body;

  try {
    // email checker
    const isUserExist = await findOneUserService({ email, isDelete: false });
    if (isUserExist) {
      throw new BadRequest(req.__("userExistErr"));
    }

    // create new profile
    const newProfile = await newProfileService();

    // add user
    const { user, code } = await newUserService({
      ...req.body,
      ip,
      body: { ...req.body, profileId: newProfile._id },
    });

    // send email code here
    await sendEmailService({
      body: {
        heading: "Verify email",
        description: "Use this code to verify your email",
        mainContent: `Code: ${code}`,
      },
      email,
      subject: "email verification",
      errorMsg: res.__("userVerificationEmailSentErr"),
    });

    // save activity log
    await createActivityLog({
      title: `Signup`,
      ip,
      user: user._id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("signupSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// signin
exports.signin = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { email, password, courseIds } = req.body;

  try {
    // user checker
    const user = await findOneUserService({ email, isDelete: false });
    if (!user) {
      throw new Unauthorized(res.__("credentialsErr"));
    }

    // password checker
    const match = await comparePassword(password, user.password);
    if (!match) {
      throw new Unauthorized(res.__("credentialsErr"));
    }

    // generate token
    const accessToken = await generateAccessToken(user, {
      genTokenErr: res.__("genTokenErr"),
    });
    const refreshToken = await generateRefreshToken(user, {
      genTokenErr: res.__("genTokenErr"),
      redisBacklistErr: res.__("redisBacklistErr"),
    });

    // store last login flag
    await lastLoginService(user);

    // add to card
    if (courseIds) {
      for await (const courseId of courseIds) {
        const isAddToCardExist = await findOneAddToCardService({
          courseId,
          updatedBy: user._id,
          isDelete: false,
        });
        if (!isAddToCardExist) {
          await newAddToCardService({ body: { courseId }, _id: user._id });
        }
      }
    }

    // save activity log
    await createActivityLog({
      title: `Signin`,
      ip,
      user: user._id,
    });

    // response
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: env === "prod",
      maxAge: 1000 * 60 * 60 * 1,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env === "prod",
      maxAge: 1000 * 60 * 60 * 24 * 7 * 365,
    });
    res
      .status(200)
      .json({ code: 200, status: "success", message: res.__("signinSuccess") });
  } catch (error) {
    next(error, req, res);
  }
};

// refreshToken
exports.refreshToken = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

  try {
    const user = await verifyRefreshToken(req, res);
    // generate token
    const accessToken = await generateAccessToken(user, {
      genTokenErr: res.__("genTokenErr"),
    });
    const refreshToken = await generateRefreshToken(user, {
      genTokenErr: res.__("genTokenErr"),
      redisBacklistErr: res.__("redisBacklistErr"),
    });

    // save activity log
    await createActivityLog({
      title: `Refresh token`,
      ip,
      user: user._id,
    });

    // response
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: env === "prod",
      maxAge: 1000 * 60 * 60 * 1,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: env === "prod",
      maxAge: 1000 * 60 * 60 * 24 * 7 * 365,
    });
    res
      .status(200)
      .json({ code: 200, status: "success", message: res.__("genTokenSucc") });
  } catch (error) {
    next(error, req, res);
  }
};

// current user
exports.currentUser = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { email } = req.user;

  try {
    // user checker
    const user = await findUserDetailService(
      { email, isDelete: false },
      { password: 0, resetPassword: 0, __v: 0, isDelete: 0 }
    );
    if (!user) {
      throw NotFound(res.__("userNotFoundErr"));
    }

    // user.verified = user.verified.email.status;

    // save activity log
    await createActivityLog({
      title: `Current user`,
      ip,
      user: user._id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("currentUserSucc"),
      data: { user },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// send code to email
exports.sendCodeToEmail = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { email } = req.body;

  try {
    // user checker
    const user = await findOneUserService(
      { email, isDelete: false },
      { password: 0 }
    );

    if (!user) {
      throw new NotFound(res.__("userNotFoundErr"));
    }

    if (user.verified.email.status) {
      throw new BadRequest(res.__("emailAlreadyVerifiedErr"));
    }

    // sent code limit checker
    if (
      user.verified.email.verifyCode &&
      user.verified.email.verifyCode.length > 10
    ) {
      throw new BadRequest(res.__("codeLimitErr"));
    }

    // store verification code to database
    const { code } = await storeVerifyEmailCodeService({ user, ip });

    // send verification code to email
    await sendEmailService({
      body: {
        heading: "Verify email",
        description: "Use this code to verify your email",
        mainContent: `Code: ${code}`,
      },
      email,
      subject: "email verification code",
      errorMsg: res.__("userVerificationEmailSentErr"),
    });

    // save activity log
    await createActivityLog({
      title: `Sent email verification`,
      ip,
      user: user._id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("sendEmailVerficationCodeSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// email verification
exports.verifyEmail = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { email, code } = req.body;

  try {
    // user checker
    const user = await findOneUserService(
      { email, isDelete: false },
      { password: 0 }
    );
    if (!user) {
      throw new NotFound(res.__("userNotFoundErr"));
    }
    if (user.verified.email.status) {
      throw new BadRequest(res.__("emailAlreadyVerifiedErr"));
    }

    // verify email
    await verifyUserServices({ user, code });

    // send verification confirmation
    await sendEmailService({
      body: {
        heading: "Verification confirmation",
        description: "Your email verified successfully",
      },
      email,
      subject: "email verification confirmation",
      errorMsg: res.__("confirmationEmailSentErr"),
    });

    // save activity log
    await createActivityLog({
      title: `Email verified`,
      ip,
      user: user._id,
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("emailVerifiedSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// forgot password
exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;

  try {
    // user checker
    const user = await findOneUserService(
      { email, isDelete: false },
      { password: 0 }
    );
    if (!user) {
      throw new NotFound(res.__("userNotFoundErr"));
    }

    // sent code limit checker
    if (user.resetPassword && user.resetPassword.length > 10) {
      throw new BadRequest(res.__("codeLimitErr"));
    }

    // store forgot password code to database
    const { code } = await storeForgotPsswordCodeService({ user, ip });

    // send verification confirmation
    await sendEmailService({
      body: {
        heading: "Reset password",
        description: "Use this code to reset your password",
        mainContent: `Code: ${code}`,
      },
      email,
      subject: "forgot password",
      errorMsg: res.__("forgotPasswordEmailSentErr"),
    });

    // save activity log
    await createActivityLog({
      title: `Forgot password`,
      ip,
      user: user._id,
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("sendForgotPassCodeSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// verify forgot password code
exports.verifyForgotPasswordCode = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { email, code } = req.body;

  try {
    // user checker
    const user = await findOneUserService(
      { email, isDelete: false },
      { password: 0 }
    );
    if (!user) {
      throw new NotFound(res.__("userNotFoundErr"));
    }

    // verify code
    await verifyCodeService({ user, code });

    // save activity log
    await createActivityLog({
      title: `Verify reset password code`,
      ip,
      user: user._id,
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("codeVerfiedSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// reset password
exports.resetPassword = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { email, code, password } = req.body;

  try {
    // user checker
    const user = await findOneUserService({ email, isDelete: false });
    if (!user) {
      throw new NotFound(res.__("userNotFoundErr"));
    }

    // reset password
    await passwordResetService({
      user,
      code,
      password,
      msg: res.__("oldPasswordErr"),
    });

    // send verification confirmation
    await sendEmailService({
      body: {
        heading: "Reset password",
        description: "Your password reset successfully",
      },
      email,
      subject: "password reset confirmation",
      errorMsg: res.__("resetPasswordEmailSentErr"),
    });

    // save activity log
    await createActivityLog({
      title: `Password reset`,
      ip,
      user: user._id,
    });

    res
      .status(200)
      .json({ code: 200, status: "success", message: res.__("passResetSucc") });
  } catch (error) {
    next(error, req, res);
  }
};

// change password
exports.changePassword = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { oldPassword, newPassword } = req.body;
  const { email } = req.user;

  try {
    // user checker
    const user = await findOneUserService({ email, isDelete: false });
    if (!user) {
      throw new NotFound(res.__("userNotFoundErr"));
    }

    // change password
    await changePasswordService({
      user,
      oldPassword,
      newPassword,
      oldPasswordMatchedErr: res.__("oldPasswordMatchedErr"),
      oldPasswordMsg: res.__("oldPasswordErr"),
    });

    // send verification confirmation
    await sendEmailService({
      body: {
        heading: "Changed password",
        description: "Your password changed successfully",
      },
      email,
      subject: "password changed confirmation",
      errorMsg: res.__("changePasswordEmailSentErr"),
    });

    // save activity log
    await createActivityLog({
      title: `Password changed`,
      ip,
      user: user._id,
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("changePassSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// soft delete user
exports.softDeleteUser = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // user checker
    const user = await findOneUserService({ _id: id, isDelete: false });
    if (!user) {
      throw new NotFound(res.__("userNotFoundErr"));
    }

    // soft delete user
    await softDeleteOneService({ user, deletedBy: id });

    // save activity log
    await createActivityLog({
      title: `User soft deleted`,
      desc: `User soft deleted by user id ${id}`,
      ip,
      user: _id,
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("userSoftDelSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// hard delete user
exports.hardDeleteUser = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // hard delete user
    const user = await hardDeleteOneService(id);
    if (!user) {
      throw new NotFound(res.__("userNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `User hard deleted`,
      desc: `User hard deleted by user id ${id}`,
      ip,
      user: _id,
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("userHardDelSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// all user
exports.userList = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { q, page, size } = req.query;
  const query = { isDelete: false, _id };
  let options = {
    q: q !== "undefined" && q !== undefined ? q : "",
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
  };

  try {
    const users = await findUsersService(query, options);

    // save activity log
    await createActivityLog({
      title: `User list`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("userListSucc"),
      data: { ...users },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// user detail
exports.userDetail = async (req, res) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { id } = req.params;

  try {
    const user = await findUserDetailService({ _id: id, isDelete: false });

    if (!user) {
      throw NotFound(res.__("userNotFoundErr"));
    }

    await createActivityLog({
      title: `User detail`,
      user: _id,
      ip,
    });

    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("userDetailSucc"),
      data: { user },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// signout
exports.signout = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;

  try {
    await clearRefreshToken(_id);

    await createActivityLog({
      title: `Signout`,
      ip,
      user: _id,
    });

    res.clearCookie("accessToken", {
      secure: env === "prod",
    });
    res.clearCookie("refreshToken", {
      secure: env === "prod",
    });
    res
      .status(200)
      .json({ code: 200, status: "success", message: res.__("signoutSucc") });
  } catch (error) {
    next(error, req, res);
  }
};
