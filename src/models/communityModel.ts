import mongoose, { Schema } from "mongoose";

interface ICommunity {
  name: string;
  displayName: string;
  description: string;
  icon?: string;
  topics: string[];
  type: "public" | "restricted" | "private";
  isBanned: boolean;
  creator: Schema.Types.ObjectId;
  banner?: string;
}

const communitySchema = new Schema<ICommunity>({
  name: { type: String, required: true, unique: true },
  displayName: {
    type: String,
    required: true,
    default: function () {
      return this.name;
    },
  },
  description: { type: String, required: true },
  icon: { type: String },
  banner: { type: String },
  topics: [{ type: String }],
  type: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: "User" },
  isBanned: { type: Boolean, default: false },
});

export const Community = mongoose.model<ICommunity>(
  "Community",
  communitySchema
);
