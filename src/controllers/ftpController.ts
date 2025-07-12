import { Request, Response, NextFunction } from "express";
import { connectToFtp } from "../libs/ftp";
import { asyncHandler } from "../utils/exceptions";
import { logger } from "../utils/logger";

export const processFFtpRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const client = await connectToFtp();

    // console.info("Processing FTP request with data:", req.body);
    logger.info("Processing FTP request with data:", req.body);

    client.close();

    res.status(200).json({
      message: "FTP request processed successfully",
      data: req.body,
    });
  }
);
