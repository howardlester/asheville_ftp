import { Router } from "express";
import {processFFtpRequest } from "../controllers/ftp.controllers";

export const ftpRoutes = Router();

ftpRoutes.post("/ftp", processFFtpRequest);
