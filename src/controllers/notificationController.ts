import { Request, Response } from "express";
import { Notification } from "../models/notificationModel";
import { io, userSocketMap } from "../socket";
import { Post } from "../models/postModel";
import { Comment } from "../models/commentModel";
import { User } from "../models/userModel";

export const markAsRead = async (req: Request, res: Response) => {
  const { id } = req.params;
  await Notification.findByIdAndUpdate(id, { isRead: true });
  res.standardResponse(200, "Notification marked as read");
};

export const markAllAsRead = async (req: Request, res: Response) => {
  await Notification.updateMany({ user: req.user }, { isRead: true });
  res.standardResponse(200, "All notifications marked as read");
};

export const getUsersNotifications = async (req: Request, res: Response) => {
  const notifications = await Notification.find({ user: req.user }).sort({
    createdAt: -1,
  });
  res.standardResponse(200, "Notifications retrieved", notifications);
};

// create notification functions

export const createCommentNotification = async (
  postId: string,
  commenter: string,
  parentComment?: string | null
) => {
  const post = (
    parentComment
      ? await Comment.findById(parentComment)
      : await Post.findById(postId)
  )?.toObject();

  const notification = await Notification.create({
    user: post?.creator,
    type: "comment",
    message: `${commenter} commented on your ${parentComment ? "comment" : "post"}!`,
    link: `/post/${post?._id.toString()}`,
  });

  const creatorString = post?.creator.toString();

  if (creatorString)
    io.to(userSocketMap[creatorString]).emit("notification", notification);
};

export const createLikeNotification = async (
  user: string,
  count: number,
  postId: string,
  commentId?: string
) => {
  const notification = await Notification.create({
    user,
    type: "like",
    message: `You got ${count} votes on your ${commentId ? "comment" : "post"}!`,
    link: `/post/${postId}`,
  });

  io.to(userSocketMap[user]).emit("notification", notification);
};

export const createFollowNotification = async (
  user: string,
  followerId?: string
) => {
  const follower = await User.findById(followerId);
  if (!follower) {
    return;
  }

  const notification = await Notification.create({
    user,
    type: "follow",
    message: `${follower.username} started following you`,
    link: `/u/${follower.username}`,
  });

  io.to(userSocketMap[user]).emit("notification", notification);
};
