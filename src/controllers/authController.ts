import { Response, Request } from "express";
import {
  loginSchema,
  otpSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../lib/bodyValidation/auth";
import { IUser, User } from "../models/userModel";
import { Otp } from "../models/otpModel";
import { CustomError } from "../lib/customErrors";
import { createAccessToken, createRefreshToken } from "../lib/jwt";
import bcrypt from "bcryptjs";
import { HydratedDocument } from "mongoose";
import otpGenerator from "otp-generator";
import { sendChangePasswordMail, sendRegisterOtpMail } from "../lib/mailSender";
import { ENV } from "../configs/env";

// send otp to email for registration
export const sendOtpForRegister = async (req: Request, res: Response) => {
  const { email } = otpSchema.parse(req.params);

  const emailExists = await User.findOne({ email });

  if (emailExists) {
    throw new CustomError("Email already exists, Please login", 400);
  }

  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

  await Otp.findOneAndDelete({ email }); // delete any existing otp for the email if it exists

  await Otp.create({ email, otp, expiresAt });

  await sendRegisterOtpMail(email, otp);

  res.standardResponse(200, "OTP sent to email");
};

// verify otp that was sent to email
export const verifyOtp = async (req: Request, res: Response) => {
  const { email, otp } = verifyOtpSchema.parse(req.body);

  const otpDoc = await Otp.findOne({ email });

  if (!otpDoc) {
    throw new CustomError("OTP not found", 400);
  }

  if (otpDoc.verified) {
    throw new CustomError("OTP already verified", 400);
  }

  if (otpDoc.expiresAt < new Date()) {
    throw new CustomError("OTP expired", 400);
  }

  if (otpDoc.otp !== otp) {
    throw new CustomError("OTP is incorrect", 400);
  }

  await otpDoc.updateOne({ verified: true });

  res.standardResponse(200, "OTP verified");
};

// register the user with verified email
export const userRegister = async (req: Request, res: Response) => {
  const { email, password, username } = registerSchema.parse(req.body);

  const usernameExists = await User.findOne({ username });

  if (usernameExists) {
    throw new CustomError("Username already exists", 400);
  }

  const emailExists = await User.findOne({ email });

  if (emailExists) {
    throw new CustomError("Email already exists", 400);
  }

  const otpVerified = await Otp.findOne({ email, verified: true });

  if (!otpVerified) {
    throw new CustomError("Email not verified", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    email,
    password: hashedPassword,
    username,
  });

  const token = createAccessToken(user._id.toString(), ENV.JWT_SECRET);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  const refreshToken = createRefreshToken(user._id.toString(), ENV.JWT_SECRET);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.standardResponse(201, "User created", { username, email });
};

// user login
export const userLogin = async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  let user: HydratedDocument<IUser> | null = null;
  // the user can login with either email or username
  if (email.includes("@")) {
    user = await User.findOne({ email });
  } else {
    user = await User.findOne({ username: email });
  }

  if (!user) {
    throw new CustomError("User not found!", 400);
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword) {
    throw new CustomError("Password is Incorrect!", 400);
  }

  const token = createAccessToken(user._id.toString(), ENV.JWT_SECRET);

  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  const refreshToken = createRefreshToken(user._id.toString(), ENV.JWT_SECRET);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  {
    const { username, email, avatar } = user.toObject();

    res.standardResponse(200, "User logged in", {
      username,
      email,
      avatar,
    });
  }
};

//
export const userLogout = async (req: Request, res: Response) => {
  res.cookie("token", "", {
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.cookie("refreshToken", "", {
    maxAge: 0,
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.standardResponse(200, "User logged out");
};

export const sendResetPasswordOtp = async (req: Request, res: Response) => {
  const { email } = otpSchema.parse(req.params);

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError("User not found", 400);
  }

  const otp = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  const expiresAt = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes

  await Otp.findOneAndDelete({ email });
  await Otp.create({ email, otp, expiresAt });
  await sendChangePasswordMail(email, otp);

  res.standardResponse(200, "OTP sent to email");
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, newPassword } = resetPasswordSchema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError("User not found", 400);
  }

  const otpVerified = await Otp.findOne({ email, verified: true });
  if (!otpVerified) {
    throw new CustomError("Email not verified", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  await user.updateOne({ password: hashedPassword });

  res.standardResponse(200, "Password reset");
};
