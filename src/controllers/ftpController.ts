import { Request, Response, NextFunction } from "express";

export const processFFtpRequest = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(200).json({
    message: "FTP request processed successfully",
    data: req.body,
  });
};
