import { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../lib/customErrors";
import { Follows } from "../models/followModel";
import { Community } from "../models/communityModel";
import { CommunityRelation } from "../models/communityRelationModel";
import { Post } from "../models/postModel";

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

export const getCommunity = async (req: Request, res: Response) => {
  const { name } = req.params;

  const community = await Community.findOne({ name });

  if (!community) {
    res.standardResponse(404, "Community not found!");
    return;
  }

  const role = (
    await CommunityRelation.findOne({
      community: community?._id,
      user: req.user,
    })
  )?.role;

  res.standardResponse(200, "Community found", {
    ...community.toObject(),
    role,
  });
};

export const getUserPosts = async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) {
    res.standardResponse(404, "User not found");
    return;
  }

  const posts = await Post.find({ creator: user.id })
    .sort({ createdAt: -1 })
    .populate("creator", "username avatar displayName")
    .populate("community", "name icon");
  res.standardResponse(200, "Posts retrieved", posts);
};

export const getPosts = async (req: Request, res: Response) => {
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("creator", "username avatar displayName")
    .populate("community", "name icon");
  res.standardResponse(200, "Posts retrieved", posts);
};

export const getCommunityPosts = async (req: Request, res: Response) => {
  const { name } = req.params;

  const community = await Community.findOne({
    name,
  });

  if (!community) {
    res.standardResponse(404, "Community not found");
    return;
  }

  const posts = await Post.find({ community: community._id })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("creator", "username avatar displayName")
    .populate("community", "name icon");

  res.standardResponse(200, "Posts retrieved", posts);
};

export const search = async (req: Request, res: Response) => {
  const { query = "" } = req.query;

  const users = await User.find({
    $or: [
      { username: { $regex: query, $options: "i" } },
      { displayName: { $regex: query, $options: "i" } },
    ],
  })
    .limit(2)
    .select("username avatar displayName");

  const communities = await Community.find({
    name: { $regex: query, $options: "i" },
    displayName: { $regex: query, $options: "i" },
  })
    .limit(4)
    .select("name icon displayName");

  res.standardResponse(200, "Search results", { users, communities });
};
