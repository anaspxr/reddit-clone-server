import { Response, Request } from "express";
import { loginSchema, registerSchema } from "../lib/bodyValidation/auth";
import { IUser, User } from "../models/userModel";
import { CustomError } from "../lib/customErrors";
import { createAccessToken, createRefreshToken } from "../lib/jwt";
import bcrypt from "bcryptjs";
import { HydratedDocument } from "mongoose";

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

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await User.create({
    email,
    password: hashedPassword,
    username,
  });

  const token = createAccessToken(user._id.toString());

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  const refreshToken = createRefreshToken(user._id.toString());

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  const { password: _, ...userData } = user.toObject();

  res.standardResponse(201, "User created", userData);
};

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

  const token = createAccessToken(user._id.toString());

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  const refreshToken = createRefreshToken(user._id.toString());

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  const { password: _, ...userData } = user.toObject();

  res.standardResponse(200, "User logged in", { userData });
};
