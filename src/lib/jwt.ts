import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { CustomError } from "./customErrors";

dotenv.config();

const secret = process.env.JWT_SECRET || "";

export const createAccessToken = (userId: string) => {
  return jwt.sign({ userId }, secret, { expiresIn: "1h" });
};

export const createRefreshToken = (userId: string) => {
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
};

export const verifyToken = (token: string) => {
  const userId = jwt.verify(token, secret, (error) => {
    if (error) {
      if (error.name === "TokenExpiredError") {
        throw new CustomError("Token expired", 401, { code: "token_expired" });
      }
      throw new CustomError(error.message, 401);
    }
  });

  if (typeof userId !== "string") {
    throw new CustomError("Invalid token data", 500);
  }
  return userId;
};
