import "dotenv/config";
import chokidar from "chokidar";
import { logger } from "./utils/logger";
import path from "path";
import { createFolder } from "./utils/filesystem";
import { initializeSentry } from "./libs/sentry";
import PQueue from "p-queue";
import { processCsvFile } from "./helpers/fileProcessing.helpers";
import { directoryWithProcessedFTPFiles } from "./config/ftp.config";

// Set up a queue to process files sequentially
const queue = new PQueue({ concurrency: 1 });

const directoryWithFiles =
  process.env.IS_RUNNING_LOCALLY === "true"
    ? path.join(process.cwd(), "public/ftp")
    : "C:\\FTP";

const limitFilesProcessing = 2;
const filesProcessed: string[] = [];

export const main = async () => {
  try {
    initializeSentry();

    // Ensure the processed files directory exists
    createFolder(directoryWithProcessedFTPFiles);
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
      const processAddedFile = async () => {
        if (
          limitFilesProcessing > 0 &&
          limitFilesProcessing !== Infinity &&
          filesProcessed.length >= limitFilesProcessing
        ) {
          logger.info("File processing limit reached, skipping:", filePath);
          return;
        }

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
              try {
                await processCsvFile({ filePath, fileName });
              } catch (error) {
                logger.error(`Error processing CSV file: ${fileName}`, error);
              }
              break;
            case "txt":
              logger.info("Processing TXT file:", fileName);
              // Handle TXT processing
              break;
            default:
              logger.warn(`Unsupported file type: ${fileType}`);
          }
        }
      };

      // Add the file processing to the queue

      queue.add(() => processAddedFile());

      filesProcessed.push(filePath);
    });
  } catch (error) {
    logger.fatal("Fatal error in FTP watcher:", error);
  }
};

main();
