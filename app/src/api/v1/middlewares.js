// pre-defined module
const { validationResult } = require("express-validator");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie");

// custom module
const { GeneralError } = require("./utils/errors");
const { generateCode } = require("./utils/generateCode");
const { env, jwtSecret } = require("../../config");
const { verifyAccessToken } = require("./utils/jwtHelper");

// process every request
exports.processRequest = async (req, res, next) => {
  let correlationId = req.headers["x-correlation-id"];
  if (!correlationId) {
    correlationId = `${Date.now().toString()}_${generateCode(8)}`;
    req.headers["x-correlation-id"] = correlationId;
  }

  res.set("x-correlation-id", correlationId);

  return next();
};

// catch error
exports.handleError = (error, req, res, _next) => {
  let code = 500;
  let name = "InternalServerError";
  if (error instanceof GeneralError) {
    code = error.getCode();
    name = error.name;
  }

  if (code === 500) {
    // send email to developer adminstration
  }

  let correlationId = req.headers["x-correlation-id"];
  return res.status(code).json({
    correlationId: correlationId,
    name,
    message: error.message,
    code,
    status: "failed",
    stack: env === "prod" ? null : error.stack,
  });
};

// not found
exports.notFound = (_req, res) => {
  return res.status(404).json({
    code: 404,
    status: "failed",
    name: "apiNotFound",
    message: res.__("apiNotFoundErr"),
  });
};

// catch validation error
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  const mappedErrors = {};

  if (Object.keys(errors.errors).length === 0) {
    next();
  } else {
    errors.errors.map((e) => {
      mappedErrors[e.param] = e.msg;
    });
    return res.status(422).json(mappedErrors);
  }
};

// auth gaurd
exports.isAuthenticated = async (req, res, next) => {
  try {
    const { tokenExpired } = await verifyAccessToken(req, res);
    if (tokenExpired) {
      return res.status(401).json({
        code: 401,
        status: "failed",
        name: "tokenExpired",
        message: res.__("tokenExpireErr"),
      });
    }
    next();
  } catch (error) {
    return next(error, req, res);
  }
};

// is instructor
exports.isInstructor = async (req, res, next) => {
  if (req && req.user && (req.user.role === 1 || req.user.role === 2)) {
    next();
  } else {
    return res.status(403).json({
      code: 403,
      status: "failed",
      name: "permissionDenied",
      message: res.__("permissionDeniedErr"),
    });
  }
};

// is instructor
exports.isStudent = async (req, res, next) => {
  if (req && req.user && (req.user.role === 1 || req.user.role === 3)) {
    next();
  } else {
    return res.status(403).json({
      code: 403,
      status: "failed",
      name: "permissionDenied",
      message: res.__("permissionDeniedErr"),
    });
  }
};

// is admin
exports.isAdmin = async (req, res, next) => {
  if (req && req.user && req.user.role === 1) {
    next();
  } else {
    return res.status(403).json({
      code: 403,
      status: "failed",
      name: "permissionDenied",
      message: res.__("permissionDeniedErr"),
    });
  }
};

exports.socketAuth = (socket, next) => {
  const cookie = socket.handshake.headers["cookie"];
  var ip =
    socket.request.headers["x-forwarded-for"] ||
    socket.request.connection.remoteAddress;
  const token =
    Boolean(cookie) &&
    cookieParser.parse(cookie) &&
    cookieParser.parse(cookie).token;

  try {
    if (Boolean(token)) {
      jwt.verify(token, jwtSecret, async (error, user) => {
        if (error) {
          return next("Unauthorized");
        } else {
          socket.user = { ...user, ip };
          next();
        }
      });
    } else {
      return next("Unauthorized");
    }
  } catch (error) {
    return next("Internal server error");
  }
};

// upload
exports.upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 50 },
});
