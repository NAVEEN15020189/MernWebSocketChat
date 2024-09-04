const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const mongoose = require("mongoose");
const Message = require("./models/Message"); // Import the Message model

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "https://mernfrontendchat.onrender.com/",
    methods: ["GET", "POST"],
  },
});

// MongoDB connection
mongoose.connect("mongodb+srv://ramadevi15020:Y8kfx8yORnzfqNn7@cluster0.25x5m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to MongoDB");
}).catch((error) => {
  console.error("Error connecting to MongoDB:", error);
});

io.on("connection", (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // Handle joining a room
  socket.on("join_room", (data) => {
    socket.join(data);
    console.log(`User with ID: ${socket.id} joined room: ${data}`);
  });

  // Handle sending a message
  socket.on("send_message", async (data) => {
    const messageData = {
      room: data.room,
      author: data.author,
      message: data.message,
      time: data.time,
      id: socket.id, // Include the sender's socket ID
    };
    
    // Save the message to the database
    try {
      const message = new Message(messageData);
      await message.save();
      console.log("Message saved to DB");
    } catch (error) {
      console.error("Error saving message to DB:", error);
    }

    // Emit the message back to the sender
    socket.emit("receive_message", messageData);
    
    // Emit the message to others in the room
    socket.to(data.room).emit("receive_message", messageData);
  });

  // Optional: handle disconnection
  socket.on("disconnect", () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});
