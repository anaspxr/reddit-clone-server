import { Router } from "express";
import { getUserProfile } from "../controllers/publicControllers";
import errorCatch from "../lib/errorCatch";
import { decodeTokenWithoutErrors } from "../middlewares/verifyAuthorization";

const publicRouter = Router();

publicRouter.use(decodeTokenWithoutErrors); // decode token without throwing errors for getting the req.user object

publicRouter.get("/user/:username", errorCatch(getUserProfile));

export default publicRouter;
