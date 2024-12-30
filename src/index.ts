import express from "express";
import cors from "cors";
import connectDb from "./configs/connectDb";
import addStandardResponse from "./middlewares/addStandardResponse";
import authRouter from "./routes/authRoutes";
import { CustomError } from "./lib/customErrors";
import globalErrorHandler from "./middlewares/globalErrorHandler";
import userRouter from "./routes/userRoutes";
import publicRouter from "./routes/publicRoutes";
import cookieParser from "cookie-parser";
import postRouter from "./routes/postRoutes";
import { ENV } from "./configs/env";
import communityRoutes from "./routes/communityRoutes";
import commentRouter from "./routes/commentRoutes";

const app = express();

app.use(
  cors({
    origin: ENV.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(addStandardResponse);

app.use("/api/auth", authRouter);
app.use("/api/public", publicRouter); // handle public routes that does not require authentication
app.use("/api/user", userRouter);
app.use("/api/post", postRouter);
app.use("/api/community", communityRoutes);
app.use("/api/comment", commentRouter);

app.use("*", (req, res, next) => {
  next(new CustomError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

connectDb();

app.listen(ENV.PORT, () => {
  console.log(
    `Server is running on ${ENV.NODE_ENV === "development" ? "http://localhost:" : "Port "}${ENV.PORT}`
  );
});
