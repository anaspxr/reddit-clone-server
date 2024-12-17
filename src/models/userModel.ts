import { Schema, model } from "mongoose";

export interface IUser {
  username: string;
  displayName: string;
  email: string;
  password: string;
  avatar?: string;
  banner?: string;
  about?: string;
  isBanned: boolean;
}

const userSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    displayName: {
      type: String,
      required: true,
      default: function () {
        return this.username;
      },
    },
    about: String,
    isBanned: { type: Boolean, default: false },
    avatar: String,
    banner: String,
  },
  {
    timestamps: true,
  }
);

export const User = model<IUser>("User", userSchema);
