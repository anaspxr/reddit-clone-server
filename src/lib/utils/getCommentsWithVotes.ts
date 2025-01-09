import mongoose, { PipelineStage } from "mongoose";
import { Comment } from "../../models/commentModel";

export const getCommentsWithVotes = async (
  initialStages: PipelineStage[] = [],
  user?: string,
  finalStages: PipelineStage[] = []
) => {
  const userObjectId = user ? new mongoose.Types.ObjectId(user) : null;
  const comments = await Comment.aggregate([
    ...initialStages,
    {
      $lookup: {
        from: "reactions", // The collection name for reactions
        localField: "_id",
        foreignField: "post",
        as: "reactions",
      },
    },
    {
      $addFields: {
        upvotes: {
          $size: {
            $filter: {
              input: "$reactions",
              as: "reaction",
              cond: { $eq: ["$$reaction.reaction", "upvote"] },
            },
          },
        },
        downvotes: {
          $size: {
            $filter: {
              input: "$reactions",
              as: "reaction",
              cond: { $eq: ["$$reaction.reaction", "downvote"] },
            },
          },
        },
        currentUserReaction: userObjectId
          ? {
              $arrayElemAt: [
                {
                  $filter: {
                    input: "$reactions",
                    as: "reaction",
                    cond: { $eq: ["$$reaction.user", userObjectId] },
                  },
                },
                0,
              ],
            }
          : null, // If no user is provided, set to null
      },
    },
    {
      $lookup: {
        from: "users", // Collection name for users (creator)
        localField: "creator",
        foreignField: "_id",
        as: "creator",
      },
    },
    {
      $unwind: {
        path: "$creator",
        preserveNullAndEmptyArrays: true, // Allow posts without a creator
      },
    },
    {
      $project: {
        creator: {
          username: "$creator.username",
          avatar: "$creator.avatar",
        },
        title: 1,
        type: 1,
        body: 1,
        upvotes: 1,
        downvotes: 1,
        userReaction: "$currentUserReaction.reaction", // Include only the `reaction` field
        createdAt: 1,
        updatedAt: 1,
      },
    },
    ...finalStages,
  ]);
  return comments;
};
