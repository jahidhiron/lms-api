// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { Wishlist } = require("../models");

// find single document
exports.findOneWishlistService = async (keyValues, options = {}) => {
  const wishlist = await Wishlist.findOne(keyValues, options);
  return wishlist;
};

// create new wishlist
exports.newWishlistService = async ({ body, _id }) => {
  const newWishlist = new Wishlist({ ...body, updatedBy: _id });
  await newWishlist.save();

  newWishlist.isDelete = undefined;
  newWishlist.__v = undefined;

  return newWishlist;
};

// update wishlist
exports.updateWishlistService = async ({ wishlist, courseId, _id }) => {
  wishlist.courseId = courseId ? courseId : wishlist.courseId;
  wishlist.updatedBy = _id;

  // save wishlist
  await wishlist.save();

  return wishlist;
};

// soft delete wishlist
exports.deleteWishlistService = async ({ wishlist, _id }) => {
  wishlist.isDelete = true;
  wishlist.deletedAt = new Date().getTime();
  wishlist.deletedBy = _id;

  // save wishlist
  await wishlist.save();
};

// wishlist list
exports.findWishlistsService = async (keyValues = {}, { page, size }) => {
  const sizeNumber = parseInt(size) || 10;
  const pageNumber = parseInt(page) || 1;
  let query = {
    ...keyValues,
  };

  const wishlists = await Wishlist.find(query)
    .populate([
      {
        path: "courseId",
        populate: [
          {
            path: "sections.items",
            populate: [
              {
                path: "lectureId",
                populate: [
                  {
                    path: "videoId",
                  },
                ],
              },
            ],
          },
          {
            path: "thumbnailId",
          },
        ],
      },
      {
        path: "updatedBy",
        select: "name email",
      },
    ])
    .skip((pageNumber - 1) * sizeNumber)
    .limit(sizeNumber);

  const updatedWishlists = [];

  for (let whishlist of wishlists) {
    let totalLecture = 0;
    let totalLength = 0;

    for (let section of whishlist.courseId.sections) {
      for (let item of section.items) {
        if (item.lectureId) {
          totalLecture++;
          if (item.lectureId.videoId && item.lectureId.videoId.timeLength) {
            totalLength += item.lectureId.videoId.timeLength;
          }
        }
      }
    }

    updatedWishlists.push({
      _id: whishlist._id,
      courseId: whishlist.courseId._id,
      updatedBy: whishlist.updatedBy,
      createdAt: whishlist.createdAt,
      updatedAt: whishlist.updatedAt,
      course: {
        _id: whishlist.courseId._id,
        title: whishlist.courseId.title,
        slug: whishlist.courseId.slug,
        language: whishlist.courseId.language,
        level: whishlist.courseId.level,
        subTitle: whishlist.courseId.subTitle,
        price: whishlist.courseId.price,
        thumbnailId: whishlist.courseId.thumbnailId._id,
        thumbnail: whishlist.courseId.thumbnailId,
        totalLecture,
        totalLength,
      },
    });
  }

  const totalDocuments = await Wishlist.countDocuments(query);
  const totalPage = Math.ceil(totalDocuments / sizeNumber);

  return {
    wishlists: updatedWishlists,
    totalItem: totalDocuments,
    totalPage,
  };
};

// detail wishlist
exports.findWishlistService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  const whishlist = await Wishlist.findOne(query).populate([
    {
      path: "courseId",
      populate: [
        {
          path: "sections.items",
          populate: [
            {
              path: "lectureId",
              populate: [
                {
                  path: "videoId",
                },
              ],
            },
          ],
        },
        {
          path: "thumbnailId",
        },
      ],
    },
    {
      path: "updatedBy",
      select: "name email",
    },
  ]);

  if (!whishlist) {
    return null;
  }

  let updatedWishlist = {};
  let totalLecture = 0;
  let totalLength = 0;

  for (let section of whishlist.courseId.sections) {
    for (let item of section.items) {
      if (item.lectureId) {
        totalLecture++;
        if (item.lectureId.videoId && item.lectureId.videoId.timeLength) {
          totalLength += item.lectureId.videoId.timeLength;
        }
      }
    }
  }

  updatedWishlist = {
    _id: whishlist._id,
    courseId: whishlist.courseId._id,
    updatedBy: whishlist.updatedBy,
    createdAt: whishlist.createdAt,
    updatedAt: whishlist.updatedAt,
    course: {
      _id: whishlist.courseId._id,
      title: whishlist.courseId.title,
      slug: whishlist.courseId.slug,
      language: whishlist.courseId.language,
      level: whishlist.courseId.level,
      subTitle: whishlist.courseId.subTitle,
      price: whishlist.courseId.price,
      thumbnailId: whishlist.courseId.thumbnailId._id,
      thumbnail: whishlist.courseId.thumbnailId,
      totalLecture,
      totalLength,
    },
  };

  return updatedWishlist;
};
