import { Request, Response, NextFunction } from "express";
import { connectToFtp } from "../libs/ftp";
import { asyncHandler } from "../utils/exceptions";
import { logger } from "../utils/logger";
import path from "path";
import fs from "fs";
import { createFolder } from "../utils/filesystem";

export const processFFtpRequest = asyncHandler(
  async (req: Request, res: Response) => {
    const client = await connectToFtp();
    logger.info("Processing FTP request with data");

    client.trackProgress((info) => {
      logger.info(`Transferred ${info.bytes} bytes`);
    });

    // List last file from the FTP server
    const files = await client.list();
    const lastFile = files[files.length - 1];

    createFolder("public/ftp");

    await client.downloadTo(
      path.join("public/ftp", lastFile.name),
      lastFile.name
    );

    logger.info(`Downloaded file: ${lastFile.name} to public/ftp`);

    res.status(200).json({
      message: "FTP request processed successfully",
      data: req.body,
    });
  }
);
