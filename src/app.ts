import "dotenv/config";
import express from "express";
import { ftpRoutes } from "./routes/ftp.routes";
import { errorHandler } from "./middlewares/errorHandler";
import { makeApiRoute } from "./utils/routeUtils";
import "./libs/sentry";
import "./libs/ftp";
import morgan from "morgan";
import "./utils/logger";
import { etcRoutes } from "./routes/etc.routes";
import { logger, Logger } from "./utils/logger";
const app = express();

app.use(express.static("public"));

app.use(express.json());
app.use(morgan("dev"));

logger.refreshLogger();

// Routes
app.use(makeApiRoute("/"), ftpRoutes);
app.use(makeApiRoute("/"), etcRoutes);

app.get("/", (req, res) => {
  res.send("This API is powered by Source 360 Group");
});

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
