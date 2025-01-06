import { Schema, model } from "mongoose";
import { IUser } from "./userModel";

const userSchema = new Schema<IUser>(
  {
    username: String,
    email: String,
    password: String,
    displayName: String,
    about: String,
    avatar: String,
    banner: String,
  },
  {
    timestamps: true,
  }
);

export const DeletedUsers = model<IUser>("DeletedUser", userSchema);
