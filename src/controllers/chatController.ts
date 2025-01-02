import { Request, Response } from "express";
import { CustomError } from "../lib/customErrors";
import { User } from "../models/userModel";
import { Message } from "../models/messageModel";

type ChatData = {
  personName: string;
  userId: string;
  personId: string;
  displayName: string;
  avatar?: string;
  messages: { message: string; createdAt: string }[];
};

export const getChat = async (req: Request, res: Response) => {
  const { personName } = req.query;

  const person = await User.findOne({ username: personName });

  if (!person) {
    throw new CustomError(`User ${personName} not found`, 404);
  }

  const messages = (await Message.find({
    $or: [
      { sender: req.user, receiver: person._id },
      { sender: person._id, receiver: req.user },
    ],
  })) as { message: string; createdAt: string }[];

  const chatData: ChatData = {
    personName: person.username,
    userId: req.user!,
    personId: person._id.toString(),
    displayName: person.displayName,
    messages: messages,
    avatar: person.avatar,
  };

  res.standardResponse(200, "Chat retrieved successfully", chatData);
};

export const getChattedPeople = async (req: Request, res: Response) => {
  const messages = await Message.find({
    $or: [{ sender: req.user }, { receiver: req.user }],
  }).sort({ createdAt: -1 });

  const chattedPeople = messages.map((message) => {
    if (message.sender.toString() === req.user) {
      return message.receiver;
    } else {
      return message.sender;
    }
  });

  const uniqueChattedPeople = Array.from(new Set(chattedPeople));

  const users = await User.find({ _id: { $in: uniqueChattedPeople } });

  res.standardResponse(200, "Chatted people retrieved successfully", users);
};
