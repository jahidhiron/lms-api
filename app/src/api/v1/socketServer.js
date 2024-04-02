// custom import
const serverStore = require("./socketStore");
const { socketAuth } = require("./middlewares");
const {
  newConnectionHandler,
  addMessageHandler,
  updateMessageHandler,
  deleteMessageHandler,
  getMessagesHandler,
  getLastMessageHandler,
  seenMessageHandler,
  unseenMessageCountHandler,
} = require("./socketHandler");
const { clientLocalOrigin, clientCloudOrigin } = require("./../../config");

// register socket user
exports.registerSocketServer = (server) => {
  const io = require("socket.io")(server, {
    cors: {
      origin: [clientLocalOrigin, clientCloudOrigin],
      methods: ["GET", "POST", "PATCH", "DELETE"],
    },
    cookie: true,
  });

  serverStore.setSocketServerInstance(io);

  io.use((socket, next) => {
    socketAuth(socket, next);
  });

  const emitOnlineUsers = () => {
    const onlineUsers = serverStore.getOnlineUsers();
    io.emit("online-users", { onlineUsers });
  };

  io.on("connection", (socket) => {
    newConnectionHandler(socket, io);
    emitOnlineUsers();

    socket.on("conversation", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("add-message", (data) => {
      addMessageHandler(socket, data);
    });

    socket.on("update-message", (data) => {
      updateMessageHandler(socket, data);
    });

    socket.on("delete-message", (data) => {
      deleteMessageHandler(socket, data);
    });

    socket.on("list-message", (data) => {
      getMessagesHandler(socket, data);
    });

    socket.on("last-message", ({ conversationId }) => {
      getLastMessageHandler(socket, conversationId);
    });

    socket.on("message-seen", (data) => {
      seenMessageHandler(socket, data);
    });

    socket.on("unseem-message-count", (data) => {
      unseenMessageCountHandler(socket, data);
    });

    socket.on("typing", ({ conversationId }) => {
      socket.to(conversationId).emit("typing", socket.user);
    });

    socket.on("remove-typing", ({ conversationId }) => {
      socket.to(conversationId).emit("remove-typing");
    });

    socket.on("leave-room", (conversationId) => {
      socket.leave(conversationId);
    });

    socket.on("disconnect", () => {
      serverStore.removeConnectedUser(socket.id);
      emitOnlineUsers();
    });
  });

  setInterval(() => {
    emitOnlineUsers();
  }, [1000 * 8]);
};
