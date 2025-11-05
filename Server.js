import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import leadRoutes from "./routes/leadRoutes.js";
import dealRoutes from "./routes/dealRoutes.js";
import callRoutes from "./routes/callRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { Server } from "socket.io";
import http from "http";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// sokit-io

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let onlineUsers = {}; // store users socket id

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // user send his id after login
  socket.on("register", (userId) => {
    onlineUsers[userId] = socket.id;
    io.emit("onlineUsers", Object.keys(onlineUsers))
    console.log("Registered:", onlineUsers);
  });
  
  
  
  socket.on("sendMessage", ({ senderId, receiverId, message }) => {
    const targetSocket = onlineUsers[receiverId];
  
  if (targetSocket) {
    io.to(targetSocket).emit("receiveMessage", {
      senderId,
      receiverId,
      message,
      timestamp: new Date()
    });
  }
});


  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    Object.keys(onlineUsers).forEach((key) => {
      if (onlineUsers[key] === socket.id) delete onlineUsers[key];
    });
  });


});

// Routes
app.use("/api/leads", leadRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on 5000"));
