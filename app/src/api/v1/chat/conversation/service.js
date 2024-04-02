const {
  mongo: { ObjectId },
} = require("mongoose");
// custom module
const { Conversation } = require("../../models");

// find single document
exports.findOneConversationService = async (keyValues, options = {}) => {
  const conversation = await Conversation.findOne(keyValues, options);
  return conversation;
};

// create new conversation
exports.newConversationService = async ({ body, _id }) => {
  const newConversation = new Conversation({ ...body, updatedBy: _id });
  await newConversation.save();

  newConversation.isDelete = undefined;
  newConversation.__v = undefined;

  return newConversation;
};

// conversation list
exports.findConversationsService = async (
  keyValues = {},
  { _id, courseId }
) => {
  let query = {
    ...keyValues,
    receiverId: new ObjectId(_id),
  };

  if (courseId) {
    query = { ...query, courseId: new ObjectId(courseId) };
  }

  let project = {
    course: {
      name: "$course.title",
      slug: "$course.slug",
    },
    receiver: {
      name: "$receiver.name",
      email: "$receiver.email",
    },
    updatedBy: {
      name: "$user.name",
      email: "$user.email",
    },
  };

  const conversations = await Conversation.aggregate([
    {
      $match: query,
    },
    {
      $lookup: {
        from: "users",
        localField: "receiverId",
        foreignField: "_id",
        as: "receiver",
      },
    },
    {
      $unwind: { path: "$receiver", preserveNullAndEmptyArrays: true },
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
        from: "courses",
        localField: "courseId",
        foreignField: "_id",
        as: "course",
      },
    },
    {
      $unwind: { path: "$course", preserveNullAndEmptyArrays: true },
    },
    { $project: project },
    { $sort: { _id: -1 } },
  ]);

  return {
    conversations,
  };
};
