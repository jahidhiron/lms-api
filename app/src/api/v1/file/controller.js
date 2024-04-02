// core lib
const path = require("path");

// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { BadRequest, NotFound } = require("../utils/errors");
const {
  uploadFileToS3Service,
  newFileService,
  findOneFileService,
  removeFileFromS3Service,
  deleteFileService,
  findFilesService,
  findFileService,
} = require("./service");
const { validateExtension } = require("./validator");

// upload file
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { file } = req;
  const { type, courseId } = req.body;

  try {
    if (!file) {
      throw new BadRequest(req.__("fileNotSelectedErr"));
    }

    // validate file extension
    const ext = path.extname(file.originalname);
    const isValidExt = validateExtension(ext);

    if (!isValidExt) {
      throw new BadRequest(req.__("fileExtErr"));
    }

    // upload file to s3
    const key = await uploadFileToS3Service({ ...file, ext, courseId, type });

    // create new file
    const newFile = await newFileService({
      ...file,
      name: file.originalname,
      path: key,
      type,
      _id,
    });

    // save activity log
    await createActivityLog({
      title: `Upload file`,
      desc: `${newFile._id} file id is uploaded`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("uploadFileSucc"),
      data: { file: newFile },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove file
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find file
    const file = await findOneFileService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!file) {
      throw new NotFound(req.__("fileNotFoundErr"));
    }

    // remove file from s3
    await removeFileFromS3Service(file.path);

    // soft delete file
    await deleteFileService({ file, _id });

    // save activity log
    await createActivityLog({
      title: `Delete file`,
      desc: `${file._id} file id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("deleteFileSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list files
exports.files = async (req, res, next) => {
  const { _id, role } = req.user;
  const { q, page, size, type } = req.query;
  const query = { isDelete: false };
  let options = {
    q: q !== "undefined" && q !== undefined ? q : "",
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
    type,
    _id,
    role,
  };

  try {
    // list
    const files = await findFilesService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("fileListSucc"),
      data: { ...files },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// file detail
exports.file = async (req, res, next) => {
  const { _id, role } = req.user;
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };
  const options = { _id, role };

  try {
    // list
    const file = await findFileService(keyValues, options);
    if (!file) {
      throw new NotFound(req.__("fileNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("fileDetailSucc"),
      data: { file },
    });
  } catch (error) {
    next(error, req, res);
  }
};
