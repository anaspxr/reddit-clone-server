import { Router } from "express";
import { verifyAuthorization } from "../middlewares/verifyAuthorization";
import {
  changeDisplayName,
  checkCommunityName,
  createCommunity,
  getJoinedCommunities,
  joinCommunity,
  kickMember,
  leaveCommunity,
} from "../controllers/communityControllers";
import errorCatch from "../lib/errorCatch";
import { upload, uploadMultiple } from "../middlewares/uploadFiles";

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
  .post("/:communityName/displayname", errorCatch(changeDisplayName));

export default communityRoutes;
