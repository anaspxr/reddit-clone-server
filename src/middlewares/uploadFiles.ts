import { v2 as cloudinary } from "cloudinary";
import multer, { Multer } from "multer";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";
import sharp from "sharp";
import { CustomError } from "../lib/customErrors";

const imageTypes = ["image/jpeg", "image/png", "image/jpg"];

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface CloudinaryFile extends Express.Multer.File {
  buffer: Buffer;
}

const storage = multer.memoryStorage();

export const upload: Multer = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 20,
    files: 5,
    fieldSize: 20 * 1024 * 1024,
    fields: 5,
    headerPairs: 2000,
    parts: 5,
  },
});

export const uploadSingleImage =
  (width: number, height: number) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const file: CloudinaryFile | undefined = req.file as
        | CloudinaryFile
        | undefined;
      if (!file) {
        next(new CustomError("No image uploaded", 400));
        return;
      }

      if (!imageTypes.includes(file.mimetype)) {
        next(new CustomError(`Invalid image format: ${file.mimetype}`, 400));
        return;
      }

      const resizedBuffer = await sharp(file.buffer)
        .resize(width, height)
        .toBuffer();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: "reddit-clone/avatars",
        },
        (error, result) => {
          if (error) {
            return next(error);
          }
          if (!result) {
            return next(new CustomError("Upload failed", 500));
          }

          uploadStream.end(resizedBuffer);
          req.body.cloudinaryUrl = result.secure_url;
          return next();
        }
      );
      uploadStream.end(resizedBuffer);
    } catch (error) {
      next(error);
    }
  };

export const uploadToCloudinary = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files: CloudinaryFile[] | undefined = req.files as
      | CloudinaryFile[]
      | undefined;
    if (!files || files.length === 0) {
      next();
      return;
    }

    const cloudinaryUrls: string[] = [];
    for (const file of files) {
      const resizedBuffer = await sharp(file.buffer)
        .resize(500, 500)
        .toBuffer();

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "test",
        },
        (error, result) => {
          if (error) {
            return next(error);
          }
          if (!result) {
            return next(new CustomError("Upload failed", 500));
          }

          cloudinaryUrls.push(result.secure_url);

          if (cloudinaryUrls.length === files.length) {
            uploadStream.end(resizedBuffer);
            req.body.cloudinaryUrls = cloudinaryUrls;
            return next();
          }
        }
      );
      uploadStream.end(resizedBuffer);
    }
  } catch (error) {
    next(error);
  }
};
