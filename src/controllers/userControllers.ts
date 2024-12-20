import {
  aboutSchema,
  changePasswordSchema,
  displayNameSchema,
} from "../lib/bodyValidation/userProfile";
import { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../lib/customErrors";
import bcrypt from "bcryptjs";

export const updateDisplayName = async (req: Request, res: Response) => {
  const { displayName } = displayNameSchema.parse(req.body);

  const user = await User.findByIdAndUpdate(
    req.user,
    {
      displayName,
    },
    { new: true }
  );

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  res.standardResponse(200, "Display name updated", user);
};

export const updateAbout = async (req: Request, res: Response) => {
  const { about } = aboutSchema.parse(req.body);

  const user = await User.findByIdAndUpdate(
    req.user,
    {
      about,
    },
    { new: true }
  );

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  res.standardResponse(200, "About description updated", user);
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

  const user = await User.findById(req.user);

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const isPasswordCorrect = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isPasswordCorrect) {
    throw new CustomError("Invalid password", 400);
  }

  user.password = newPassword;
  await user.save();

  res.standardResponse(200, "Password updated successfully");
};

export const hydrateUser = async (req: Request, res: Response) => {
  const user = await User.findById(req.user);

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const { username, email, avatar } = user.toObject();

  res.standardResponse(200, "User data fetched", { username, email, avatar });
};

export const updateAvatar = async (req: Request, res: Response) => {
  const imageUrl = req.body.cloudinaryUrl;

  if (!imageUrl) {
    throw new CustomError("No files uploaded", 400);
  }

  const user = await User.findByIdAndUpdate(req.user, {
    avatar: imageUrl,
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  res.standardResponse(200, "Avatar updated", { avatar: imageUrl });
};

export const updateBanner = async (req: Request, res: Response) => {
  const imageUrl = req.body.cloudinaryUrl;

  if (!imageUrl) {
    throw new CustomError("No files uploaded", 400);
  }

  const user = await User.findByIdAndUpdate(req.user, {
    banner: imageUrl,
  });

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  res.standardResponse(200, "Banner updated", { banner: imageUrl });
};
