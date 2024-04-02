// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { Profile, User } = require("../models");

// find single document
exports.findOneProfileService = async (keyValues, options = {}) => {
  const profile = await Profile.findOne(keyValues, options);
  return profile;
};

// create new profile
exports.newProfileService = async () => {
  const newProfile = new Profile();
  await newProfile.save();

  newProfile.isDelete = undefined;
  newProfile.__v = undefined;

  return newProfile;
};

// update profile
exports.updateProfileService = async ({
  profile,
  title,
  bio,
  website,
  linkedIn,
  facebook,
  youtube,
  twitter,
  name,
  avatarId,
  user,
}) => {
  profile.title = title;
  profile.bio = bio;
  profile.website = website;
  profile.linkedIn = linkedIn;
  profile.facebook = facebook;
  profile.youtube = youtube;
  profile.twitter = twitter;

  if (name) {
    user.name = name;
  }

  if (avatarId) {
    user.avatarId = avatarId;
  }

  // save profile
  await profile.save();
  await user.save();

  return profile;
};

// detail profile
exports.findProfileService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  let project = {
    name: 1,
    email: 1,
    role: 1,
    profileId: 1,
    profile: 1,
    avatarId: 1,
    avatar: 1,
    lastLogin: 1,
    createdAt: 1,
    updatedAt: 1,
  };

  const result = await User.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "profiles",
        localField: "profileId",
        foreignField: "_id",
        as: "profile",
      },
    },
    {
      $unwind: { path: "$profile", preserveNullAndEmptyArrays: true },
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
      $project: project,
    },
  ]);

  const Profile = result.length > 0 ? result[0] : null;
  return Profile;
};
