// custom
const { createActivityLog } = require('../utils/createActivityLog');
const { NotFound } = require('../utils/errors');
const {
  findOneEnrollmentService,
  completeLectureService,
  deleteEnrollmentService,
  findEnrollmentsService,
  findEnrollmentService,
  newEnrollmentService,
} = require('./service');
const { findOneLectureService } = require('../lecture/service');

// new enrollment
exports.add = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const { courseId } = req.body;
  const { _id } = req.user;

  try {
    // find enrollment
    const enrollment = await findOneEnrollmentService(
      {
        courseId,
        updatedBy: _id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (enrollment) {
      throw new NotFound(req.__('enrollmentExistErr'));
    }

    const newEnrollment = await newEnrollmentService({
      body: { courseId },
      _id,
    });
    // save activity log
    await createActivityLog({
      title: `New enrollment`,
      desc: `${newEnrollment._id} enrollment id is created`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: 'success',
      message: req.__('enrollmentAddSucc'),
      data: { enrollment: newEnrollment },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// complete lecture
exports.completeLecture = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { lectureId } = req.body;
  const { _id, role } = req.user;

  try {
    // find enrollment
    const enrollment = await findOneEnrollmentService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!enrollment) {
      throw new NotFound(req.__('enrollmentNotFoundErr'));
    }

    // find lecture
    const lecture = await findOneLectureService({
      _id: lectureId,
      isDelete: false,
    });
    if (!lecture) {
      throw new NotFound(req.__('lectureNotFoundErr'));
    }

    // update enrollment
    const updatedEnrollment = await completeLectureService({
      enrollment,
      lectureId,
      role,
      _id,
    });

    // save activity log
    await createActivityLog({
      title: `Update enrollment`,
      desc: `${enrollment._id} enrollment id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: 'success',
      message: req.__('enrollmentUpdateSucc'),
      data: { enrollment: updatedEnrollment },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove enrollment
exports.remove = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find enrollment
    const enrollment = await findOneEnrollmentService({
      _id: id,
      isDelete: false,
    });
    if (!enrollment) {
      throw new NotFound(req.__('enrollmentNotFoundErr'));
    }

    // soft delete enrollment
    await deleteEnrollmentService({ enrollment, _id });

    // save activity log
    await createActivityLog({
      title: `Delete enrollment`,
      desc: `${enrollment._id} enrollment id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: 'success',
      message: req.__('enrollmentDeleteSucc'),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list enrollment
exports.enrollments = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { q, page, size } = req.query;
  const query = {};
  let options = {
    q: q !== 'undefined' && q !== undefined ? q : '',
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
    _id,
  };

  try {
    // list
    const enrollments = await findEnrollmentsService(query, options);

    // save activity log
    await createActivityLog({
      title: `List enrollment`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: 'success',
      message: res.__('enrollmentListSucc'),
      data: { ...enrollments },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// enrollment detail
exports.enrollment = async (req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const enrollment = await findEnrollmentService(keyValues);
    if (!enrollment) {
      throw new NotFound(req.__('enrollmentNotFoundErr'));
    }

    // save activity log
    await createActivityLog({
      title: `Detail enrollment`,
      desc: `Get detail enrollment by "${enrollment._id}" id `,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: 'success',
      message: res.__('enrollmentDetailSucc'),
      data: { enrollment },
    });
  } catch (error) {
    next(error, req, res);
  }
};
