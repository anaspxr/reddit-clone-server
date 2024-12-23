import { model, Schema } from "mongoose";

export interface IFollow {
  follower: Schema.Types.ObjectId;
  following: Schema.Types.ObjectId;
}

const followSchema = new Schema<IFollow>(
  {
    follower: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    following: { type: Schema.Types.ObjectId, required: true },
  },
  {
    timestamps: true,
  }
);

export const Follows = model<IFollow>("Follow", followSchema);
