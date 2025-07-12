import { Router } from "express";
import {processFFtpRequest } from "../controllers/ftpController";

export const ftpRoutes = Router();

ftpRoutes.post("/ftp", processFFtpRequest);
