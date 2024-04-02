// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { Category, SubCategory } = require("../models");
const { createSlug } = require("../utils/createSlug");

// find sub category single document
exports.findOneSubCategoryService = async (keyValues, options = {}) => {
  const subCategory = await SubCategory.findOne(keyValues, options);
  return subCategory;
};

// find category single document
exports.findOneCategoryService = async (keyValues, options = {}) => {
  const category = await Category.findOne(keyValues, options);
  return category;
};

// create new sub category
exports.newSubCategoryService = async ({ body, _id }) => {
  const slugItem = [];
  slugItem.push(body.title);
  let slug = createSlug(slugItem);

  const newSubCategory = new SubCategory({ ...body, slug, updatedBy: _id });
  await newSubCategory.save();

  newSubCategory.isDelete = undefined;
  newSubCategory.__v = undefined;

  return { subCategory: newSubCategory };
};

// update sub category
exports.updateSubCategoryService = async ({
  subCategory,
  title,
  categoryId,
  desc,
  _id,
}) => {
  let slug = "";

  if (title !== subCategory.title) {
    const slugItem = [];
    slugItem.push(title);
    slug = createSlug(slugItem);
  }

  subCategory.title = title ? title : subCategory.title;
  subCategory.slug = slug ? slug : subCategory.slug;
  subCategory.categoryId = categoryId ? categoryId : subCategory.categoryId;
  subCategory.desc = desc;
  subCategory.updatedBy = _id;

  // save sub category
  await subCategory.save();

  return subCategory;
};

// soft delete sub category
exports.deleteCategoryService = async ({ subCategory, _id }) => {
  subCategory.isDelete = true;
  subCategory.deletedAt = new Date().getTime();
  subCategory.deletedBy = _id;

  // save sub category
  await subCategory.save();
};

// sub category list
exports.findSubCategoriesService = async (
  keyValues = {},
  filterValues = {},
  { q, page, size }
) => {
  let regex = new RegExp(q, "i");
  const skip = (page - 1) * size;

  let query = {
    ...keyValues,
    $or: [{ title: regex }],
  };

  if (filterValues["categoryId"]) {
    query = {
      ...query,
      categoryId: new ObjectId(filterValues["categoryId"]),
    };
  }

  let project = {
    title: 1,
    desc: 1,
    createdAt: 1,
    updatedAt: 1,
    category: {
      title: "$category.title",
      updatedBy: "$category.updatedBy",
    },
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await SubCategory.aggregate([
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
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
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

  const { metadata, data: subCategories } = result[0];
  if (subCategories.length === 0) {
    return {
      subCategories: [],
      totalItem: 0,
      totalPage: 0,
    };
  }
  const { totalItem } = metadata[0];
  return {
    subCategories,
    totalItem,
    totalPage: Math.ceil(totalItem / size),
  };
};

// detail sub category
exports.findSubCategoryService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  let project = {
    title: 1,
    desc: 1,
    createdAt: 1,
    updatedAt: 1,
    categoryId: "$category._id",
    category: {
      title: "$category.title",
      updatedBy: "$category.updatedBy",
    },
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
  };

  const result = await SubCategory.aggregate([
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
    {
      $lookup: {
        from: "categories",
        localField: "categoryId",
        foreignField: "_id",
        as: "category",
      },
    },
    {
      $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
    },
    { $project: project },
  ]);

  const subCategory = result.length > 0 ? result[0] : null;
  return subCategory;
};
