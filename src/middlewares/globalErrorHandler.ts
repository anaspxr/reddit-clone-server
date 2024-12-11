import { NextFunction, Request } from "express";
import { CustomError } from "../lib/customErrors";
import { CustomResponse } from "../lib/types";

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: CustomResponse,
  _next: NextFunction
) => {
  if (process.env.NODE_ENV === "development") console.error(err); // logs the error to the console if the environment is development

  if (err instanceof CustomError) {
    res.standardResponse(err.statusCode, err.message, err.data);
    return;
  }

  if (err.message) {
    res.standardResponse(500, err.message);
    return;
  }

  res.standardResponse(500, "Internal Server Error");
  return;
};

export default globalErrorHandler;
