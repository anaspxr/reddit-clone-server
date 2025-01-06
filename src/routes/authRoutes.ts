import { Router } from "express";
import errorCatch from "../lib/errorCatch";
import {
  resetPassword,
  sendOtpForRegister,
  sendResetPasswordOtp,
  userLogin,
  userLogout,
  userRegister,
  verifyOtp,
} from "../controllers/authController";

const authRouter = Router();

authRouter
  .get("/register/:email", errorCatch(sendOtpForRegister)) // send otp to email for registration
  .post("/verify-otp", errorCatch(verifyOtp)) // verify otp that was sent to email
  .post("/register", errorCatch(userRegister))
  .post("/login", errorCatch(userLogin))
  .get("/logout", errorCatch(userLogout))
  .get("/reset-password/:email", errorCatch(sendResetPasswordOtp))
  .post("/reset-password", errorCatch(resetPassword));

export default authRouter;
