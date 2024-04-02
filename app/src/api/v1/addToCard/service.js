// lib
const {
  Types: { ObjectId },
} = require("mongoose");

// custom module
const { AddToCard } = require("../models");

// find single document
exports.findOneAddToCardService = async (keyValues, options = {}) => {
  const addToCard = await AddToCard.findOne(keyValues, options);
  return addToCard;
};

// create new addToCard
exports.newAddToCardService = async ({ body, _id }) => {
  const newAddToCard = new AddToCard({ ...body, updatedBy: _id });
  await newAddToCard.save();

  newAddToCard.isDelete = undefined;
  newAddToCard.__v = undefined;

  return newAddToCard;
};

// update addToCard
exports.updateAddToCardService = async ({ addToCard, courseId, _id }) => {
  addToCard.courseId = courseId ? courseId : addToCard.courseId;
  addToCard.updatedBy = _id;

  // save addToCard
  await addToCard.save();

  return addToCard;
};

// soft delete addToCard
exports.deleteAddToCardService = async ({ addToCard, _id }) => {
  addToCard.isDelete = true;
  addToCard.deletedAt = new Date().getTime();
  addToCard.deletedBy = _id;

  // save addToCard
  await addToCard.save();
};

// addToCard list
exports.findAddToCardsService = async (keyValues = {}, { page, size, _id }) => {
  const sizeNumber = parseInt(size) || 10;
  const pageNumber = parseInt(page) || 1;

  let query = {
    ...keyValues,
  };

  if (_id) {
    query = { ...query, updatedBy: new ObjectId(_id) };
  }

  const addToCards = await AddToCard.find(query)
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

  const updatedAddToCard = [];

  for (let card of addToCards) {
    let totalLecture = 0;
    let totalLength = 0;

    for (let section of card.courseId.sections) {
      for (let item of section.items) {
        if (item.lectureId) {
          totalLecture++;
          if (item.lectureId.videoId && item.lectureId.videoId.timeLength) {
            totalLength += item.lectureId.videoId.timeLength;
          }
        }
      }
    }

    updatedAddToCard.push({
      _id: card._id,
      courseId: card.courseId._id,
      updatedBy: card.updatedBy,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      course: {
        _id: card.courseId._id,
        title: card.courseId.title,
        slug: card.courseId.slug,
        language: card.courseId.language,
        level: card.courseId.level,
        subTitle: card.courseId.subTitle,
        price: card.courseId.price,
        thumbnailId: card.courseId.thumbnailId._id,
        thumbnail: card.courseId.thumbnailId,
        totalLecture,
        totalLength,
      },
    });
  }

  const totalDocuments = await AddToCard.countDocuments(query);
  const totalPage = Math.ceil(totalDocuments / sizeNumber);

  return {
    addToCards: updatedAddToCard,
    totalItem: totalDocuments,
    totalPage,
  };
};

// detail addToCard
exports.findAddToCardService = async (keyValues = {}) => {
  let query = {
    ...keyValues,
    _id: new ObjectId(keyValues["_id"]),
  };

  let project = {
    course: {
      _id: "$course._id",
      title: "$course.title",
      slug: "$course.slug",
    },
    updatedBy: {
      _id: "$user._id",
      name: "$user.name",
      email: "$user.email",
    },
    createdAt: 1,
    updatedAt: 1,
  };

  const addToCard = await AddToCard.findOne(query).populate([
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

  if (!addToCard) {
    return null;
  }

  let updatedAddToCard = {};
  let totalLecture = 0;
  let totalLength = 0;

  for (let section of addToCard.courseId.sections) {
    for (let item of section.items) {
      if (item.lectureId) {
        totalLecture++;
        if (item.lectureId.videoId && item.lectureId.videoId.timeLength) {
          totalLength += item.lectureId.videoId.timeLength;
        }
      }
    }
  }

  updatedAddToCard = {
    _id: addToCard._id,
    courseId: addToCard.courseId._id,
    updatedBy: addToCard.updatedBy,
    createdAt: addToCard.createdAt,
    updatedAt: addToCard.updatedAt,
    course: {
      _id: addToCard.courseId._id,
      title: addToCard.courseId.title,
      slug: addToCard.courseId.slug,
      language: addToCard.courseId.language,
      level: addToCard.courseId.level,
      subTitle: addToCard.courseId.subTitle,
      price: addToCard.courseId.price,
      thumbnailId: addToCard.courseId.thumbnailId._id,
      thumbnail: addToCard.courseId.thumbnailId,
      totalLecture,
      totalLength,
    },
  };

  return updatedAddToCard;
};
