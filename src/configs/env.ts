import dotenv from "dotenv";

dotenv.config();

// Check if the required environment variables are defined (for type safety)
if (process.env.JWT_SECRET === undefined) {
  throw new Error("env: JWT_SECRET is not defined");
}

if (process.env.MONGO_URI === undefined) {
  throw new Error("env: MONGO_URI is not defined");
}

export const ENV = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  CLOUDINARY: {
    CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    API_KEY: process.env.CLOUDINARY_API_KEY,
    API_SECRET: process.env.CLOUDINARY_API_SECRET,
  },
  MAIL: {
    USER: process.env.MAIL_USER,
    PASS: process.env.MAIL_PASS,
  },
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:8080",
};

// log error if any of the other variables are not defined
const otherVariables = [
  "PORT",
  "NODE_ENV",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "CLIENT_URL",
  "MAIL_USER",
  "MAIL_PASS",
];

otherVariables.forEach((variable) => {
  if (process.env[variable] === undefined) {
    console.error(`${variable} is not defined`);
  }
});
