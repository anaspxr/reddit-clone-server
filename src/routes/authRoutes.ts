import { Router } from "express";
import errorCatch from "../lib/errorCatch";
import { userLogin, userRegister } from "../controllers/authController";

const authRouter = Router();

authRouter.post("/register", errorCatch(userRegister));
authRouter.post("/login", errorCatch(userLogin));

export default authRouter;
