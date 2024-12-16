import { Router } from "express";
import errorCatch from "../lib/errorCatch";
import {
  userLogin,
  userLogout,
  userRegister,
} from "../controllers/authController";

const authRouter = Router();

authRouter.post("/register", errorCatch(userRegister));
authRouter.post("/login", errorCatch(userLogin));
authRouter.get("/logout", errorCatch(userLogout));

export default authRouter;
