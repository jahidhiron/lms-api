// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { NotFound } = require("../utils/errors");
const {
  newNotetService,
  findOneNoteService,
  updateNoteService,
  deleteNoteService,
  findNotesService,
  findNoteService,
} = require("./service");
const { findOneCourseService } = require("../course/service");
const { findOneLectureService } = require("../lecture/service");

// add note
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { title, lectureId } = req.body;
  const { _id } = req.user;

  try {
    // lecture checking
    const isLectureExist = await findOneLectureService({
      _id: lectureId,
      isDelete: false,
    });
    if (!isLectureExist) {
      throw new NotFound(res.__("lectureNotFoundErr"));
    }

    // add note
    const note = await newNotetService({ body: req.body, _id });

    // save activity log
    await createActivityLog({
      title: `Add note`,
      desc: `Note by "${title}" title is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("noteAddSucc"),
      data: { note },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update note
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;
  const { lectureId } = req.body;

  try {
    // find note
    const note = await findOneNoteService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!note) {
      throw new NotFound(req.__("noteNotFoundErr"));
    }

    const isLectureExist = await findOneLectureService({
      _id: lectureId,
      isDelete: false,
    });
    if (!isLectureExist) {
      throw new NotFound(res.__("lectureNotFoundErr"));
    }

    // update note
    const updatedNote = await updateNoteService({
      ...req.body,
      _id,
      note,
    });

    // save activity log
    await createActivityLog({
      title: `Update note`,
      desc: `${note._id} note id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("noteUpdatedSucc"),
      data: { note: updatedNote },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove note
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find note
    const note = await findOneNoteService(
      {
        _id: id,
        updatedBy: _id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!note) {
      throw new NotFound(req.__("noteNotFoundErr"));
    }

    // soft delete note
    await deleteNoteService({ note, _id });

    // save activity log
    await createActivityLog({
      title: `Delete note`,
      desc: `${note._id} note id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("noteDeletedSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list note
exports.notes = async (req, res, next) => {
  const { page, size, lectureId } = req.query;
  const query = { isDelete: false };
  let options = {
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
    lectureId,
  };

  try {
    // list
    const notes = await findNotesService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("notesListSucc"),
      data: { ...notes },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// note detail
exports.note = async (req, res, next) => {
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const note = await findNoteService(keyValues);
    if (!note) {
      throw new NotFound(req.__("noteNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("noteDetailSucc"),
      data: { note },
    });
  } catch (error) {
    next(error, req, res);
  }
};
