import { Router } from "express";
import { verifyAuthorization } from "../middlewares/verifyAuthorization";
import {
  checkCommunityName,
  createCommunity,
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

export default communityRoutes;
