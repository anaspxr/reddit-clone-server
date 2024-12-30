import { Request, Response } from "express";
import {
  createCommentSchema,
  postReactSchema,
} from "../lib/bodyValidation/post";
import { Comment } from "../models/commentModel";
import { Reaction } from "../models/reactionModel";
import { getCommentsWithVotes } from "../lib/utils/getCommentsWithVotes";
import mongoose from "mongoose";

export const createComment = async (req: Request, res: Response) => {
  const { body, postId, parentComment } = createCommentSchema.parse(req.body);

  const comment = await (
    await Comment.create({
      body,
      creator: req.user,
      post: postId,
      parentComment,
    })
  ).populate("creator", "username avatar displayName");

  res.standardResponse(201, "Comment created", {
    ...comment.toObject(),
    upvotes: 0,
    downvotes: 0,
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

export const reactToComment = async (req: Request, res: Response) => {
  const { postId, reaction } = postReactSchema.parse(req.body);

  const reactionExists = await Reaction.findOne({
    post: postId,
    user: req.user,
    ref: "Comment",
  });

  if (reactionExists) {
    if (reactionExists.reaction === reaction) await reactionExists.deleteOne();
    else
      await reactionExists.updateOne({
        reaction,
      });
  } else {
    await Reaction.create({
      ref: "Comment",
      post: postId,
      reaction,
      user: req.user,
    });
  }

  const votes =
    (await Reaction.countDocuments({ post: postId, reaction: "upvote" })) -
    (await Reaction.countDocuments({ post: postId, reaction: "downvote" }));

  res.standardResponse(200, "Reaction added", { votes });
};
