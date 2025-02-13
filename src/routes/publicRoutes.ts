import { Router } from "express";
import {
  getCommentsOfPost,
  getCommunities,
  getCommunity,
  getCommunityPosts,
  getFeed,
  getPopularCommunities,
  getPost,
  getRepliesOfComment,
  getSearchResults,
  getUserComments,
  getUserPosts,
  getUserProfile,
  search,
  searchUsers,
} from "../controllers/publicControllers";
import errorCatch from "../lib/errorCatch";
import { decodeTokenWithoutErrors } from "../middlewares/verifyAuthorization";

const publicRouter = Router();

publicRouter.use(decodeTokenWithoutErrors); // decode token without throwing errors for getting the req.user object

publicRouter
  .get("/user/:username", errorCatch(getUserProfile))
  .get("/user/:username/posts", errorCatch(getUserPosts))
  .get("/user/:username/comments", errorCatch(getUserComments))
  .get("/community/:name", errorCatch(getCommunity))
  .get("/community/:name/posts", errorCatch(getCommunityPosts))
  .get("/search", errorCatch(search))
  .get("/search/results", errorCatch(getSearchResults))
  .get("/search/users", errorCatch(searchUsers))
  .get("/feed", errorCatch(getFeed))
  .get("/post/:postId", errorCatch(getPost))
  .get("/comment/:postId", errorCatch(getCommentsOfPost))
  .get("/replies/:commentId", errorCatch(getRepliesOfComment))
  .get("/communities", errorCatch(getCommunities))
  .get("/communities/popular", errorCatch(getPopularCommunities));

export default publicRouter;
