import { Router } from "express";
import { verifyAuthorization } from "../middlewares/verifyAuthorization";
import {
  changePassword,
  deleteAccount,
  followUser,
  getSocketPass,
  hydrateUser,
  unFollowUser,
  updateAbout,
  updateAvatar,
  updateBanner,
  updateDisplayName,
} from "../controllers/userControllers";
import errorCatch from "../lib/errorCatch";
import { upload, uploadSingleImage } from "../middlewares/uploadFiles";
import {
  getUsersNotifications,
  markAllAsRead,
  markAsRead,
} from "../controllers/notifcationController";

const userRouter = Router();

userRouter.use(verifyAuthorization);

userRouter
  .get("/hydrate", errorCatch(hydrateUser)) // get user data for initial hydrationuserRouter
  .get("/socket-pass", errorCatch(getSocketPass))
  .put("/displayname", errorCatch(updateDisplayName))
  .put("/about", errorCatch(updateAbout))
  .put(
    "/avatar",
    upload.single("image"),
    uploadSingleImage(500, 500, "avatars"),
    errorCatch(updateAvatar)
  )
  .put(
    "/banner",
    upload.single("image"),
    uploadSingleImage(1500, 500, "banners"),
    errorCatch(updateBanner)
  )
  .put("/password", errorCatch(changePassword))
  .post("/:username/follow", errorCatch(followUser))
  .delete("/:username/follow", errorCatch(unFollowUser))
  .get("/notifications", errorCatch(getUsersNotifications))
  .put("/notifications/:id/read", errorCatch(markAsRead))
  .put("/notifications/read-all", errorCatch(markAllAsRead))
  .post("/delete-account", errorCatch(deleteAccount));

export default userRouter;
