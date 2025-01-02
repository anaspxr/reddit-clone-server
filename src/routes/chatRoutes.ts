import { Router } from "express";
import { getChat, getChattedPeople } from "../controllers/chatController";
import { verifyAuthorization } from "../middlewares/verifyAuthorization";
import errorCatch from "../lib/errorCatch";

const chatRouter = Router();

chatRouter.use(verifyAuthorization);

chatRouter.get("/", errorCatch(getChat));
chatRouter.get("/people", errorCatch(getChattedPeople));

export default chatRouter;
