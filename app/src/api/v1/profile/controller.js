// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { NotFound } = require("../utils/errors");
const {
  findOneProfileService,
  updateProfileService,
  findProfileService,
} = require("./service");
const { findOneUserService } = require("../auth/service");

// update profile
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;

  try {
    const user = await findOneUserService({ _id, isDelete: false });
    if (!user) {
      throw new NotFound(req.__("userNotFoundErr"));
    }

    // find profile
    const profile = await findOneProfileService(
      {
        _id: user.profileId,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!profile) {
      throw new NotFound(req.__("profileNotFoundErr"));
    }

    // update profile
    const updatedProfile = await updateProfileService({
      ...req.body,
      _id,
      profile,
      user,
    });

    // save activity log
    await createActivityLog({
      title: `Update profile`,
      desc: `${profile._id} profile id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("profileUpdatedSucc"),
      data: { profile: updatedProfile },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// profile detail
exports.profile = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const keyValues = { isDelete: false, _id };

  try {
    // list
    const userProfile = await findProfileService(keyValues);
    if (!userProfile) {
      throw new NotFound(req.__("profileNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `Detail profile`,
      desc: `Get detail profile by "${userProfile._id}" id `,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("profileDetailSucc"),
      data: { userProfile },
    });
  } catch (error) {
    next(error, req, res);
  }
};
