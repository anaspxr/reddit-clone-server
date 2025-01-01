import { Router } from "express";
import {
  getCommentsOfPost,
  getCommunities,
  getCommunity,
  getCommunityPosts,
  getFeed,
  getPost,
  getSearchResults,
  getUserComments,
  getUserPosts,
  getUserProfile,
  search,
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
  .get("/feed", errorCatch(getFeed))
  .get("/post/:postId", errorCatch(getPost))
  .get("/comment/:postId", errorCatch(getCommentsOfPost))
  .get("/communities", errorCatch(getCommunities));

export default publicRouter;
