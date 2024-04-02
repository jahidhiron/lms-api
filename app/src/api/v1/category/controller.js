// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { BadRequest, NotFound } = require("../utils/errors");
const {
  findOneCategoryService,
  newCategoryService,
  updateCategoryService,
  deleteCategoryService,
  findCategoriesService,
  findCategoryService,
} = require("./service");

// add cateory
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { title } = req.body;
  const { _id } = req.user;

  try {
    // title checker
    const isCategoryExist = await findOneCategoryService({
      title,
      isDelete: false,
    });
    if (isCategoryExist) {
      throw new BadRequest(req.__("categoryExistErr"));
    }

    // add category
    const { category } = await newCategoryService({ body: req.body, _id });

    // save activity log
    await createActivityLog({
      title: `Add category`,
      desc: `Category by "${title}" title is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("categoryAddSucc"),
      data: { category },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update category
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { title } = req.body;
  const { _id } = req.user;

  try {
    // find category
    const category = await findOneCategoryService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!category) {
      throw new NotFound(req.__("categoryNotFoundErr"));
    }

    // title checking
    const isTitleExist = await findOneCategoryService({
      title,
      isDelete: false,
    });
    if (
      isTitleExist &&
      title === isTitleExist.title &&
      String(category._id) !== String(isTitleExist._id)
    ) {
      throw new BadRequest(req.__("categoryExistErr"));
    }

    // update category
    const updatedCategory = await updateCategoryService({
      ...req.body,
      _id,
      category,
    });

    // save activity log
    await createActivityLog({
      title: `Update category`,
      desc: `${category._id} category id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("categoryUpdatedSucc"),
      data: { category: updatedCategory },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove category
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find category
    const category = await findOneCategoryService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!category) {
      throw new NotFound(req.__("categoryNotFoundErr"));
    }

    // soft delete category
    await deleteCategoryService({ category, _id });

    // save activity log
    await createActivityLog({
      title: `Delete category`,
      desc: `${category._id} category id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("categoryDeletedSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list category
exports.categories = async (req, res, next) => {
  const { q, page, size } = req.query;
  const query = { isDelete: false };
  let options = {
    q: q !== "undefined" && q !== undefined ? q : "",
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
  };

  try {
    // list
    const categories = await findCategoriesService(query, options);

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("categoryListSucc"),
      data: { ...categories },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// category detail
exports.category = async (req, res, next) => {
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const category = await findCategoryService(keyValues);
    if (!category) {
      throw new NotFound(req.__("categoryNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("categoryDetailSucc"),
      data: { category },
    });
  } catch (error) {
    next(error, req, res);
  }
};
