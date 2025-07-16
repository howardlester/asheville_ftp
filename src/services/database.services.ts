import "dotenv/config";
import mssql, { ConnectionPool } from "mssql";
import { logger } from "../utils/logger";

export class Database {
  private static instance: Database;
  public connection: mssql.ConnectionPool | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<ConnectionPool> {
    // if (this.isConnected) {
    //   return;
    // }

    if (!process.env.DB_CONNECTION_STRING) {
      logger.fatal(
        "Database connection string is not defined in environment variables."
      );
    }

    try {
      const response = await mssql.connect({
        user: process.env.DB_USER || "sqladmin",
        password: process.env.DB_PASSWORD || "4iFWe6YT5I#C",
        server:
          process.env.DB_SERVER || "ashevillesqlserver123.database.windows.net",
        database: process.env.DB_DATABASE || "sensordb01",
        connectionTimeout: 1000 * 60,
        requestTimeout: 1000 * 60 * 10,
        pool: {
          max: 50,
          min: 0,
          idleTimeoutMillis: 1000 * 60,
        },
      });

      this.connection = response;
      this.isConnected = true;
      logger.info("Database connection established successfully.");
      return response;
    } catch (error) {
      logger.fatal("Database connection failed:", error);
      throw error;
    }
  }
}
