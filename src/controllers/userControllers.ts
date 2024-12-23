import {
  aboutSchema,
  changePasswordSchema,
  displayNameSchema,
} from "../lib/bodyValidation/userProfile";
import { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../lib/customErrors";
import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../configs/env";
import { Follows } from "../models/followModel";

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

  // extracting the public id of the previous avatar asset
  const publicId =
    user.avatar?.includes("cloudinary") &&
    `${ENV.CLOUDINARY.FOLDER}/avatars/${user.avatar.split("/").pop()?.split(".")[0]}`;
  // findByIdAndUpdate() method returns the user before the update. so we can access the previous avatar url
  if (publicId) {
    // deleting the previous avatar asset from cloudinary
    await cloudinary.uploader.destroy(publicId);
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

  // extracting the public id of the previous banner asset
  const publicId =
    user.banner?.includes("cloudinary") &&
    `${ENV.CLOUDINARY.FOLDER}/banners/${user.banner.split("/").pop()?.split(".")[0]}`;
  if (publicId) {
    // deleting the previous banner asset from cloudinary
    await cloudinary.uploader.destroy(publicId);
  }
  res.standardResponse(200, "Banner updated", { banner: imageUrl });
};

export const followUser = async (req: Request, res: Response) => {
  const { username } = req.params;
  const user = await User.findOne({ username: username });

  if (!user) {
    throw new CustomError("User not found", 404);
  }
  const isAlreadyFollowing = await Follows.findOne({
    follower: req.user,
    following: user._id,
  });
  if (isAlreadyFollowing) {
    throw new CustomError("Already following", 400);
  }

  await Follows.create({
    follower: req.user,
    following: user._id,
  });

  res.standardResponse(200, "User followed");
};

export const unFollowUser = async (req: Request, res: Response) => {
  const { username } = req.params;
  const user = await User.findOne({ username: username });
  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const isFollowing = await Follows.findOne({
    follower: req.user,
    following: user._id,
  });
  if (!isFollowing) {
    throw new CustomError("Not following", 400);
  }

  await Follows.findOneAndDelete({
    follower: req.user,
    following: user._id,
  });

  res.standardResponse(200, "User unfollowed");
};
