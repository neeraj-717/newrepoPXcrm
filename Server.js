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
import paymentRoutes from "./routes/paymentRoutes.js";
import leadManagerRoutes from "./routes/leadManagerRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import { Server } from "socket.io";
import http from "http";
import User from "./models/user.js";

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uplods', express.static('uplods'));

// sokit-io

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let onlineUsers = {}; // store users socket id
const onlineUsersList = new Set();

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  // user send his id after login
  socket.on("register", async (userId) => {
    onlineUsers[userId] = socket.id;
    onlineUsersList.add(userId);
    socket.userId = userId;
    
    // Update user status in database
    await User.findByIdAndUpdate(userId, { status: "online" });
    
    // Emit to all clients (especially SuperAdmin)
    io.emit("userOnline", userId);
    io.emit("onlineUsers", Array.from(onlineUsersList));
    console.log("User online:", userId);
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


  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    
    if (socket.userId) {
      // Update user status in database
      await User.findByIdAndUpdate(socket.userId, { status: "offline" });
      
      onlineUsersList.delete(socket.userId);
      delete onlineUsers[socket.userId];
      
      // Emit to all clients (especially SuperAdmin)
      io.emit("userOffline", socket.userId);
      io.emit("onlineUsers", Array.from(onlineUsersList));
      console.log("User offline:", socket.userId);
    }
  });


});

// Routes
app.use("/api/leads", leadRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/lead-manager", leadManagerRoutes);
app.use("/api/customers", customerRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server running on 5000"));
