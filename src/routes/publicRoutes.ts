import { Router } from "express";
import {
  getCommunity,
  getCommunityPosts,
  getFeed,
  getPost,
  getUserPosts,
  getUserProfile,
  search,
} from "../controllers/publicControllers";
import errorCatch from "../lib/errorCatch";
import { decodeTokenWithoutErrors } from "../middlewares/verifyAuthorization";

const publicRouter = Router();

publicRouter.use(decodeTokenWithoutErrors); // decode token without throwing errors for getting the req.user object

publicRouter.get("/user/:username", errorCatch(getUserProfile));
publicRouter.get("/user/:username/posts", errorCatch(getUserPosts));
publicRouter.get("/community/:name", errorCatch(getCommunity));
publicRouter.get("/community/:name/posts", errorCatch(getCommunityPosts));
publicRouter.get("/search", errorCatch(search));
publicRouter.get("/feed", errorCatch(getFeed));
publicRouter.get("/post/:postId", errorCatch(getPost));

export default publicRouter;
