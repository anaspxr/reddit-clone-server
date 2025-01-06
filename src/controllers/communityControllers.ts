import {
  communityNameSchema,
  createCommunitySchema,
  kickMemberSchema,
} from "../lib/bodyValidation/community";
import { Community } from "../models/communityModel";
import { CommunityRelation } from "../models/communityRelationModel";
import { Request, Response } from "express";
import { User } from "../models/userModel";
import { displayNameSchema } from "../lib/bodyValidation/userProfile";
import { hasCommunityAccess } from "../lib/utils/hasCommunityAccess";

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
    community: community._id,
    user: req.user,
    role: "admin",
  });

  res.standardResponse(201, "Community created", community);
};

// check if the community name is already taken
export const checkCommunityName = async (req: Request, res: Response) => {
  const { name } = communityNameSchema.parse(req.query);

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

export const getJoinedCommunities = async (req: Request, res: Response) => {
  const communities = await CommunityRelation.find({
    user: req.user,
  }).populate("community", "name icon");

  const data = communities.map((community) => community.community);

  res.standardResponse(200, "User's communities", data);
};

export const joinCommunity = async (req: Request, res: Response) => {
  const { name } = communityNameSchema.parse(req.body);

  const community = await Community.findOne({ name });

  if (!community) {
    res.standardResponse(404, "Community not found!");
    return;
  }

  const relation = await CommunityRelation.findOne({
    community: community._id,
    user: req.user,
  });

  if (relation) {
    res.standardResponse(400, "User already in community!");
    return;
  }

  await CommunityRelation.create({
    community: community._id,
    user: req.user,
    role: "member",
  });

  res.standardResponse(201, "User joined community!");
};

export const leaveCommunity = async (req: Request, res: Response) => {
  const { name } = communityNameSchema.parse(req.body);
  const community = await Community.findOne({
    name,
  });
  if (!community) {
    res.standardResponse(404, "Community not found");
    return;
  }

  await CommunityRelation.deleteOne({
    community: community._id,
    user: req.user,
  });

  res.standardResponse(200, "User left community");
};

export const kickMember = async (req: Request, res: Response) => {
  const { communityName, username } = kickMemberSchema.parse(req.params);
  const { community } = await hasCommunityAccess(communityName, req.user);

  const user = await User.findOne({ username });
  if (!user) {
    res.standardResponse(404, "User not found");
    return;
  }

  await CommunityRelation.deleteOne({
    community: community._id,
    user: user._id,
  });
  res.standardResponse(200, "User kicked from community");
};

//* community settings

export const changeDisplayName = async (req: Request, res: Response) => {
  const { communityName } = req.params;
  const { community } = await hasCommunityAccess(communityName, req.user);
  const { displayName } = displayNameSchema.parse(req.body);

  await community.updateOne({ displayName });

  res.standardResponse(200, "Display name updated", community);
};

export const changeDescription = async (req: Request, res: Response) => {
  const { communityName } = req.params;
  const { community } = await hasCommunityAccess(communityName, req.user);
  const { description } = req.body;

  await community.updateOne({ description });

  res.standardResponse(200, "Description updated", community);
};

export const changeIcon = async (req: Request, res: Response) => {
  const { communityName } = req.params;
  const { community } = await hasCommunityAccess(communityName, req.user);
  const icon = req.body.cloudinaryUrl;

  await community.updateOne({ icon });

  res.standardResponse(200, "Icon updated", community);
};

export const changeBanner = async (req: Request, res: Response) => {
  const { communityName } = req.params;
  const { community } = await hasCommunityAccess(communityName, req.user);
  const banner = req.body.cloudinaryUrl;

  await community.updateOne({ banner });

  res.standardResponse(200, "Banner updated", community);
};

export const getCommunityMembers = async (req: Request, res: Response) => {
  const { communityName } = req.params;
  const { community } = await hasCommunityAccess(communityName, req.user);

  const members = await CommunityRelation.find({
    community: community._id,
  }).populate("user", "username avatar");

  res.standardResponse(200, "Community members", {
    ...community.toObject(),
    members,
  });
};
