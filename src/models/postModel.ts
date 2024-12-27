import { model, Schema } from "mongoose";

interface IPost {
  title: string;
  type: "text" | "media" | "link";
  body?: string;
  community?: Schema.Types.ObjectId;
  images?: string[];
  video?: string;
  creator: Schema.Types.ObjectId;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    body: String,
    images: [String],
    video: String,
    community: { type: Schema.Types.ObjectId, ref: "Community" },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export const Post = model<IPost>("Post", postSchema);
export const Draft = model<IPost>("Draft", postSchema);
