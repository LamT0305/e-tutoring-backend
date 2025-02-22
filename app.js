import express from "express";
import http from "http"; 
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

import connectDB from "./config/dbConnection.js";
import routers from "./config/routes.js";
import { initializeSocket } from "./socket.js"; 

dotenv.config(); 

const app = express();
const server = http.createServer(app);
const io = initializeSocket(server); 

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to Database
connectDB();

// Attach WebSocket instance to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Setup routes
routers(app);

// Serve static files (uploads)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});


app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Start server with WebSockets enabled
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
