import "dotenv/config";
import chokidar from "chokidar";
import { logger } from "../utils/logger";
import path from "path";
import fs from "fs";
import * as csv from "fast-csv";
import { createFolder } from "../utils/filesystem";
import { initializeSentry } from "./sentry";
import { DB_TYPE_ONE } from "../types/db.types";
import { Database } from "../services/database.services";
// C:\FTP
const directoryWithFiles =
  process.env.IS_RUNNING_LOCALLY === "true"
    ? path.join(process.cwd(), "public/ftp")
    : "C:\\FTP\\mckimcreed_testing";
const directoryWithProcessedFiles = path.join(
  process.cwd(),
  "public/ftp_processed"
);

const processCsvFile = async ({
  filePath,
  fileName,
}: {
  filePath: string;
  fileName: string;
}) => {
  logger.info("Processing CSV file:", fileName);

  fs.createReadStream(filePath)
    .pipe(csv.parse({ headers: true }))
    .on("data", async (row: Partial<DB_TYPE_ONE>) => {
      try {
        const headers = Object.keys(row);

        // const data = await Database.getInstance().connection?.query(
        //   "SELECT * from sensors_data;"
        // );
        const dbItem = {
          created_at: row.createdtimestamp,
          hourminute: row.hourminute,
          flow_gpm: row.flow_gpm,
          pressure_psi: row.pressure_psi,
          siteid: row.siteid,
          source: row.source,
        };

        logger.info("Inserting row into database:", dbItem);

        await Database.getInstance()
          .connection?.request()
          .query(
            `INSERT INTO sensors_data (created_at, hourminute, flow_gpm, pressure_psi, siteid, source) 
           VALUES ('${dbItem.created_at}', '${dbItem.hourminute}', ${dbItem.flow_gpm}, ${dbItem.pressure_psi}, '${dbItem.siteid}', '${dbItem.source}')`
          );
      } catch (error) {
        console.error("Error processing row in CSV file:", error);
        logger.error(
          `Error processing row in CSV file: ${fileName}. Details:`,
          error
        );
      }
    })
    .on("end", () => {
      logger.info("CSV file processing completed:", fileName);
      // Move the processed file to the processed directory
      // fs.renameSync(
      //   filePath,
      //   path.join(directoryWithProcessedFiles, fileName)
      // );
    })
    .on("error", (error) => {
      logger.error(`Error processing CSV file: ${fileName}. Details:`, error);
    });
};

export const main = async () => {
  try {
    initializeSentry();

    // Ensure the processed files directory exists
    createFolder(directoryWithProcessedFiles);
    logger.info("Starting FTP watcher on directory:", directoryWithFiles);

    const watcher = chokidar.watch([directoryWithFiles], {
      // ignored: (path, stats) => !stats?.isFile(),
      persistent: true,
    });

    watcher.on("error", () => {
      logger.error(
        "Was unable to watch the FTP directory:",
        directoryWithFiles
      );
    });

    // Process files when they are added to the directory
    watcher.on("add", async (filePath, stats) => {
      // await Database.getInstance().connect();
      if (stats?.isFile()) {
        const fileExtension = path.extname(filePath);
        // Get file extension without dot (e.g., "csv", "txt")
        const fileType = path.extname(filePath).substring(1).toLowerCase();
        const fileName = path.basename(filePath);
        const fileNameWithoutExt = path.basename(filePath, fileExtension);

        logger.info("New file added to FTP directory, processing...", {
          filePath,
          fileName,
          fileType,
          fileExtension,
          fileNameWithoutExt,
        });

        // Example: Process different file types
        switch (fileType) {
          case "csv":
            // await processCsvFile({ filePath, fileName });
            await new Promise<void>(async (resolve, reject) => {
              setTimeout(async () => {
                console.info("Processing CSV file:", fileName);
                resolve();
              }, 2000);
            });
            break;
          case "txt":
            logger.info("Processing TXT file:", fileName);
            // Handle TXT processing
            break;
          default:
            logger.warn(`Unsupported file type: ${fileType}`);
        }
      }
    });
  } catch (error) {
    logger.fatal("Fatal error in FTP watcher:", error);
  }
};

main();
