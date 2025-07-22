import { CSV_TYPE_1, CSV_TYPE_2 } from "../types/db.types";
import { logger } from "../utils/logger";
import fs from "fs";
import * as csv from "fast-csv";
import { Database } from "../services/database.services";
import { DateTime } from "luxon";
import path from "path";
import { createFolder } from "../utils/filesystem";
import {
  directoryWithProcessedFTPFiles,
  moveAfterProcessing,
} from "../constants/ftpConstants";
import { ParentFolderNameInFTP } from "../types/filesystem";

interface SensorDataType {
  TYPE1: Partial<CSV_TYPE_1>;
  TYPE2: Partial<CSV_TYPE_2>;
}

export const processCsvFile = async ({
  filePath,
  fileName,
  parentFolderName,
}: {
  filePath: string;
  fileName: string;
  parentFolderName?: ParentFolderNameInFTP;
}) => {
  const rows: (Partial<CSV_TYPE_1> | Partial<CSV_TYPE_2>)[] = [];
  const db = await Database.getInstance().connect();
  let sensorDataType: keyof SensorDataType;
  let logDbQuery = true;
  // Prevent processing of files with no headers the same way as those with headers
  const hasHeaders = parentFolderName !== "isoildata";

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: hasHeaders }))
      .on("data", async (row: Partial<CSV_TYPE_1>) => {
        const isObject =
          typeof row === "object" && row !== null && row.constructor === Object;
        const isArray = Array.isArray(row);

        if (isObject) {
          // Determine the sensor data type based on the row content
          sensorDataType = "TYPE1";
          rows.push({
            createdtimestamp: row?.createdtimestamp,
            hourminute: row?.hourminute,
            flow_gpm: row?.flow_gpm,
            pressure_psi: row?.pressure_psi,
            siteid: row?.siteid,
            source: row?.source,
          });
        } else if (parentFolderName === "isoildata" && isArray) {
          const formattedRow = row[0].split(";");
          // Manage ISOIL data
          rows.push({
            no: formattedRow[0],
            date: formattedRow[1],
            time: formattedRow[2],
            tTotalizer: formattedRow[3],
            pTotalizer: formattedRow[4],
            tNetTotalizer: formattedRow[5],
            pNetTotalizer: formattedRow[6],
            flowRate: formattedRow[7],
            flowRatePercent: formattedRow[8],
            alarms: formattedRow[9],
            lossOfCurrent: formattedRow[10],
            timeRiseA: formattedRow[11],
            timeRiseB: formattedRow[12],
            sensorTestErrorCode: formattedRow[13],
            voltageElectrodeE1: formattedRow[14],
            voltageElectrodeE2: formattedRow[15],
            e1e2DifferentialVoltage: formattedRow[16],
            commonModeVoltage: formattedRow[17],
            lowFrequencyNoise: formattedRow[18],
            highFrequencyNoise: formattedRow[19],
            resistanceOnElectrode1: formattedRow[20],
            resistanceOnElectrode2: formattedRow[21],
            coilsExcitationCurrent: formattedRow[22],
            resistanceOfExcitationCircuit: formattedRow[23],
            temperatureSensorCoils: formattedRow[24],
            analogInput1: formattedRow[25],
            analogInput2: formattedRow[26],
            cpuTemperature: formattedRow[27],
            na1: formattedRow[28],
            supplyVoltageAnalogPlus: formattedRow[29],
            supplyVoltageAnalogMinus: formattedRow[30],
            na2: formattedRow[31],
            na3: formattedRow[32],
            umVAndBatteryVolt: formattedRow[33],
            batteryChargePercent: formattedRow[34],
            checksum: formattedRow[35],
          });
          sensorDataType = "TYPE2";
        }
      })
      .on("end", () => {
        // Organize files by day/month/year
        // Move the processed file to the processed directory
        if (rows.length && moveAfterProcessing) {
          const today = DateTime.now().toUTC();
          const day = today.toFormat("dd");
          const month = today.toFormat("MMM").toLowerCase();
          const year = today.toFormat("yyyy");
          const dir = path.join(
            directoryWithProcessedFTPFiles,
            year,
            month,
            day,
            parentFolderName || "unknown"
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

  const chunkSize = 20000;

  const processType1File = async () => {
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize) as Partial<CSV_TYPE_1>[];
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
    }
  };

  const processType2File = async () => {
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize) as Partial<CSV_TYPE_2>[];
      const values = chunk.map((item) => item);

      // Convert each item to a string for SQL insertion
      // Adjust as necessary for your database schema
      const valuesString = values
        .map(
          (item) =>
            `(${Object.values(item)
              .map((value) => `'${value}'`)
              .join(", ")})`
        )
        .join(", ");

      // Take the keys from the first object as column names
      const columnsString = Object.keys(rows[0]).join(", ");

      await db.query(
        `INSERT INTO sensors_data (${columnsString}) VALUES ${valuesString};`
      );
    }
  };
  // @ts-ignore
  switch (sensorDataType) {
    case "TYPE1":
      await processType1File();
      break;
    case "TYPE2":
      await processType2File();
      break;
    default:
      logDbQuery = false;
      // @ts-expect-error
      sensorDataType = "UNKNOWN";

      logger.error("Sensor data type not recognized, skipping insert", {
        fileName,
        filePath,
        // @ts-ignore sensorDataType variable is set in the if statement
        sensorDataType,
        rowsCount: rows.length,
        parentFolderName,
      });
      break;
  }

  logger.info(
    // @ts-ignore sensorDataType variable is set in the if statement
    `Inserted ${rows.length} rows into sensors_data for file ${fileName}. Sensor type: ${sensorDataType}`
  );
  try {
  } catch (error: any) {
    logger.error(
      `Error inserting chunk into database for file ${fileName}. Details: ${JSON.stringify(error)}`
    );
  }

  db.close();
};
