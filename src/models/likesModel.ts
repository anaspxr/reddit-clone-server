import mongoose from "mongoose";

interface ILikeModel {
  user: mongoose.Schema.Types.ObjectId;
  post: mongoose.Schema.Types.ObjectId;
  upvote: boolean;
}

const likeSchema = new mongoose.Schema<ILikeModel>({
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  post: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
    required: true,
    index: true,
  },
  upvote: { type: Boolean, required: true },
});

export const Likes = mongoose.model<ILikeModel>("Like", likeSchema);
