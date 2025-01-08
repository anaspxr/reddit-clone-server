import {
  mediaPostValidation,
  postReactSchema,
  textPostValidation,
} from "../lib/bodyValidation/post";
import { CommunityRelation } from "../models/communityRelationModel";
import { Draft, Post } from "../models/postModel";
import { Request, Response } from "express";
import { Reaction } from "../models/reactionModel";
import { CustomError } from "../lib/customErrors";
import { createLikeNotification } from "./notificationController";
import { canPostInCommunity } from "../lib/utils/hasCommunityAccess";

export const createTextPost = async (req: Request, res: Response) => {
  const {
    title,
    body,
    community: communityName,
  } = textPostValidation.parse(req.body);

  const { community } = await canPostInCommunity(communityName, req.user);

  const newPost = await Post.create({
    title,
    type: "text",
    body,
    community: community ? community._id : undefined,
    creator: req.user,
  });

  res.standardResponse(201, "Post created", newPost);
};

export const saveDraftTextPost = async (req: Request, res: Response) => {
  const { title, body } = textPostValidation.parse(req.body);

  const newDraft = await Draft.create({
    title,
    type: "text",
    body,
    creator: req.user,
  });

  res.standardResponse(400, "Draft saved", newDraft);
};

export const createMediaPost = async (req: Request, res: Response) => {
  const {
    title,
    images,
    video,
    community: communityName,
  } = mediaPostValidation.parse(req.body);

  const { community } = await canPostInCommunity(communityName, req.user);

  const newPost = await Post.create({
    title,
    type: "media",
    images,
    video,
    community: community ? community._id : undefined,
    creator: req.user,
  });

  res.standardResponse(201, "Post created", newPost);
};

export const deletePost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    throw new CustomError("Post not found", 404);
  }

  let hasAccess = false;

  if (post.creator.toString() === req.user) {
    hasAccess = true;
  } else {
    const communityRelation = await CommunityRelation.findOne({
      community: post.community,
      user: req.user,
    });
    if (
      communityRelation?.role === "admin" ||
      communityRelation?.role === "moderator"
    ) {
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    throw new CustomError("You don't have permission to delete this post", 403);
  }

  await post.deleteOne();

  res.standardResponse(200, "Post deleted");
};

export const reactToPost = async (req: Request, res: Response) => {
  const { postId, reaction } = postReactSchema.parse(req.body);

  const postExists = await Post.findById(postId);

  if (!postExists) {
    throw new CustomError("Post not found", 404);
  }

  const reactionExists = await Reaction.findOne({
    post: postId,
    user: req.user,
    ref: "Post",
  });

  if (reactionExists) {
    if (reactionExists.reaction === reaction) await reactionExists.deleteOne();
    else
      await reactionExists.updateOne({
        reaction,
      });
  } else {
    await Reaction.create({
      post: postId,
      ref: "Post",
      reaction,
      user: req.user,
    });
  }

  const votes =
    (await Reaction.countDocuments({ post: postId, reaction: "upvote" })) -
    (await Reaction.countDocuments({ post: postId, reaction: "downvote" }));

  await createLikeNotification(postExists.creator.toString(), votes, postId);

  res.standardResponse(200, "Reaction added", { votes });
};
