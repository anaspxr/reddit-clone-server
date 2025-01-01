import { Router } from "express";
import { verifyAuthorization } from "../middlewares/verifyAuthorization";
import errorCatch from "../lib/errorCatch";
import {
  createComment,
  deleteComment,
  reactToComment,
} from "../controllers/commentController";

const commentRouter = Router();

commentRouter.use(verifyAuthorization);
commentRouter.post("/", errorCatch(createComment));
commentRouter.put("/react", errorCatch(reactToComment));
commentRouter.delete("/:commentId", errorCatch(deleteComment));

export default commentRouter;
