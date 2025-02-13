import { Community } from "../../models/communityModel";
import { CommunityRelation } from "../../models/communityRelationModel";
import { CustomError } from "../customErrors";

// check if the user has access to the community to change settings or other admin/moderator actions
export const hasCommunityAccess = async (
  communityName: string,
  userId?: string
) => {
  const community = await Community.findOne({
    name: communityName,
  });

  if (!community) {
    throw new CustomError("Community not found", 404);
  }

  const userRole = await CommunityRelation.findOne({
    community: community._id,
    user: userId,
  });

  if (!userRole || userRole.role === "member") {
    // if user is not admin or moderator of the community
    throw new CustomError("Unauthorized", 403);
  }

  return { community, userRole };
};

export const canViewPost = async (communityName: string, userId?: string) => {
  const community = await Community.findOne({
    name: communityName,
  });

  if (!community) {
    throw new CustomError("Community not found", 404);
  }

  // if community is public or restricted then user can view the post
  if (community.type !== "private") return { community };

  const userRole = await CommunityRelation.findOne({
    community: community._id,
    user: userId,
  });

  if (!userRole || userRole.role === "pending") {
    // if user is not a member of the community
    throw new CustomError("Unauthorized", 403, "PRIVATE_COMMUNITY");
  }

  return { community };
};

export const canPostInCommunity = async (
  communityName?: string | null,
  userId?: string
) => {
  if (!communityName) {
    return { community: null };
  }

  const community = await Community.findOne({
    name: communityName,
  });

  if (!community) {
    throw new CustomError("Community not found", 404);
  }

  if (community.type === "public") return { community };

  const userRole = await CommunityRelation.findOne({
    community: community._id,
    user: userId,
  });

  if (!userRole || userRole.role === "pending") {
    // if user is not a member of the community
    throw new CustomError(
      `You are not a member of this ${community.type} community!!`,
      403
    );
  }

  return { community, userRole };
};
