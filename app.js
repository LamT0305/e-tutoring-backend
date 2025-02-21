import express from "express";
import http from "http"; // Required for WebSockets
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

import connectDB from "./config/dbConnection.js";
import routers from "./config/routes.js";
import Message from "./models/message.model.js";

dotenv.config(); // Load environment variables

const app = express();
const server = http.createServer(app); // Create HTTP Server
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Setup routes
routers(app);

// Serve static files (uploads)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// WebSocket setup

app.use((req, res, next) => {
  req.io = io; // Attach socket instance to request
  next();
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

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start server with WebSockets enabled
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
