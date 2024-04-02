// connected user
const connectedUsers = new Map();
let io = null;

exports.setSocketServerInstance = (ioInstance) => {
  io = ioInstance;
};

exports.getSocketServerInstance = () => {
  return io;
};

exports.getOnlineUsers = () => {
  const onlineUsers = [];

  connectedUsers.forEach((value, key) => {
    onlineUsers.push({ socketId: key, userId: value.userId });
  });

  return onlineUsers;
};

exports.addNewConnectedUser = ({ socketId, userId }) => {
  connectedUsers.set(socketId, { userId });
};

exports.removeConnectedUser = (socketId) => {
  if (connectedUsers.has(socketId)) {
    connectedUsers.delete(socketId);
  }
};
