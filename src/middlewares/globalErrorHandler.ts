import { NextFunction, Request } from "express";
import { CustomError } from "../lib/customErrors";
import { CustomResponse } from "../lib/types";
import { handleZodErrors } from "../lib/handleErrors";
import { ZodError } from "zod";
import { ENV } from "../configs/env";

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: CustomResponse,
  _next: NextFunction
) => {
  if (ENV.NODE_ENV === "development") console.error(err); // logs the error to the console if the environment is development

  if (err instanceof CustomError) {
    // handle custom errors we throw from controllers
    res.standardResponse(err.statusCode, err.message, err.data);
  } else if (err instanceof ZodError) {
    // handle zod errors (possibly from body validation)
    const { data, message, statusCode } = handleZodErrors(err);
    res.standardResponse(statusCode, message, data);
  } else {
    res.standardResponse(500, "Internal Server Error");
    return;
  }
};

export default globalErrorHandler;
