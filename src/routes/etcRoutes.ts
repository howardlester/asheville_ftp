import { Router } from "express";
import { formatLogs } from "../controllers/logController";

export const etcRoutes = Router();

etcRoutes.get("/logs/:year/:month/:day", formatLogs);
