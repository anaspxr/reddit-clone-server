import { Router } from "express";
import { upload, uploadToCloudinary } from "../middlewares/uploadFiles";
import { Request, Response } from "express";
import errorCatch from "../lib/errorCatch";

const postRouter = Router();

postRouter.post(
  "/upload",
  upload.array("images", 5),
  uploadToCloudinary,
  errorCatch(async (req: Request, res: Response) => {
    const cloudinaryUrls: string[] = req.body.cloudinaryUrls || [];
    if (cloudinaryUrls.length === 0) {
      console.error("No Cloudinary URLs found.");
      throw new Error("No Cloudinary URLs found.");
    }
    const images = cloudinaryUrls;
    res.send(images);
  })
);

export default postRouter;
