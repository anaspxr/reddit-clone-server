import { Router } from "express";
import { getUserProfile } from "../controllers/publicControllers";
import errorCatch from "../lib/errorCatch";

const publicRouter = Router();

publicRouter.get("/user/:username", errorCatch(getUserProfile));

export default publicRouter;
