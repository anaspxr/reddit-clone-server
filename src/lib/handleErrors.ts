import { ZodError } from "zod";

export const handleZodErrors = (error: ZodError) => {
  const errors = error.errors.map((err) => {
    return {
      field: err.path.join("."),
      message: err.message,
    };
  });
  return {
    statusCode: 400,
    message: "Validation Error",
    data: errors,
  };
};
