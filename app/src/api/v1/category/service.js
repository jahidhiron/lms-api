// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { Category } = require("../models");
const { createSlug } = require("../utils/createSlug");

// find single document
exports.findOneCategoryService = async (keyValues, options = {}) => {
  const category = await Category.findOne(keyValues, options);
  return category;
};

// create new category
exports.newCategoryService = async ({ body, _id }) => {
  const slugItem = [];
  slugItem.push(body.title);
  let slug = createSlug(slugItem);

  const newCategory = new Category({ ...body, slug, updatedBy: _id });
  await newCategory.save();

  newCategory.isDelete = undefined;
  newCategory.__v = undefined;

  return { category: newCategory };
};

// update category
exports.updateCategoryService = async ({ category, title, desc, _id }) => {
  let slug = "";

  if (title !== category.title) {
    const slugItem = [];
    slugItem.push(title);
    slug = createSlug(slugItem);
  }

  category.title = title ? title : category.title;
  category.slug = slug ? slug : category.slug;
  category.desc = desc;
  category.updatedBy = _id;

  // save category
  await category.save();

  return category;
};

// soft delete category
exports.deleteCategoryService = async ({ category, _id }) => {
  category.isDelete = true;
  category.deletedAt = new Date().getTime();
  category.deletedBy = _id;

  // save category
  await category.save();
};

// category list
exports.findCategoriesService = async (keyValues = {}, { q, page, size }) => {
  let regex = new RegExp(q, "i");
  const skip = (page - 1) * size;

  let query = {
    ...keyValues,
    $or: [{ title: regex }],
  };

  let project = {
    title: 1,
    desc: 1,
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await Category.aggregate([
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

  const { metadata, data: categories } = result[0];
  if (categories.length === 0) {
    return {
      categories: [],
      totalItem: 0,
      totalPage: 0,
    };
  }
  const { totalItem } = metadata[0];
  return {
    categories,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// detail category
exports.findCategoryService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  let project = {
    title: 1,
    desc: 1,
    createdAt: 1,
    updatedAt: 1,
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await Category.aggregate([
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

  const category = result.length > 0 ? result[0] : null;
  return category;
};
