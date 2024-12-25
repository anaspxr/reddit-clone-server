import { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../lib/customErrors";
import { Follows } from "../models/followModel";

export const getUserProfile = async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  const followers = await Follows.countDocuments({
    following: user?._id,
  });
  const following = await Follows.countDocuments({
    follower: user?._id,
  });

  // Check if the logged in user is following the user
  let userIsFollowing = false;
  if (req.user) {
    const follow = await Follows.findOne({
      follower: req.user,
      following: user?._id,
    });
    if (follow) {
      userIsFollowing = true;
    }
  }

  if (!user) {
    throw new CustomError("User not found", 404);
  }

  const { password: _, ...userData } = user.toObject();

  res.standardResponse(200, "User profile fetched successfully", {
    ...userData,
    followers,
    following,
    userIsFollowing,
  });
};
