import "dotenv/config";
import express from "express";
import { ftpRoutes } from "./routes/ftpRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { makeApiRoute } from "./utils/routeUtils";
import "./libs/sentry";
import "./libs/ftp";
import morgan from "morgan";
import pino from "pino";
import path from "path";
import "./utils/logger";

const app = express();

app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use(makeApiRoute("/"), ftpRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
