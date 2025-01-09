import { SortTypes } from "../types";
import { PipelineStage } from "mongoose";

export default function getSortStages(sort: SortTypes): PipelineStage[] {
  switch (sort) {
    case "week":
      return [
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        },
        { $sort: { upvotes: -1 } },
      ];
    case "month":
      return [
        {
          $match: {
            createdAt: {
              $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
        },
        { $sort: { upvotes: -1 } },
      ];
    case "recent":
      return [
        {
          $sort: { createdAt: -1 },
        },
      ];
    default:
      return [{ $sort: { upvotes: -1 } }];
  }
}
