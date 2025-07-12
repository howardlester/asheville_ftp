import express from "express";
import { ftpRoutes } from "./routes/ftpRoutes";
import { errorHandler } from "./middlewares/errorHandler";
import { makeApiRoute } from "./utils/routeUtils";

const app = express();

app.use(express.json());

// Routes
app.use(makeApiRoute("ftp"), ftpRoutes);

// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
