import { Response } from "express";

export interface CustomResponse extends Response {
  standardResponse: (
    statusCode: number,
    message: string,
    data?: unknown
  ) => void;
}

export type SortTypes = "week" | "month" | "allTime" | "recent";
