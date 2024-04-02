// lib
const {
  Types: { ObjectId },
} = require("mongoose");
const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");

// custom module
const { File } = require("../models");
const { s3Client, Bucket } = require("../init");
const { generateCode } = require("../utils/generateCode");

// generate key
const generateKey = ({ type, ext, courseId }) => {
  let key = `${generateCode(12)}_${Date.now()}${ext}`;

  if (courseId) {
    let keyFolder = `courses/${courseId}/`;

    if (type == 2) {
      key = keyFolder + "thumbnails/" + key;
    } else if (type == 3) {
      key = keyFolder + "videos/" + key;
    } else if (type == 4) {
      key = keyFolder + "documents/" + key;
    } else if (type == 5) {
      key = keyFolder + "AssignemntFiles/" + key;
    } else if (type == 6) {
      key = keyFolder + "AssignemntVideos/" + key;
    } else if (type == 7) {
      key = keyFolder + "subtitles/" + key;
    }
  } else {
    if (type == 1) {
      key = "avatars/" + key;
    } else if (type == 2) {
      key = "thumbnails/" + key;
    } else if (type == 3) {
      key = "videos/" + key;
    } else if (type == 4) {
      key = "documents/" + key;
    } else if (type == 5) {
      key = "AssignemntFiles/" + key;
    } else if (type == 6) {
      key = "AssignemntVideos/" + key;
    } else if (type == 7) {
      key = "subtitles/" + key;
    }
  }

  return key;
};

// find single document
exports.findOneFileService = async (keyValues, options = {}) => {
  const file = await File.findOne(keyValues, options);
  return file;
};

// upload file
exports.uploadFileToS3Service = async ({
  buffer,
  mimetype,
  ext,
  type,
  courseId,
}) => {
  const Key = generateKey({ type, ext, courseId, type });

  const params = {
    Bucket,
    Body: buffer,
    Key,
    ContentType: mimetype,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);
  return Key;
};

// new file
exports.newFileService = async ({
  buffer,
  path,
  size,
  name,
  type,
  mimetype,
  _id,
}) => {
  let fileBody = {
    path,
    name,
    size,
    type,
    mimetype,
    updatedBy: _id,
  };

  // calculate video length
  if (type == 3) {
    const header = Buffer.from("mvhd");
    const start = buffer.indexOf(header) + 17;
    const timeScale = buffer.readUInt32BE(start);
    const duration = buffer.readUInt32BE(start + 4);

    const timeLength = Math.floor((duration / timeScale) * 1000) / 1000;

    fileBody = { ...fileBody, timeLength };
  }

  const newFile = new File(fileBody);
  await newFile.save();

  newFile.isDelete = undefined;
  newFile.__v = undefined;

  return newFile;
};

// delete file from s3
exports.removeFileFromS3Service = async (Key) => {
  const params = {
    Bucket,
    Key,
  };

  const command = new DeleteObjectCommand(params);
  await s3Client.send(command);
};

// soft delete file
exports.deleteFileService = async ({ file, _id }) => {
  file.isDelete = true;
  file.deletedAt = new Date().getTime();
  file.deletedBy = _id;

  // save file
  await file.save();
};

// file list
exports.findFilesService = async (
  keyValues = {},
  { q, page, size, type, _id, role }
) => {
  const skip = (page - 1) * size;
  let regex = new RegExp(q, "i");

  let query = {
    ...keyValues,
    $or: [{ name: regex }],
  };

  if (type) {
    query = { ...query, type: parseInt(type) };
  }

  if (role === 2) {
    query = { ...query, updatedBy: new ObjectId(_id) };
  }

  let project = {
    name: 1,
    type: 1,
    timeLength: 1,
    path: 1,
    size: 1,
    mimetype: 1,
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await File.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
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

  const { metadata, data: files } = result[0];
  if (files.length === 0) {
    return {
      files: [],
      totalItem: 0,
      totalPage: 0,
    };
  }
  const { totalItem } = metadata[0];
  return {
    files,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// detail file
exports.findFileService = async (keyValues = {}, { role, _id }) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  if (role === 2) {
    query = { ...query, updatedBy: new ObjectId(_id) };
  }

  let project = {
    name: 1,
    type: 1,
    timeLength: 1,
    path: 1,
    size: 1,
    mimetype: 1,
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await File.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "users",
        localField: "updatedBy",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
    },
    { $project: project },
  ]);

  const file = result.length > 0 ? result[0] : null;
  return file;
};
