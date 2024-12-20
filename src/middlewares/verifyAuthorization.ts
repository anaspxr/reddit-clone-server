import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../lib/customErrors";
import { createAccessToken } from "../lib/jwt";

export const verifyAuthorization = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token: string = req.cookies.token;

    if (!token)
      throw new CustomError("Unauthorized", 401, { code: "NO_TOKEN" });

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new CustomError("Internal server error", 500);
    }

    // verify access token
    jwt.verify(token, secret, (error, decoded) => {
      // if token is valid, set the user id in the request object and move to the next middleware
      if (decoded) {
        const { userId } = decoded as { userId: string };
        req.user = userId;
        next();
        return;
      }

      if (error) {
        //if token is expired, verify refresh token and issue new access token
        const refreshToken: string = req.cookies.refreshToken;
        if (!refreshToken) {
          throw new CustomError("Unauthorized", 401, {
            code: "NO_TOKEN",
          });
        }

        jwt.verify(refreshToken, secret, (error, decodedRT) => {
          // issue new access token
          if (decodedRT) {
            const { userId } = decodedRT as { userId: string };
            const newToken = createAccessToken(userId, secret);

            // set the new token in the cookie
            res.cookie("token", newToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "none",
            });

            // set the user id in the request object and move to the next middleware
            req.user = userId;
            next();
            return;
          }
          // if there are any errors, tell the user to login again
          if (error) {
            if (error instanceof jwt.TokenExpiredError) {
              throw new CustomError("TOKEN_EXPIRED", 401);
            }
            throw new CustomError("Unauthorized", 401, {
              code: "INVALID_TOKEN",
            });
          }
        });
      }
    });
  } catch (error) {
    next(error);
  }
};
