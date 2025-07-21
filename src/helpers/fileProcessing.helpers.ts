import { CSV_TYPE_1 } from "../types/db.types";
import { logger } from "../utils/logger";
import fs from "fs";
import * as csv from "fast-csv";
import { Database } from "../services/database.services";
import { DateTime } from "luxon";
import path from "path";
import { directoryWithProcessedFTPFiles } from "../config/ftp.config";
import { createFolder } from "../utils/filesystem";

interface SensorDataType {
  TYPE1: Partial<CSV_TYPE_1>;
}

export const processCsvFile = async ({
  filePath,
  fileName,
}: {
  filePath: string;
  fileName: string;
}) => {
  logger.info("Processing CSV file:", fileName);
  const rows: Partial<CSV_TYPE_1>[] = [];
  const db = await Database.getInstance().connect();
  let sensorDataType: keyof SensorDataType;
  let moveAfterProcessing = true;

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on("data", async (row: Partial<CSV_TYPE_1>) => {
        rows.push(row);

        console.info('row', row);

        // Determine the sensor data type based on the row content
        // if (row.siteid) {
        sensorDataType = "TYPE1";
        // }
      })
      .on("end", () => {
        // Organize files by day/month/year
        // Move the processed file to the processed directory
        if (moveAfterProcessing) {
          const today = DateTime.now().toUTC();
          const day = today.toFormat("dd");
          const month = today.toFormat("MMM").toLowerCase();
          const year = today.toFormat("yyyy");
          const dir = path.join(
            directoryWithProcessedFTPFiles,
            year,
            month,
            day
          );

          // Make sure the directory exists
          createFolder(dir);

          fs.renameSync(filePath, path.join(dir, fileName));
        }
        resolve();
      })
      .on("error", (error) => {
        const errorMessage = `Error processing CSV file: ${fileName}. Details: ${error.message}`;

        logger.error(errorMessage);
        reject(errorMessage);
      });
  });

  logger.info(
    `CSV file processed successfully: ${fileName} - ${rows.length} rows`
  );

  const chunkSize = 20000;

  const processType1File = async () => {
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const values = chunk.map((item) => ({
        createdtimestamp: item.createdtimestamp,
        hourminute: item.hourminute,
        flow_gpm: item.flow_gpm,
        pressure_psi: item.pressure_psi,
        siteid: item.siteid,
        source: item.source,
      }));

      const valuesString = values
        .map(
          (item) =>
            `('${item.createdtimestamp}', '${item.hourminute}', ${item.flow_gpm}, ${item.pressure_psi}, '${item.siteid}', '${item.source}')`
        )
        .join(", ");
      // await db.query(
      //   `INSERT INTO sensors_data (createdtimestamp, hourminute, flow_gpm, pressure_psi, siteid, source) VALUES ${valuesString};`
      // );

      logger.info(
        `Inserted ${values.length} rows into sensors_data for file ${fileName}`
      );
    }
  };

  // @ts-ignore
  switch (sensorDataType) {
    case "TYPE1":
      processType1File();
      break;
    default:
      logger.error("Sensor data type not recognized, skipping insert.");
      break;
  }
  try {
  } catch (error: any) {
    logger.error(
      `Error inserting chunk into database for file ${fileName}. Details: ${JSON.stringify(error)}`
    );
  }

  db.close();
};
