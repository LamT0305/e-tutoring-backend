import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on("sendMessage", (data) => {
      const { conversationId } = data;
      io.to(conversationId).emit("receiveMessage", data);
      io.emit("refreshUserList");
    });

    socket.on("updateMessage", (data) => {
      const { conversationId } = data;
      io.to(conversationId).emit("messageUpdated", data);
    });

    socket.on("deleteMessage", (data) => {
      const { conversationId, messageId } = data;
      io.to(conversationId).emit("messageDeleted", { messageId });
    });

    socket.on("leaveRoom", (roomId) => {
      socket.leave(roomId);
      console.log(`User left room: ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const sendNotification = (receiver, data) => {
  if (io) {
    io.to(receiver).emit("notification", data);
  }
};

export { io };
