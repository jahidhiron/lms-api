// pre-defined module
const jwt = require("jsonwebtoken");

// custom module
const {
  redis: { getRedis, setRedis, deleteRedis },
} = require("../init");
const {
  jwtAccessTokenSecret,
  jwtRefreshTokenSecret,
  jwtAccessTokenExpiredIn,
  jwtRefreshTokenExpiredIn,
  appAddress: issuer,
  redisBacklistExpiredIn,
} = require("../../../config");
const { InternalServerError, Unauthorized, Forbidden } = require("./errors");
const { env } = require("../../../config");

// generate access token
const generateAccessToken = (user, { genTokenErr }) => {
  return new Promise((resolve, reject) => {
    const id = user.aud || String(user._id);
    const payload = {
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const options = {
      expiresIn: jwtAccessTokenExpiredIn,
      issuer,
      audience: id,
    };

    jwt.sign(payload, jwtAccessTokenSecret, options, (error, token) => {
      if (error) {
        return reject(new InternalServerError(genTokenErr));
      }
      resolve(token);
    });
  });
};

// generate refresh token
const generateRefreshToken = (user, { genTokenErr, redisBacklistErr }) => {
  return new Promise((resolve, reject) => {
    const id = user.aud || String(user._id);
    const payload = {
      name: user.name,
      email: user.email,
      role: user.role,
    };
    const options = {
      expiresIn: jwtRefreshTokenExpiredIn,
      issuer,
      audience: id,
    };

    jwt.sign(payload, jwtRefreshTokenSecret, options, async (error, token) => {
      if (error) {
        return reject(new InternalServerError(genTokenErr));
      }

      try {
        await setRedis(id, token, "EX", parseInt(redisBacklistExpiredIn));
        resolve(token);
      } catch (error) {
        return reject(new InternalServerError(redisBacklistErr));
      }
    });
  });
};

// verify refresh token
const verifyRefreshToken = (req, res) => {
  return new Promise((resolve, reject) => {
    const refreshToken = req.cookies["refreshToken"];

    jwt.verify(refreshToken, jwtRefreshTokenSecret, async (error, user) => {
      if (error) {
        if (error.name === "TokenExpiredError") {
          res.clearCookie("accessToken", {
            secure: env === "prod",
          });
          res.clearCookie("refreshToken", {
            secure: env === "prod",
          });
          return reject(new Forbidden(res.__("forbiddenErr")));
        } else {
          const message =
            error.name === "JsonWebTokenError"
              ? res.__("unAuthError")
              : error.message;
          return reject(new Unauthorized(message));
        }
      }

      try {
        const id = user.aud || String(user._id);
        const token = await getRedis(id);
        if (refreshToken !== token) {
          return reject(new Unauthorized(res.__("unAuthError")));
        }
        resolve(user);
      } catch (error) {
        return reject(
          new InternalServerError(res.__("redisGetRefreshTokenErr"))
        );
      }
    });
  });
};

// verify access token
const verifyAccessToken = (req, res) => {
  return new Promise((resolve, reject) => {
    const accessToken = req.cookies["accessToken"];
    const refreshToken = req.cookies["refreshToken"];
    req.user = {};

    jwt.verify(accessToken, jwtAccessTokenSecret, async (error, user) => {
      if (error) {
        console.log(error.name);
        if (error.name === "TokenExpiredError") {
          res.clearCookie("accessToken", {
            secure: env === "prod",
          });
          return resolve({ tokenExpired: true });
        } else {
          const message =
            error.name === "JsonWebTokenError"
              ? res.__("unAuthError")
              : error.message;
          return reject(new Unauthorized(message));
        }
      }

      try {
        const id = user.aud || String(user._id);
        const token = await getRedis(id);
        if (refreshToken !== token) {
          return reject(new Unauthorized(res.__("unAuthError")));
        }
      } catch (error) {
        return reject(
          new InternalServerError(res.__("redisGetRefreshTokenErr"))
        );
      }

      req.user._id = user.aud;
      req.user.name = user.name;
      req.user.email = user.email;
      req.user.role = user.role;
      resolve({ tokenExpired: false });
    });
  });
};

// clear jwt token from redis
const clearRefreshToken = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      await deleteRedis(id);
      resolve(true);
    } catch (error) {
      return reject(new InternalServerError(res.__("redisGetRefreshTokenErr")));
    }
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  clearRefreshToken,
};
