// relation ship between community and user

import mongoose, { model, Schema } from "mongoose";

interface ICommunityRelationModel {
  community: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId;
  role: "admin" | "moderator" | "member" | "follower";
}

const communityRelationSchema = new Schema<ICommunityRelationModel>(
  {
    community: {
      type: mongoose.Types.ObjectId,
      ref: "Community",
      required: true,
    },
    user: { type: mongoose.Types.ObjectId, ref: "User", required: true },
    role: { type: String, required: true },
  },
  { timestamps: true }
);

export const CommunityRelation = model<ICommunityRelationModel>(
  "CommunityRelation",
  communityRelationSchema
);
