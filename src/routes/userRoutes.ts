import { Router } from "express";
import { verifyAuthorization } from "../middlewares/verifyAuthorization";
import {
  changePassword,
  updateDisplayName,
} from "../controllers/userControllers";
import errorCatch from "../lib/errorCatch";

const userRouter = Router();

userRouter.use(verifyAuthorization);

userRouter.patch("/displayname", errorCatch(updateDisplayName));
userRouter.patch("/password", errorCatch(changePassword));

export default userRouter;
