// custom module
const { User } = require("../models");
const { generateCode } = require("../utils/generateCode");
const { hashPassword, comparePassword } = require("../utils/bcryptHelper");
const { minutesToExpire } = require("../../../config");
const { BadRequest } = require("../utils/errors");
const {
  Types: { ObjectId },
} = require("mongoose");

// start services utilities
// ------------------------------------

// generate signle verify code item
const generateVerifyCodeItem = (ip) => {
  const code = generateCode(6);
  const createdAt = new Date().getTime();
  const expireAt = new Date(createdAt + minutesToExpire * 60000);
  const verifyCodeItem = {
    code,
    ip,
    createdAt,
    expireAt,
  };
  return { verifyCodeItem, code };
};

// check single verify code item
const checkFlag = ({ item, code, currentTime, used }) => {
  let flag = null;
  const expiredTime = new Date(item.expireAt).getTime();

  if (used) {
    if (item.code === code && item.used && currentTime < expiredTime) {
      item.resetAt = currentTime;
      flag = "verified";
    } else if (item.code === code && item.used && currentTime < expiredTime) {
      flag = "used";
    } else if (item.code === code && currentTime > expiredTime) {
      flag = "expired";
    }
  } else {
    if (item.code === code && !item.used && currentTime < expiredTime) {
      if (!item.used) {
        item.used = true;
      }
      item.verifiedAt = currentTime;
      flag = "verified";
    } else if (item.code === code && item.used && currentTime < expiredTime) {
      flag = "used";
    } else if (item.code === code && currentTime > expiredTime) {
      flag = "expired";
    }
  }

  return flag;
};

// check verify code
const checkVerifyCode = ({ items, currentTime, code, used = false }) => {
  let flag = null;

  for (let item of items) {
    flag = checkFlag({ item, code, currentTime, used });
    if (flag) break;
  }

  if (flag === "used") {
    throw new BadRequest("Code already used");
  } else if (flag === "expired") {
    throw new BadRequest("Time expired");
  } else if (!flag) {
    throw new BadRequest("Invalid code");
  }

  return;
};

// ------------------------------------
// end services utilities

// find single document
exports.findOneUserService = async (keyValues, options = {}) => {
  const user = await User.findOne(keyValues, options);
  return user;
};

exports.findUserDetailService = async (keyValues) => {
  if (keyValues["_id"]) {
    keyValues = { ...keyValues, _id: new ObjectId(keyValues["_id"]) };
  }
  const result = await User.aggregate([
    {
      $match: keyValues,
    },
    {
      $lookup: {
        from: "files",
        localField: "avatarId",
        foreignField: "_id",
        as: "avatar",
      },
    },
    {
      $unwind: { path: "$avatar", preserveNullAndEmptyArrays: true },
    },
    {
      $project: {
        name: 1,
        email: 1,
        verified: "$verified.email.status",
        role: 1,
        createdAt: 1,
        updatedAt: 1,
        lastLogin: 1,
        profileId: 1,
        avatarId: 1,
        avatar: 1,
      },
    },
  ]);

  const user = result.length > 0 ? result[0] : null;
  return user;
};

