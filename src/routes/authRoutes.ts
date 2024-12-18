import { Router } from "express";
import errorCatch from "../lib/errorCatch";
import {
  sendOtpForRegister,
  userLogin,
  userLogout,
  userRegister,
  verifyOtpForRegister,
} from "../controllers/authController";

const authRouter = Router();

authRouter.get("/register/:email", errorCatch(sendOtpForRegister)); // send otp to email for registration
authRouter.post("/register/verify", errorCatch(verifyOtpForRegister)); // verify otp that was sent to email
authRouter.post("/register", errorCatch(userRegister));
authRouter.post("/login", errorCatch(userLogin));
authRouter.get("/logout", errorCatch(userLogout));

export default authRouter;
