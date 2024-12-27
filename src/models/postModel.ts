import { model, Schema } from "mongoose";

interface IPost {
  title: string;
  type: "text" | "media" | "link";
  body?: string;
  community?: string;
  media?: string[];
  creator: Schema.Types.ObjectId;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    body: String,
    media: [String],
    community: String,
    creator: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export const Post = model<IPost>("Post", postSchema);
export const Draft = model<IPost>("Draft", postSchema);
