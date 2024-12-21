import { v2 as cloudinary } from "cloudinary";
import multer, { Multer } from "multer";
import { NextFunction, Request, Response } from "express";
import sharp from "sharp";
import { CustomError } from "../lib/customErrors";
import { ENV } from "../configs/env";

const imageTypes = ["image/jpeg", "image/png", "image/jpg"];
const videoTypes = ["video/mp4", "video/mkv", "video/avi"];

cloudinary.config({
  cloud_name: ENV.CLOUDINARY.CLOUD_NAME,
  api_key: ENV.CLOUDINARY.API_KEY,
  api_secret: ENV.CLOUDINARY.API_SECRET,
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
  (width: number, height: number, folder: "avatars" | "banners") =>
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
          folder: `reddit-clone/${folder}`,
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

export const uploadMultiple = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const cloudinaryUrls: string[] = [];
  const public_ids: string[] = []; // used to delete all the assets if one of the files fails to upload

  try {
    const files: CloudinaryFile[] | undefined = req.files as
      | CloudinaryFile[]
      | undefined;

    if (!files || files.length === 0) {
      next();
      return;
    }

    for (const file of files) {
      if (
        !imageTypes.includes(file.mimetype) &&
        !videoTypes.includes(file.mimetype)
      ) {
        throw new CustomError(`Invalid file format: ${file.mimetype}`, 400);
      }

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          folder: "test",
        },
        (error, result) => {
          if (error) {
            throw new CustomError(error.message, 500);
          }
          if (!result) {
            throw new CustomError("Upload failed", 500);
          }

          cloudinaryUrls.push(result.secure_url);
          public_ids.push(result.public_id);

          if (cloudinaryUrls.length === files.length) {
            uploadStream.end(file.buffer);
            req.body.cloudinaryUrls = cloudinaryUrls;
            return next();
          }
        }
      );
      uploadStream.end(file.buffer);
    }
  } catch (error) {
    if (public_ids.length > 0) {
      cloudinary.api
        .delete_resources(public_ids) // clearing the uploaded assets if any errors
        .then(() => next(error))
        .catch(() => next(error)); // catching the possible error here or server will probably crash if any error occurred!
    } else {
      next(error);
    }
  }
};
