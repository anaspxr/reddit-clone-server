import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDb from "./configs/connectDb";
import addStandardResponse from "./middlewares/addStandardResponse";
import authRouter from "./routes/authRoutes";
import { CustomError } from "./lib/customErrors";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./routes/userRoutes";
import publicRouter from "./routes/publicRoutes";
import cookieParser from "cookie-parser";

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(addStandardResponse);

app.use("/api/auth", authRouter);
app.use("/api/public", publicRouter); // handle public routes that does not require authentication
app.use("/api/user", userRouter);

app.use("*", (req, res, next) => {
  next(new CustomError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

connectDb();

app.listen(port, () => {
  console.log(
    `Server is running on ${process.env.NODE_ENV === "development" ? "http://localhost:" : "Port "}${port}`
  );
});
