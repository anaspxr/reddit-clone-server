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
