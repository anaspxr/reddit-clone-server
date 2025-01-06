import { Router } from "express";
import { verifyAuthorization } from "../middlewares/verifyAuthorization";
import {
  changeBanner,
  changeDescription,
  changeDisplayName,
  changeIcon,
  checkCommunityName,
  createCommunity,
  getJoinedCommunities,
  joinCommunity,
  kickMember,
  leaveCommunity,
} from "../controllers/communityControllers";
import errorCatch from "../lib/errorCatch";
import {
  upload,
  uploadMultiple,
  uploadSingleImage,
} from "../middlewares/uploadFiles";

const communityRoutes = Router();

communityRoutes.use(verifyAuthorization);

communityRoutes
  .post(
    "/",
    upload.array("images"),
    uploadMultiple,
    errorCatch(createCommunity)
  )
  .get("/check", errorCatch(checkCommunityName))
  .get("/joined", errorCatch(getJoinedCommunities))
  .post("/join", errorCatch(joinCommunity))
  .post("/leave", errorCatch(leaveCommunity))
  .post("/kick", errorCatch(kickMember))
  .put("/:communityName/displayname", errorCatch(changeDisplayName))
  .put("/:communityName/description", errorCatch(changeDescription))
  .put(
    "/:communityName/icon",
    upload.single("image"),
    uploadSingleImage(500, 500, "avatars"),
    errorCatch(changeIcon)
  )
  .put(
    "/:communityName/banner",
    upload.single("image"),
    uploadSingleImage(1500, 500, "banners"),
    errorCatch(changeBanner)
  );

export default communityRoutes;
