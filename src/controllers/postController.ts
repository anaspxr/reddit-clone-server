import {
  mediaPostValidation,
  textPostValidation,
} from "../lib/bodyValidation/post";
import { Community } from "../models/communityModel";
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
