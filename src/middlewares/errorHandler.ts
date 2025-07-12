import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  logger.fatal("Error occurred:", {
    message: err?.message,
    stack: err?.stack,
    status: err?.status || 500,
  });

  res.status(err?.status || 500).json({
    message: err?.message || "Internal Server Error",
  });
};
