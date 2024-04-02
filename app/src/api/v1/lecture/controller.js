// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { BadRequest, NotFound } = require("../utils/errors");
const {
  findOneLectureService,
  newLectureService,
  updateLectureService,
  deleteLectureService,
  findLecturesService,
  findLectureService,
} = require("./service");
const { findOneFileService } = require("../file/service");

// add lecture
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { title, videoId, resources, cations } = req.body;
  const { _id } = req.user;

  try {
    if (videoId) {
      const isFileExist = await findOneFileService({
        _id: videoId,
        isDelete: false,
      });
      if (!isFileExist) {
        throw new NotFound("Video file not found");
      }
    }

    if (resources) {
      let index = 0;
      for await (let resource of resources) {
        if (resource && resource.fileId) {
          const isFileExist = await findOneFileService({
            _id: resource.fileId,
            isDelete: false,
          });
          if (!isFileExist) {
            throw new NotFound(`Index ${index} resources file not found`);
          }
        }
        index++;
      }
    }

    if (cations) {
      let index = 0;
      for await (let caption of cations) {
        if (caption && caption.fileId) {
          const isFileExist = await findOneFileService({
            _id: caption.fileId,
            isDelete: false,
          });
          if (!isFileExist) {
            throw new NotFound(`Index ${index} captions file not found`);
          }
        }
        index++;
      }
    }

    // add lecture
    const lecture = await newLectureService({ body: req.body, _id });

    // save activity log
    await createActivityLog({
      title: `Add lecture`,
      desc: `Lecture by "${title}" title is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("lectureAddSucc"),
      data: { lecture },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update lecture
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { videoId, resources, cations } = req.body;
  const { _id, role } = req.user;

  try {
    // find lecture
    const lecture = await findOneLectureService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!lecture) {
      throw new NotFound(req.__("lectureNotFoundErr"));
    }

    if (videoId) {
      const isFileExist = await findOneFileService({
        _id: videoId,
        isDelete: false,
      });
      if (!isFileExist) {
        throw new NotFound("Video file not found");
      }
    }

    if (resources) {
      let index = 0;
      for await (let resource of resources) {
        if (resource && resource.fileId) {
          const isFileExist = await findOneFileService({
            _id: resource.fileId,
            isDelete: false,
          });
          if (!isFileExist) {
            throw new NotFound(`Index ${index} resources file not found`);
          }
        }
        index++;
      }
    }

    if (cations) {
      let index = 0;
      for await (let caption of cations) {
        if (caption && caption.fileId) {
          const isFileExist = await findOneFileService({
            _id: caption.fileId,
            isDelete: false,
          });
          if (!isFileExist) {
            throw new NotFound(`Index ${index} captions file not found`);
          }
        }
        index++;
      }
    }

    // update lecture
    const updatedLecture = await updateLectureService({
      ...req.body,
      _id,
      role,
      lecture,
    });

    // save activity log
    await createActivityLog({
      title: `Update lecture`,
      desc: `${lecture._id} lecture id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("lectureUpdateSucc"),
      data: { lecture: updatedLecture },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove lecture
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find lecture
    const lecture = await findOneLectureService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!lecture) {
      throw new NotFound(req.__("lectureNotFoundErr"));
    }

    // soft delete lecture
    await deleteLectureService({ lecture, _id });

    // save activity log
    await createActivityLog({
      title: `Delete lecture`,
      desc: `${lecture._id} lecture id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("lectureDeleteSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list lecture
exports.lectures = async (req, res, next) => {
  const { _id, role } = req.user;
  const { q, page, size } = req.query;
  const query = { isDelete: false };
  let options = {
    q: q !== "undefined" && q !== undefined ? q : "",
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
    role,
    _id,
  };

  try {
    // list
    const lectures = await findLecturesService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("lectureListSucc"),
      data: { ...lectures },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// lecture detail by slug
exports.lecure = async (req, res, next) => {
  const { _id, role } = req.user;
  const { id } = req.params;
  const keyValues = { isDelete: false };
  const options = { role, _id, id };

  try {
    // list
    const lecture = await findLectureService(keyValues, options);
    if (!lecture) {
      throw new NotFound(req.__("lectureNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("lectureDetailSucc"),
      data: { lecture },
    });
  } catch (error) {
    next(error, req, res);
  }
};
