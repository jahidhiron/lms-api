// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { BadRequest, NotFound } = require("../utils/errors");
const {
  findOneCourseService,
  newCourseService,
  updateCourseService,
  deleteCourseService,
  findCoursesService,
  findCourseService,
  findPublicCourseService,
  findPublicCoursesService,
} = require("./service");
const { findOneCategoryService } = require("../category/service");
const { findOneSubCategoryService } = require("../subCategory/service");
const { findOneFileService } = require("../file/service");

// add course
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { title, categoryId, subCategoryId } = req.body;
  const { _id } = req.user;

  try {
    // title checker
    const isCourseExist = await findOneCourseService({
      title,
      isDelete: false,
      updatedBy: _id,
    });
    if (isCourseExist) {
      throw new BadRequest(req.__("courseExistErr"));
    }

    if (categoryId) {
      const isCategoryExist = await findOneCategoryService({
        _id: categoryId,
        isDelete: false,
      });
      if (!isCategoryExist) {
        throw new NotFound(req.__("categoryNotFoundErr"));
      }
    }

    if (subCategoryId) {
      const isSubCategoryExist = await findOneSubCategoryService({
        _id: subCategoryId,
        isDelete: false,
      });
      if (!isSubCategoryExist) {
        throw new NotFound(req.__("subCategoryNotFoundErr"));
      }
    }

    // add course
    const course = await newCourseService({ body: req.body, _id });

    // save activity log
    await createActivityLog({
      title: `Add course`,
      desc: `Course by "${title}" title is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("courseAddSucc"),
      data: { course },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update course
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { title, categoryId, subCategoryId, thumbnailId, promotionalVideoId } =
    req.body;
  const { _id, role } = req.user;

  try {
    // find course
    const course = await findOneCourseService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );

    if (!course) {
      throw new NotFound(req.__("courseNotFoundErr"));
    }

    // title checking
    const isTitleExist = await findOneCourseService({
      title,
      isDelete: false,
    });
    if (
      isTitleExist &&
      title === isTitleExist.title &&
      String(course._id) !== String(isTitleExist._id)
    ) {
      throw new BadRequest(req.__("courseExistErr"));
    }

    if (categoryId) {
      const isCategoryExist = await findOneCategoryService({
        _id: categoryId,
        isDelete: false,
      });
      if (!isCategoryExist) {
        throw new NotFound(req.__("categoryNotFoundErr"));
      }
    }

    if (subCategoryId) {
      const isSubCategoryExist = await findOneSubCategoryService({
        _id: subCategoryId,
        isDelete: false,
      });
      if (!isSubCategoryExist) {
        throw new NotFound(req.__("subCategoryNotFoundErr"));
      }
    }

    if (thumbnailId) {
      const isFileExist = await findOneFileService({
        _id: thumbnailId,
        isDelete: false,
      });
      if (!isFileExist) {
        throw new NotFound(req.__("fileNotFoundErr"));
      }
    }

    if (promotionalVideoId) {
      const isFileExist = await findOneFileService({
        _id: promotionalVideoId,
        isDelete: false,
      });
      if (!isFileExist) {
        throw new NotFound(req.__("fileNotFoundErr"));
      }
    }

    // update course
    const updatedCourse = await updateCourseService({
      ...req.body,
      _id,
      course,
      role,
    });

    // save activity log
    await createActivityLog({
      title: `Update course`,
      desc: `${course._id} course id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("courseUpdateSucc"),
      data: { course: updatedCourse },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove course
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find course
    const course = await findOneCourseService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!course) {
      throw new NotFound(req.__("courseNotFoundErr"));
    }

    // soft delete course
    await deleteCourseService({ course, _id });

    // save activity log
    await createActivityLog({
      title: `Delete course`,
      desc: `${course._id} course id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("courseDeleteSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list course
exports.courses = async (req, res, next) => {
  const { _id, role } = req.user;
  const { q, page, size, categoryId, subCategoryId } = req.query;
  const query = { isDelete: false };
  let options = {
    q: q !== "undefined" && q !== undefined ? q : "",
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
    categoryId,
    subCategoryId,
    role,
    _id,
  };

  try {
    // list
    const courses = await findCoursesService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("courseListSucc"),
      data: { ...courses },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list course
exports.publicCourses = async (req, res, next) => {
  const {
    q,
    page,
    size,
    category,
    subCategory,
    level,
    rating,
    duration,
    quiz,
    assignment,
    subtitle,
    sort,
    type,
  } = req.query;
  const query = { isDelete: false };
  let options = {
    q: q !== "undefined" && q !== undefined ? q : "",
    page,
    size,
    category,
    subCategory,
    level,
    rating,
    duration,
    quiz,
    assignment,
    subtitle,
    sort,
    type,
  };

  try {
    // list
    const courses = await findPublicCoursesService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("courseListSucc"),
      data: { ...courses },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// course detail
exports.course = async (req, res, next) => {
  const { key } = req.params;
  const keyValues = { key };
  const { _id, role } = req.user;
  const options = { _id, role };

  try {
    // list
    const course = await findCourseService(keyValues, options);
    if (!course) {
      throw new NotFound(req.__("courseNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("courseDetailSucc"),
      data: { course },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// public course detail
exports.publicCourse = async (req, res, next) => {
  const { key } = req.params;
  const keyValues = { key };

  try {
    // list
    const course = await findPublicCourseService(keyValues);
    if (!course) {
      throw new NotFound(req.__("courseNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("courseDetailSucc"),
      data: { course },
    });
  } catch (error) {
    next(error, req, res);
  }
};
