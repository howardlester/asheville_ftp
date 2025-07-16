import mssql from "mssql";
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

  public async connect(): Promise<void> {
    if (this.isConnected) {
      return;
    }

    try {
      const response = await mssql.connect(
        process.env.DB_CONNECTION_STRING as string
      );
      this.connection = response;

      this.isConnected = true;
      logger.info("Database connection established successfully.");
    } catch (error) {
      logger.fatal("Database connection failed:", error);
      throw error;
    }
  }
}
