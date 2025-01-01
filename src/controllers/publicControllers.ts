import { Request, Response } from "express";
import { User } from "../models/userModel";
import { CustomError } from "../lib/customErrors";
import { Follows } from "../models/followModel";
import { Community } from "../models/communityModel";
import { CommunityRelation } from "../models/communityRelationModel";
import { Post } from "../models/postModel";
import { getPostsWithVotes } from "../lib/utils/getPostsWithVotes";
import { Reaction } from "../models/reactionModel";
import { Comment } from "../models/commentModel";
import { getCommentsWithVotes } from "../lib/utils/getCommentsWithVotes";
import mongoose from "mongoose";

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

  const posts = await getPostsWithVotes(
    [
      {
        $match: { creator: user._id },
      },
      { $sort: { createdAt: -1 } },
    ],
    req.user
  );

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

  const posts = await getPostsWithVotes(
    [
      {
        $match: { community: community._id },
      },
      { $sort: { createdAt: -1 } },
    ],
    req.user
  );

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

export const getFeed = async (req: Request, res: Response) => {
  const { type } = req.query;

  const user = req.user;

  let feed = [];

  if (type === "popular") {
    feed = await getPostsWithVotes([], req.user, [
      { $sort: { upvotes: -1 } },
      { $limit: 10 },
    ]);
  } else if (user) {
    const userCommunities = (await CommunityRelation.find({ user })).map(
      ({ community }) => community
    );
    feed = await getPostsWithVotes(
      [
        {
          $match: { community: { $in: userCommunities } },
        },
        { $sort: { createdAt: -1 } },
        { $limit: 10 },
      ],
      req.user
    );
  } else {
    feed = await getPostsWithVotes(
      [{ $sort: { createdAt: -1 } }, { $limit: 10 }],
      req.user
    );
  }
  res.standardResponse(200, "Feed fetched", feed);
};

export const getPost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  const post = await Post.findById(postId)
    .populate("creator", "username avatar displayName")
    .populate("community", "name icon");

  if (!post) {
    res.standardResponse(404, "Post not found");
    return;
  }

  const userReaction = (
    await Reaction.findOne({
      post: postId,
      user: req.user,
    })
  )?.reaction;

  const commentCount = await Comment.countDocuments({ post: postId });

  const upvotes = await Reaction.countDocuments({
    post: postId,
    reaction: "upvote",
  });

  const downvotes = await Reaction.countDocuments({
    post: postId,
    reaction: "downvote",
  });

  res.standardResponse(200, "Post found", {
    ...post.toObject(),
    userReaction,
    upvotes,
    downvotes,
    commentCount,
  });
};

export const getCommentsOfPost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  const comments = await getCommentsWithVotes(
    [
      { $match: { post: new mongoose.Types.ObjectId(postId) } },
      { $sort: { createdAt: -1 } },
    ],
    req.user
  );
  res.standardResponse(200, "Comments fetched", comments);
};

export const getCommunities = async (req: Request, res: Response) => {
  const userObjectId = req.user ? new mongoose.Types.ObjectId(req.user) : null;

  const communities = await Community.aggregate([
    {
      $lookup: {
        from: "communityrelations",
        localField: "_id",
        foreignField: "community",
        as: "communityRelations",
      },
    },
    {
      $addFields: {
        userRelation: userObjectId
          ? {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$communityRelations",
                    as: "relation",
                    cond: { $eq: ["$$relation.user", userObjectId] },
                  },
                },
                0,
              ],
            }
          : null,
      },
    },
    {
      $project: {
        name: 1,
        displayName: 1,
        icon: 1,
        description: 1,
        memberCount: {
          $size: "$communityRelations",
        },
        role: "$userRelation.role",
      },
    },
  ]);

  res.standardResponse(200, "Communities retrieved", communities);
};

export const getUserComments = async (req: Request, res: Response) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  if (!user) {
    res.standardResponse(404, "User not found");
    return;
  }

  const comments = await getCommentsWithVotes(
    [
      {
        $match: { creator: user._id },
      },
      { $sort: { createdAt: -1 } },
    ],
    req.user
  );

  res.standardResponse(200, "Comments retrieved", comments);
};

export const getSearchResults = async (req: Request, res: Response) => {
  const { query = "", type } = req.query;
  const userObjectId = req.user ? new mongoose.Types.ObjectId(req.user) : null;

  let result = [];

  switch (type) {
    case "post": {
      result = await getPostsWithVotes(
        [
          {
            $match: {
              $or: [
                { title: { $regex: query, $options: "i" } },
                { body: { $regex: query, $options: "i" } },
              ],
            },
          },
        ],
        req.user
      );
      break;
    }

    case "community": {
      result = await Community.aggregate([
        {
          $match: {
            $or: [
              { name: { $regex: query, $options: "i" } },
              { displayName: { $regex: query, $options: "i" } },
            ],
          },
        },
        {
          $lookup: {
            from: "communityrelations",
            localField: "_id",
            foreignField: "community",
            as: "communityRelations",
          },
        },
        {
          $addFields: {
            userRelation: userObjectId
              ? {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$communityRelations",
                        as: "relation",
                        cond: { $eq: ["$$relation.user", userObjectId] },
                      },
                    },
                    0,
                  ],
                }
              : null,
          },
        },
        {
          $project: {
            name: 1,
            displayName: 1,
            icon: 1,
            description: 1,
            memberCount: {
              $size: "$communityRelations",
            },
            role: "$userRelation.role",
          },
        },
      ]);

      break;
    }

    case "user": {
      result = await User.find({
        $or: [
          { username: { $regex: query, $options: "i" } },
          { displayName: { $regex: query, $options: "i" } },
        ],
      })
        .limit(2)
        .select("username avatar displayName");
      break;
    }

    default: {
      throw new CustomError(
        "Invalid type. expected post, community or user",
        400
      );
    }
  }

  res.standardResponse(200, "Search results", result);
};
