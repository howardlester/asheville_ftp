import fs from "fs";
import { logger } from "./logger";

export const createFolder = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    logger.info(`Created directory: ${folderPath}`);
  }
};
