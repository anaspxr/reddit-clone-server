import { Router } from "express";
import { verifyAuthorization } from "../middlewares/verifyAuthorization";
import {
  acceptJoinRequest,
  cancelJoinRequest,
  changeBanner,
  changeCommunityType,
  changeDescription,
  changeDisplayName,
  changeIcon,
  checkCommunityName,
  createCommunity,
  getCommunityMembers,
  getJoinedCommunities,
  getJoinRequestsCount,
  joinCommunity,
  kickMember,
  leaveCommunity,
  makeModerator,
  rejectJoinRequest,
  revokeModerator,
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
  .post("/cancel-request", errorCatch(cancelJoinRequest))
  .get("/:communityName/members", errorCatch(getCommunityMembers))
  .get(
    "/:communityName/members/requests/count",
    errorCatch(getJoinRequestsCount)
  )
  // community settings
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
  )
  .put("/:communityName/type", errorCatch(changeCommunityType))
  .put("/:communityName/members/:username/moderator", errorCatch(makeModerator))
  .delete(
    "/:communityName/members/:username/moderator",
    errorCatch(revokeModerator)
  )
  .put(
    "/:communityName/members/:username/accept",
    errorCatch(acceptJoinRequest)
  )
  .put(
    "/:communityName/members/:username/reject",
    errorCatch(rejectJoinRequest)
  )
  .delete("/:communityName/members/:username", errorCatch(kickMember));

export default communityRoutes;
