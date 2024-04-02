// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { NotFound, BadRequest } = require("../utils/errors");
const {
  findOneAddToCardService,
  newAddToCardService,
  updateAddToCardService,
  deleteAddToCardService,
  findAddToCardsService,
  findAddToCardService,
} = require("./service");
const { findOneCourseService } = require("../course/service");

// add addToCard
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { courseId } = req.body;
  const { _id } = req.user;

  try {
    // course checking
    const isCourseExist = await findOneCourseService({
      _id: courseId,
      isDelete: false,
    });
    if (!isCourseExist) {
      throw new NotFound(req.__("courseNotFoundErr"));
    }

    // addToCard checking
    const isAddToCardExist = await findOneAddToCardService({
      courseId,
      updatedBy: _id,
      isDelete: false,
    });
    if (isAddToCardExist) {
      throw new BadRequest(req.__("addToCardExistError"));
    }

    // add addToCard
    const addToCard = await newAddToCardService({ body: req.body, _id });

    // save activity log
    await createActivityLog({
      title: `Add add to card`,
      desc: `Add to card for course id "${courseId}" and add to card id "${addToCard._id} is added"`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("addToCardAddSucc"),
      data: { addToCard },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update addToCard
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { courseId } = req.body;
  const { _id } = req.user;

  try {
    // find addToCard
    const addToCard = await findOneAddToCardService(
      {
        _id: id,
        updatedBy: _id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!addToCard) {
      throw new NotFound(req.__("addToCardNotFoundErr"));
    }

    // title checking
    const isCourseExist = await findOneAddToCardService({
      courseId,
      updatedBy: _id,
      isDelete: false,
    });
    if (
      isCourseExist &&
      String(courseId) === String(isCourseExist.courseId) &&
      String(addToCard._id) !== String(isCourseExist._id)
    ) {
      throw new BadRequest(req.__("addToCardExistError"));
    }

    if (courseId) {
      // course checking
      const isCourseExist = await findOneCourseService({
        _id: courseId,
        isDelete: false,
      });
      if (!isCourseExist) {
        throw new NotFound(req.__("courseNotFoundErr"));
      }
    }

    // update addToCard
    const updatedAddToCard = await updateAddToCardService({
      ...req.body,
      _id,
      addToCard,
    });

    // save activity log
    await createActivityLog({
      title: `Update add to card`,
      desc: `Add to card id "${addToCard._id}" with course id "${addToCard.courseId}" is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("addToCardUpdateSucc"),
      data: { addToCard: updatedAddToCard },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove addToCard
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find addToCard
    const addToCard = await findOneAddToCardService(
      {
        _id: id,
        updatedBy: _id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!addToCard) {
      throw new NotFound(req.__("addToCardNotFoundErr"));
    }

    // soft delete addToCard
    await deleteAddToCardService({ addToCard, _id });

    // save activity log
    await createActivityLog({
      title: `Delete add to card`,
      desc: `${addToCard._id} add to card id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("addToCardDeleteSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list addToCard
exports.addToCards = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { page, size } = req.query;
  const query = { isDelete: false };
  let options = {
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
    _id,
  };

  try {
    // list
    const addToCards = await findAddToCardsService(query, options);

    // save activity log
    await createActivityLog({
      title: `List add to card`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("addToCardListSucc"),
      data: { ...addToCards },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// addToCard detail
exports.addToCard = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { _id } = req.user;
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const addToCard = await findAddToCardService(keyValues);
    if (!addToCard) {
      throw new NotFound(req.__("addToCardNotFoundErr"));
    }

    // save activity log
    await createActivityLog({
      title: `Detail add to card`,
      desc: `Get detail add to card by "${addToCard._id}" id `,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("addToCardDetailSucc"),
      data: { addToCard },
    });
  } catch (error) {
    next(error, req, res);
  }
};
