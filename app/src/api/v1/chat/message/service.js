const {
  mongo: { ObjectId },
} = require("mongoose");
// custom module
const { Message } = require("../../models");

// find single document
exports.findOneMessageService = async (keyValues, options = {}) => {
  const message = await Message.findOne(keyValues, options);
  return message;
};

// create new message
exports.newMessageService = async ({ body, _id }) => {
  const newMessage = new Message({ ...body, senderId: _id });
  await newMessage.save();

  newMessage.isDelete = undefined;
  newMessage.__v = undefined;

  return newMessage;
};

// update message
exports.updateMessageService = async ({ message, fileId, msg, isSeen }) => {
  if (fileId) {
    message.fileId = fileId;
  }
  message.msg = msg ? msg : message.msg;
  message.isSeen = isSeen ? isSeen : message.isSeen;
  message.isEdited = true;
  await message.save();
  return message;
};

// seen message
exports.seenMessageService = async ({ message }) => {
  message.isSeen = true;
  message.updatedAt = Date.now();
  await message.save();
  return message;
};

// soft delete message
exports.deleteMessageService = async ({ message, _id }) => {
  message.isDelete = true;
  message.deletedAt = new Date().getTime();
  message.deletedBy = _id;

  // save message
  await message.save();
};

// message list
exports.findMessagesService = async (keyValues = {}, { page, size }) => {
  const sizeNumber = parseInt(size) || 10;
  const pageNumber = parseInt(page) || 1;

  let query = {
    ...keyValues,
  };

  const messages = await Message.find(query)
    .sort({ _id: -1 })
    .populate({ path: "conversationId" })
    .populate({ path: "senderId", select: "name email" })
    .skip((pageNumber - 1) * sizeNumber)
    .limit(sizeNumber);

  const totalPage = Math.ceil(messages.length / sizeNumber);

  return {
    messages,
    totalItem: messages.length,
    totalPage,
  };
};

// unseen message count
exports.findUnseenMessagesService = async ({ conversationId, _id }) => {
  const messages = await Message.find({
    isDelete: false,
    isSeen: false,
    conversationId,
    senderId: { $ne: _id },
  })
    .select("-__v -isDelete")
    .sort({ _id: -1 })
    .lean();

  return messages;
};
