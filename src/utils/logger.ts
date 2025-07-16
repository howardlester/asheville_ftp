import pino from "pino";
import path from "path";
import fs from "fs";
import { DateTime } from "luxon";
import { createFolder } from "./filesystem";
import * as Sentry from "@sentry/node";

export class Logger {
  private static instance: Logger;
  private logger: pino.Logger;

  private constructor() {
    this.logger = this.createLogger();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  private createLogger(): pino.Logger {
    const now = DateTime.now().toUTC();
    const year = now.year;
    const month = String(now.month).padStart(2, "0");
    const day = String(now.day).padStart(2, "0");

    // Create directory structure: logs/2025/07/11.log
    const logDir = path.join(
      process.cwd(),
      "public/logs",
      `${year}`,
      `${month}`
    );
    const logFile = path.join(logDir, `${day}.log`);

    // Ensure directory exists
    fs.mkdirSync(logDir, { recursive: true });

    return pino(
      {
        level: process.env.LOG_LEVEL || "info",
        timestamp: pino.stdTimeFunctions.isoTime,
        formatters: {
          level: (label) => {
            return { level: label };
          },
        },
      },
      pino.destination(logFile)
    );
  }

  public info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  public error(message: string, ...args: any[]): void {
    Sentry.captureException(new Error(message), {
      extra: {
        args,
      },
    });
    console.error(message, ...args);
    this.logger.error(message, ...args);
  }

  public warn(message: string, ...args: any[]): void {
    Sentry.captureException(new Error(message), {
      extra: {
        args,
      },
    });
    console.warn(message, ...args);
    this.logger.warn(message, ...args);
  }

  public debug(message: string, ...args: any[]): void {
    console.debug(message, ...args);
    this.logger.debug(message, ...args);
  }

  public fatal(message: string, ...args: any[]): void {
    Sentry.captureException(new Error(message), {
      extra: {
        args,
      },
    });
    console.error("FATAL:", message, ...args);
    this.logger.fatal(message, ...args);
    process.exit(1);
  }

  // Method to create a new logger for the current date (useful for long-running processes)
  public refreshLogger(): void {
    this.logger = this.createLogger();
  }

  // Get the underlying pino logger for advanced usage
  public getPinoLogger(): pino.Logger {
    return this.logger;
  }
}

// Export a singleton instance
export const logger = Logger.getInstance();
