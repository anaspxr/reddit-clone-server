import {
  mediaPostValidation,
  textPostValidation,
} from "../lib/bodyValidation/post";
import { Community } from "../models/communityModel";
import { CommunityRelation } from "../models/communityRelationModel";
import { Draft, Post } from "../models/postModel";
import { Request, Response } from "express";

export const createTextPost = async (req: Request, res: Response) => {
  const { title, body, community } = textPostValidation.parse(req.body);

  const communityExists = await Community.exists({ name: community });

  const newPost = await Post.create({
    title,
    type: "text",
    body,
    community: communityExists ? communityExists._id : undefined,
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
  const { title, images, video, community } = mediaPostValidation.parse(
    req.body
  );

  const communityExists = await Community.exists({ name: community });

  const newPost = await Post.create({
    title,
    type: "media",
    images,
    video,
    community: communityExists ? communityExists._id : undefined,
    creator: req.user,
  });

  res.standardResponse(201, "Post created", newPost);
};

export const deletePost = async (req: Request, res: Response) => {
  const { postId } = req.params;

  const post = await Post.findById(postId);

  if (!post) {
    res.standardResponse(404, "Post not found!");
    return;
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
    res.standardResponse(401, "Unauthorized");
    return;
  }
};
