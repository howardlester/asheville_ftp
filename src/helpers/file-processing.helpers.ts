import { AYEKA_CSV } from "../types/db.types";
import { logger } from "../utils/logger";
import fs from "fs";
import * as csv from "fast-csv";
import { Database } from "../services/database.services";

interface SensorDataType {
  AV: AYEKA_CSV;
}

export const processCsvFile = async ({
  filePath,
  fileName,
}: {
  filePath: string;
  fileName: string;
}) => {
  logger.info("Processing CSV file:", fileName);
  const rows: Partial<AYEKA_CSV>[] = [];
  const db = await Database.getInstance().connect();
  let sensorDataType: keyof SensorDataType;
  let moveAfterProcessing = false;

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on("data", async (row: Partial<AYEKA_CSV>) => {
        rows.push(row);

        if (row.siteid) {
          sensorDataType = "AV";
        }
      })
      .on("end", () => {
        // Move the processed file to the processed directory
        if (moveAfterProcessing) {
          // fs.renameSync(
          //   filePath,
          //   path.join(directoryWithProcessedFiles, fileName)
          // );
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

  const chunkSize = 500;

  // @ts-ignore
  switch (sensorDataType) {
    case "AV":
      for (let i = 0; i < rows.length; i += chunkSize) {
        const chunk = rows.slice(i, i + chunkSize);
        const values = chunk.map((item) => ({
          created_at: item.createdtimestamp,
          hourminute: item.hourminute,
          flow_gpm: item.flow_gpm,
          pressure_psi: item.pressure_psi,
          siteid: item.siteid,
          source: item.source,
        }));

        const valuesString = values
          .map(
            (item) =>
              `('${item.created_at}', '${item.hourminute}', ${item.flow_gpm}, ${item.pressure_psi}, '${item.siteid}', '${item.source}')`
          )
          .join(", ");
        await db.query(
          `INSERT INTO sensors_data (created_at, hourminute, flow_gpm, pressure_psi, siteid, source) VALUES ${valuesString};`
        );

        logger.info(
          `Inserted ${values.length} rows into sensors_data for file ${fileName}`
        );
      }
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
