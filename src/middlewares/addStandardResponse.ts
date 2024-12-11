import { Request, NextFunction, Response } from "express";

const addStandardResponse = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  res.standardResponse = (
    statusCode: number,
    message: string,
    data: unknown
  ) => {
    // This function receives the response object along with other response data and sends a standard response.
    const body = {
      status:
        statusCode < 400 ? "success" : statusCode >= 500 ? "error" : "fail",
      statusCode,
      message,
      data,
    };
    res.status(statusCode).json(body);
  };
  next();
};

export default addStandardResponse;
