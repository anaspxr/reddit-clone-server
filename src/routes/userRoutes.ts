import { Router } from "express";
import { verifyAuthorization } from "../middlewares/verifyAuthorization";
import {
  changePassword,
  hydrateUser,
  updateAbout,
  updateDisplayName,
} from "../controllers/userControllers";
import errorCatch from "../lib/errorCatch";

const userRouter = Router();

userRouter.use(verifyAuthorization);

userRouter.get("/hydrate", errorCatch(hydrateUser)); // get user data for initial hydration
userRouter.put("/displayname", errorCatch(updateDisplayName));
userRouter.put("/about", errorCatch(updateAbout));
userRouter.put("/password", errorCatch(changePassword));

export default userRouter;
