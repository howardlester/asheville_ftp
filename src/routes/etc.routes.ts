import { Router } from "express";
import { formatLogs } from "../controllers/log.controllers";

export const etcRoutes = Router();

etcRoutes.get("/logs/:year/:month/:day", formatLogs);
