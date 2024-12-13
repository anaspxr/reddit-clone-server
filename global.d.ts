// Extend the Express Response object to include a standardResponse method.
// Extend Request object to include a user property.

declare namespace Express {
  export interface Response {
    standardResponse: (
      statusCode: number,
      message: string,
      data: unknown
    ) => void;
  }
  export interface Request {
    user?: string;
  }
}
