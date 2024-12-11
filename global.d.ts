// Extend the Express Response object to include a standardResponse method.

declare namespace Express {
  export interface Response {
    standardResponse: (
      statusCode: number,
      message: string,
      data: unknown
    ) => void;
  }
}
