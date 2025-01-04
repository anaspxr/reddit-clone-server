import mongoose from "mongoose";

export type NotificationTypes = "like" | "comment" | "follow";

interface INotification {
  user: mongoose.Schema.Types.ObjectId;
  type: NotificationTypes;
  message: string;
  link: string;
  isRead: boolean;
}

const notificationSchema = new mongoose.Schema<INotification>(
  {
    user: { type: mongoose.Types.ObjectId, ref: "User" },
    type: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, required: true },
    isRead: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
