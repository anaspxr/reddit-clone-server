// relation ship between community and user

import { model, Schema } from "mongoose";

interface ICommunityRelationModel {
  communityId: string;
  userId: string;
  role: "admin" | "moderator" | "member" | "follower" | "banned";
}

const communityRelationSchema = new Schema<ICommunityRelationModel>({
  communityId: { type: String, required: true },
  userId: { type: String, required: true },
  role: { type: String, required: true },
});

export const CommunityRelation = model<ICommunityRelationModel>(
  "CommunityRelation",
  communityRelationSchema
);
