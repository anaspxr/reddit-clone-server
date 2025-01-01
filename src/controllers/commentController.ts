import { Request, Response } from "express";
import {
  createCommentSchema,
  postReactSchema,
} from "../lib/bodyValidation/post";
import { Comment } from "../models/commentModel";
import { Reaction } from "../models/reactionModel";
import { CustomError } from "../lib/customErrors";

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

export const deleteComment = async (req: Request, res: Response) => {
  const { commentId } = req.params;

  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new CustomError("Comment not found", 404);
  }

  if (comment.creator.toString() !== req.user) {
    throw new CustomError("You are not authorized to delete this comment", 403);
  }

  await comment.deleteOne();

  res.standardResponse(200, "Comment deleted");
};
