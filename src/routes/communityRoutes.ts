import { Router } from "express";
import { verifyAuthorization } from "../middlewares/verifyAuthorization";
import {
  checkCommunityName,
  createCommunity,
  getJoinedCommunities,
} from "../controllers/communityControllers";
import errorCatch from "../lib/errorCatch";
import { upload, uploadMultiple } from "../middlewares/uploadFiles";

const communityRoutes = Router();

communityRoutes.use(verifyAuthorization);

communityRoutes.post(
  "/",
  upload.array("images"),
  uploadMultiple,
  errorCatch(createCommunity)
);
communityRoutes.get("/check", errorCatch(checkCommunityName));
communityRoutes.get("/joined", errorCatch(getJoinedCommunities));

export default communityRoutes;
