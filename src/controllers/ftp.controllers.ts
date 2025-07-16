import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../utils/exceptions";
import { logger } from "../utils/logger";
import path from "path";
import fs from "fs";
import { createFolder } from "../utils/filesystem";

export const processFFtpRequest = asyncHandler(
  async (req: Request, res: Response) => {
    res.status(200).json({
      message: "FTP request processed successfully",
      data: req.body,
    });
  }
);
