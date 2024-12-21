import { Router } from "express";
import { verifyAuthorization } from "../middlewares/verifyAuthorization";
import {
  changePassword,
  hydrateUser,
  updateAbout,
  updateAvatar,
  updateBanner,
  updateDisplayName,
} from "../controllers/userControllers";
import errorCatch from "../lib/errorCatch";
import { upload, uploadSingleImage } from "../middlewares/uploadFiles";

const userRouter = Router();

userRouter.use(verifyAuthorization);

userRouter.get("/hydrate", errorCatch(hydrateUser)); // get user data for initial hydration
userRouter.put("/displayname", errorCatch(updateDisplayName));
userRouter.put("/about", errorCatch(updateAbout));
userRouter.put(
  "/avatar",
  upload.single("image"),
  uploadSingleImage(500, 500, "avatars"),
  errorCatch(updateAvatar)
);
userRouter.put(
  "/banner",
  upload.single("image"),
  uploadSingleImage(1500, 500, "banners"),
  errorCatch(updateBanner)
);
userRouter.put("/password", errorCatch(changePassword));

export default userRouter;
