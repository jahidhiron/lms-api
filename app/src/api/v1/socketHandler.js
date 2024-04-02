const socketStore = require("./socketStore");
const {
  newConversationService,
  findOneConversationService,
} = require("./chat/conversation/service");
const { findOneCourseService } = require("./course/service");
const {
  newMessageService,
  findOneMessageService,
  updateMessageService,
  seenMessageService,
  deleteMessageService,
  findMessagesService,
  findUnseenMessagesService,
} = require("./chat/message/service");
const { findOneFileService } = require("./file/service");
const { NotFound } = require("./utils/errors");

// new connection
exports.newConnectionHandler = async (socket, _io) => {
  socketStore.addNewConnectedUser({
    socketId: socket.id,
    userId: socket.user._id,
  });
};

// remove connection
exports.disconnectHandler = (socket) => {
  socketStore.removeConnectedUser(socket.id);
};

// send message
exports.addMessageHandler = async (socket, data) => {
  try {
    const { _id, ip } = socket.user;
    let { conversationId, msg, fileId, courseId } = data;

    const io = socketStore.getSocketServerInstance();

    // create new conversation
    if (!conversationId) {
      const course = await findOneCourseService({
        _id: courseId,
        isDelete: false,
      });
      if (!course) {
        throw new NotFound("Course not found");
      }

      const conversation = await newConversationService({
        body: { courseId, receiverId: course.updatedBy },
        _id,
      });
      conversationId = conversation._id;
    }

    if (fileId) {
      const file = await findOneFileService({
        _id: fileId,
        isDelete: false,
      });
      if (!file) {
        throw new NotFound("File not found");
      }
    }

    let body = { conversationId, msg };
    if (fileId) {
      body = { ...body, fileId };
    }

    // send messgae
    const message = await newMessageService({
      body,
      _id,
    });

    // log
    await createLog({
      title: "Send message",
      desc: `Send message by conversation id "${conversationId}" and message id "${message._id}"`,
      userId: sender,
      ip,
    });

    // save message
    await message.save();

    io.emit(`${conversationId}-last-message`, { message });
    io.emit(`new-message`, { message, conversationId });
    await this.getMessagesHandler(socket, { conversationId });
  } catch (err) {
    return;
  }
};

// update message
exports.updateMessageHandler = async (socket, data) => {
  try {
    const { _id, ip } = socket.user;
    const { id, msg, fileId, isSeen } = data;

    const message = await findOneMessageService({ _id: id, isDelete: false });
    if (!message) {
      throw new NotFound("Message not found");
    }

    if (fileId) {
      const file = await findOneFileService({
        _id: fileId,
        isDelete: false,
      });
      if (!file) {
        throw new NotFound("File not found");
      }
    }

    // update message
    await updateMessageService({
      message,
      fileId,
      msg,
      isSeen,
    });

    // log
    await createLog({
      title: "Update message",
      desc: `Update message by message id ${id}`,
      userId: _id,
      ip,
    });
  } catch (err) {
    return;
  }
};

// delete message
exports.deleteMessageHandler = async (socket, data) => {
  try {
    const { _id, ip } = socket.user;
    const { id, conversationId } = data;

    // find message
    const message = await findOneMessageService({ _id: id, isDelete: false });

    if (!message) {
      throw new NotFound("Message not found");
    }

    // delete message
    await deleteMessageService({ message, _id });

    // activity log
    await createLog({
      title: "Delete message",
      desc: `Delete message by message id ${id}`,
      userId: _id,
      ip,
    });

    await this.getMessagesHandler(socket, { conversationId });
  } catch (err) {
    return;
  }
};

// message list
exports.getMessagesHandler = async (socket, data, page, size) => {
  try {
    const io = socketStore.getSocketServerInstance();

    const { _id, ip } = socket.user;
    const { conversationId } = data;

    let conversation = findOneConversationService({
      _id: conversationId,
      isDelete: false,
    });
    if (!conversation) {
      throw new NotFound("Conversation not found");
    }

    // message list
    const options = { page, size };
    const query = { isDelete, conversationId };

    const messages = await findMessagesService(query, options);

    // activity logs
    await createLog({
      title: "Fetch message list",
      desc: `Fetch message list by conversation id ${conversationId}`,
      userId: _id,
      ip,
    });

    io.to(conversationId).emit("get-messages", {
      ...messages,
      lastMessage: messages && messages.length > 0 ? messages[0] : {},
    });
  } catch (error) {
    return;
  }
};

// last message
exports.getLastMessageHandler = async (socket, conversationId) => {
  try {
    const io = socketStore.getSocketServerInstance();
    const { _id, ip } = socket.user;

    let conversation = findOneConversationService({
      _id: conversationId,
      isDelete: false,
    });
    if (!conversation) {
      throw new NotFound("Conversation not found");
    }

    const messages = await findMessagesService({}, { page: 1, size: 2 });

    // log
    await createLog({
      title: "Fetch last message of a conversation",
      desc: `Fetch last message of a conversation by conversation id ${conversationId}`,
      userId: _id,
      ip,
    });

    const message = messages && messages.length > 0 ? messages[0] : {};

    io.emit(`${conversationId}-last-message`, { message });
  } catch (error) {
    return;
  }
};

// seen message
exports.seenMessageHandler = async (socket, data) => {
  try {
    const io = socketStore.getSocketServerInstance();
    const { _id, ip } = socket.user;
    const { conversationId, messageId } = data;

    let conversation = findOneConversationService({
      _id: conversationId,
      isDelete: false,
    });
    if (!conversation) {
      throw new NotFound("Conversation not found");
    }

    const message = await findOneMessageService({
      _id: messageId,
      isDelete: false,
    });

    if (!message) {
      throw new NotFound("Message not found");
    }

    const updatedMessage = await seenMessageService({ message });

    // log
    await createLog({
      title: "Seen message",
      desc: `Seen message by message id ${_id}`,
      userId: _id,
      ip,
    });

    socket.to(conversationId).emit(`${_id}-seen`, updatedMessage);
    io.emit(`${conversationId}-last-message`, { message: updatedMessage });
    await this.unseenMessageCountHandler(socket, { conversationId });
  } catch (error) {
    return;
  }
};

// unseen message
exports.unseenMessageCountHandler = async (socket, data) => {
  try {
    const { _id, ip } = socket.user;
    const { conversationId } = data;

    let conversation = findOneConversationService({
      _id: conversationId,
      isDelete: false,
    });
    if (!conversation) {
      throw new NotFound("Conversation not found");
    }

    const messages = await findUnseenMessagesService({ conversationId, _id });

    // log
    await createLog({
      title: "Unseen messages list",
      desc: `Unseen messages list by conversation id ${conversationId}`,
      userId: _id,
      ip,
    });

    socket.emit(`${conversationId}-unseem-message-count`, {
      messages,
      total: messages.length,
    });
  } catch (error) {
    return;
  }
};
