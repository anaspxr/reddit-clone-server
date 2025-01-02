import { createServer } from "node:http";
import { Server } from "socket.io";
import express from "express";
import { ENV } from "./configs/env";
import devLog from "./lib/devLog";
import { Message } from "./models/messageModel";

interface UserSocketMap {
  [userId: string]: string;
}

export const userSocketMap: UserSocketMap = {}; // stores the socket id of each user that is connected

export const app = express();
export const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ENV.CLIENT_URL,
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const userId = socket.handshake.auth.userId;
  devLog("userID", userId);
  if (!userId) {
    devLog("no user id");
    return next(new Error("invalid username"));
  }
  next();
});

io.on("connection", async (socket) => {
  devLog("a user connected", socket.id);

  socket.on("disconnect", () => {
    devLog("user disconnected", socket.id);
  });

  // user join event
  socket.on("join", (userId: string) => {
    userSocketMap[userId] = socket.id;
    devLog("user joined", userId);
    devLog(userSocketMap);
  });

  //send message event
  socket.on(
    "message",
    async (data: { message: string; sender: string; receiver: string }) => {
      devLog("message", data);
      const receiverSocketId = userSocketMap[data.receiver];

      //create message in db
      try {
        const message = await Message.create({
          message: data.message,
          sender: data.sender,
          receiver: data.receiver,
        });
        // send message to receiver
        if (receiverSocketId) {
          socket.to(receiverSocketId).emit("message", message);
        }
      } catch (error) {
        devLog("Error creating message", error);
      }
    }
  );
  socket.on("disconnect", () => {
    const disconnectedUser = Object.keys(userSocketMap).find(
      (key) => userSocketMap[key] === socket.id
    );
    if (disconnectedUser) {
      delete userSocketMap[disconnectedUser];
    }
    devLog("A user disconnected:", socket.id);
    devLog(userSocketMap);
  });
});
