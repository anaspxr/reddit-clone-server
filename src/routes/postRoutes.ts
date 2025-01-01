import { Router } from "express";
import errorCatch from "../lib/errorCatch";
import {
  createMediaPost,
  createTextPost,
  deletePost,
  reactToPost,
  saveDraftTextPost,
} from "../controllers/postController";
import { verifyAuthorization } from "../middlewares/verifyAuthorization";

const postRouter = Router();

postRouter.use(verifyAuthorization);

postRouter.post("/text", errorCatch(createTextPost));
postRouter.post("/draft/text", errorCatch(saveDraftTextPost));
postRouter.post("/media", errorCatch(createMediaPost));
postRouter.put("/react", errorCatch(reactToPost)); // for upvote / downvote
postRouter.delete("/:postId", errorCatch(deletePost));

export default postRouter;
