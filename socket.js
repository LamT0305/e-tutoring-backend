import { Server } from "socket.io";

let io;

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    });

    socket.on("sendMessage", async (data) => {
      const { sender_id, receiver_id, content } = data;
      const conversationId = [sender_id, receiver_id].sort().join("_");

      const message = {
        sender_id,
        receiver_id,
        content,
        created_at: new Date().toISOString(),
      };

      io.to(conversationId).emit("receiveMessage", message);
      io.to(conversationId).emit("updateUserList");
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const sendNotification = (receiver, data) => {
  if (io) {
    io.to(receiver).emit("receiveNotification", data);
  }
};

export { io };