// find document list
exports.findUsersService = async (keyValues = {}, { q, page, size }) => {
  let regex = new RegExp(q, "i");
  const skip = (page - 1) * size;

  let query = {
    ...keyValues,
    _id: { $ne: new ObjectId(keyValues["_id"]) },
    $or: [{ name: regex }, { email: regex }],
  };

  let project = {
    name: 1,
    email: 1,
    createdAt: 1,
    updatedAt: 1,
    lastLogin: 1,
    verifiedStatus: "$verified.email.status",
  };

  const result = await User.aggregate([
    {
      $match: query,
    },
    { $project: project },
    { $sort: { _id: -1 } },
    {
      $facet: {
        metadata: [{ $count: "totalItem" }, { $addFields: { page } }],
        data: [{ $skip: skip }, { $limit: size }],
      },
    },
  ]);

  const { metadata, data: users } = result[0];
  if (users.length === 0) {
    return {
      users: [],
      totalItem: 0,
      totalPage: 0,
    };
  }
  const { totalItem } = metadata[0];
  return {
    users,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// user last login
exports.lastLoginService = async (user) => {
  user.lastLogin = new Date().getTime();
  await user.save();
};

// create new user
exports.newUserService = async ({ password, ip, body }) => {
  const hashedPassword = await hashPassword(password);

  const { verifyCodeItem, code } = generateVerifyCodeItem(ip);
  const verified = {
    email: {
      verifyCode: [verifyCodeItem],
    },
  };

  const newUser = new User({
    ...body,
    verified,
    password: hashedPassword,
  });

  await newUser.save();

  newUser.password = undefined;
  newUser.resetPassword = undefined;
  newUser.isDelete = undefined;
  newUser.__v = undefined;

  return { user: newUser, code };
};

// store email verify code item to database
exports.storeVerifyEmailCodeService = async ({ user, ip }) => {
  const { verifyCodeItem, code } = generateVerifyCodeItem(ip);

  user.verified.email.verifyCode.push(verifyCodeItem);
  await user.save();
  user.verified = undefined;

  return { user, code };
};

// store forgot password verify code item to database
exports.storeForgotPsswordCodeService = async ({ user, ip }) => {
  const { verifyCodeItem, code } = generateVerifyCodeItem(ip);

  user.resetPassword.email.verifyCode.push(verifyCodeItem);
  await user.save();
  user.resetPassword = undefined;

  return { user, code };
};

// user verification
exports.verifyUserServices = async ({ user, code }) => {
  const { email } = user.verified;
  const currentTime = new Date().getTime();

  if (email.verifyCode) {
    const { verifyCode } = email;
    checkVerifyCode({ items: verifyCode, currentTime, code });

    user.verified.email.status = true;
    user.verified.email.verifiedAt = currentTime;
    await user.save();
    return;
  }

  throw new BadRequest();
};

// send user verification code
exports.verifyCodeService = async ({ user, code }) => {
  const { email } = user.resetPassword;
  const currentTime = new Date().getTime();

  if (email.verifyCode) {
    const { verifyCode } = email;
    checkVerifyCode({
      items: verifyCode,
      currentTime,
      code,
    });

    await user.save();
    return;
  }

  throw new BadRequest();
};

// reset password
exports.passwordResetService = async ({ user, code, password, msg }) => {
  const { email } = user.resetPassword;
  const currentTime = new Date().getTime();

  if (email.verifyCode) {
    const { verifyCode } = email;
    checkVerifyCode({
      items: verifyCode,
      currentTime,
      code,
      used: true,
    });

    const match = await comparePassword(password, user.password);
    if (match) {
      throw new BadRequest(msg);
    }

    const hashedPassword = await hashPassword(password);
    user.password = hashedPassword;
    await user.save();
    return;
  }

  throw new BadRequest();
};

// change password
exports.changePasswordService = async ({
  user,
  oldPassword,
  newPassword,
  oldPasswordMatchedErr,
  oldPasswordMsg,
}) => {
  const oldMatch = await comparePassword(oldPassword, user.password);
  if (!oldMatch) {
    throw new BadRequest(oldPasswordMatchedErr);
  }

  const newMatch = await comparePassword(newPassword, user.password);
  if (newMatch) {
    throw new BadRequest(oldPasswordMsg);
  }

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;
  await user.save();

  return;
};

// user soft delete
exports.softDeleteOneService = async ({ user, deletedBy }) => {
  user.isDelete = true;
  user.deletedAt = new Date().getTime();
  user.deletedBy = deletedBy;
  await user.save();
  return;
};

// user hard delete
exports.hardDeleteOneService = async (id) => {
  const user = await User.findByIdAndDelete(id);
  return user;
};
