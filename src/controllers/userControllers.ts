import { displayNameSchema } from "../lib/bodyValidation/userProfile";
import { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../lib/customErrors";

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

export const getUserProfile = async (req: Request, res: Response) => {
  const user = await User.findById(req.user);

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  res.standardResponse(200, "User profile", user);
};
