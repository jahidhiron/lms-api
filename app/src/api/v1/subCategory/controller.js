// custom
const { createActivityLog } = require("../utils/createActivityLog");
const { BadRequest, NotFound } = require("../utils/errors");
const {
  findOneSubCategoryService,
  findOneCategoryService,
  newSubCategoryService,
  updateSubCategoryService,
  deleteCategoryService,
  findSubCategoriesService,
  findSubCategoryService,
} = require("./service");

// add sub cateory
exports.add = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { title, categoryId } = req.body;
  const { _id } = req.user;

  try {
    // sub category title checker
    const isSubCategoryExist = await findOneSubCategoryService({
      title,
      isDelete: false,
    });
    if (isSubCategoryExist) {
      throw new BadRequest(req.__("subCategoryExistErr"));
    }

    // category checker
    const isCategoryExist = await findOneCategoryService({
      _id: categoryId,
      isDelete: false,
    });
    if (!isCategoryExist) {
      throw new NotFound(req.__("categoryNotFoundErr"));
    }

    // add sub category
    const { subCategory } = await newSubCategoryService({
      body: req.body,
      _id,
    });

    // save activity log
    await createActivityLog({
      title: `Add sub category`,
      desc: `Sub category by "${title}" title is added`,
      ip,
      user: _id,
    });

    // response
    res.status(201).json({
      code: 201,
      status: "success",
      message: req.__("subCategoryAddSucc"),
      data: { subCategory },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// update sub category
exports.update = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { title, categoryId } = req.body;
  const { _id } = req.user;

  try {
    // find sub category
    const subCategory = await findOneSubCategoryService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!subCategory) {
      throw new NotFound(req.__("subCategoryNotFoundErr"));
    }

    // find category
    if (categoryId) {
      const isCategoryExist = await findOneCategoryService({
        _id: categoryId,
        isDelete: false,
      });
      if (!isCategoryExist) {
        throw new NotFound(req.__("categoryNotFoundErr"));
      }
    }

    // title checking
    const isTitleExist = await findOneSubCategoryService({
      title,
      isDelete: false,
    });
    if (
      isTitleExist &&
      title === isTitleExist.title &&
      String(subCategory._id) !== String(isTitleExist._id)
    ) {
      throw new BadRequest(req.__("subCategoryExistErr"));
    }

    // update sub category
    const updatedSubCategory = await updateSubCategoryService({
      ...req.body,
      _id,
      subCategory,
    });

    // save activity log
    await createActivityLog({
      title: `Update sub category`,
      desc: `${subCategory._id} sub category id is updated`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("subCategoryUpdatedSucc"),
      data: { subCategory: updatedSubCategory },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// remove sub category
exports.remove = async (req, res, next) => {
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  const { id } = req.params;
  const { _id } = req.user;

  try {
    // find sub category
    const subCategory = await findOneSubCategoryService(
      {
        _id: id,
        isDelete: false,
      },
      { __v: 0, isDelete: 0 }
    );
    if (!subCategory) {
      throw new NotFound(req.__("subCategoryNotFoundErr"));
    }

    // soft delete sub category
    await deleteCategoryService({ subCategory, _id });

    // save activity log
    await createActivityLog({
      title: `Delete sub category`,
      desc: `${subCategory._id} sub category id is deleted`,
      ip,
      user: _id,
    });

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: req.__("subCategoryDeletedSucc"),
    });
  } catch (error) {
    next(error, req, res);
  }
};

// list sub category
exports.subCategories = async (req, res, next) => {
  const { q, page, size, categoryId } = req.query;
  const query = { isDelete: false };
  const filterQuery = { categoryId };
  let options = {
    q: q !== "undefined" && q !== undefined ? q : "",
    page: parseInt(page) || 1,
    size: parseInt(size) || 10,
  };

  try {
    // list
    const subCategories = await findSubCategoriesService(
      query,
      filterQuery,
      options
    );

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("subCategoryListSucc"),
      data: { ...subCategories },
    });
  } catch (error) {
    next(error, req, res);
  }
};

// sub category detail
exports.subCategory = async (req, res, next) => {
  const { id } = req.params;
  const keyValues = { isDelete: false, _id: id };

  try {
    // list
    const subCategory = await findSubCategoryService(keyValues);
    if (!subCategory) {
      throw new NotFound(req.__("subCategoryNotFoundErr"));
    }

    // response
    res.status(200).json({
      code: 200,
      status: "success",
      message: res.__("subCategoryDetailSucc"),
      data: { subCategory },
    });
  } catch (error) {
    next(error, req, res);
  }
};
