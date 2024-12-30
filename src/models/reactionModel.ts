import mongoose from "mongoose";

interface IReactionModel {
  user: mongoose.Schema.Types.ObjectId;
  ref: "Comment" | "Post";
  post: mongoose.Schema.Types.ObjectId;
  reaction: "upvote" | "downvote";
}

const reactionSchema = new mongoose.Schema<IReactionModel>({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  ref: {
    type: String,
    required: true,
    enum: ["Comment", "Post"],
  },
  post: {
    type: mongoose.Types.ObjectId,
    refPath: "ref",
    required: true,
    index: true,
  },
  reaction: { type: String, required: true },
});

export const Reaction = mongoose.model<IReactionModel>(
  "Reaction",
  reactionSchema
);
