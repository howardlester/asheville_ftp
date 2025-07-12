import { NextFunction, Request, Response } from "express";

export class FTPError extends Error {
  status: number;
  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = "FTPError";
  }
}

export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
