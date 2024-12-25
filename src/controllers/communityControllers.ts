import { createCommunitySchema } from "../lib/bodyValidation/community";
import { Community } from "../models/communityModel";
import { CommunityRelation } from "../models/communityRelationModel";
import { Request, Response } from "express";

export const createCommunity = async (req: Request, res: Response) => {
  const { name, description, type } = createCommunitySchema.parse(req.body);

  const community = await Community.create({
    name,
    description,
    icon: req.body.cloudinaryUrls ? req.body.cloudinaryUrls[1] : undefined,
    banner: req.body.cloudinaryUrls ? req.body.cloudinaryUrls[0] : undefined,
    type,
    creator: req.user,
  });

  await CommunityRelation.create({
    communityId: community._id,
    userId: req.user,
    role: "admin",
  });

  res.standardResponse(201, "Community created", community);
};

// check if the community name is already taken
export const checkCommunityName = async (req: Request, res: Response) => {
  const { name } = req.query;

  if (!name) {
    res.standardResponse(400, "Community name is required!");
    return;
  }

  const community = await Community.findOne({ name });

  if (community) {
    res.standardResponse(200, "Community name already taken!", "TAKEN");
  } else {
    res.standardResponse(200, "Community name available!", "AVAILABLE");
  }
};
