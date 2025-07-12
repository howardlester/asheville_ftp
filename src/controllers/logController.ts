import { Request, Response } from "express";
import { asyncHandler } from "../utils/exceptions";
import path from "path";
import fs from "fs";
import { DateTime, IANAZone } from "luxon";

export const formatLogs = asyncHandler(async (req: Request, res: Response) => {
  const { year, month, day } = req.params;
  const timezone = (req.query.timezone as string) || "utc";
  const zone = IANAZone.isValidZone(timezone) ? timezone : "utc";

  if (!year || !month || !day) {
    return res.status(400).json({ error: "Year, month, and day are required" });
  }

  const logFile = path.join(
    process.cwd(),
    "public/logs",
    year,
    month,
    `${day}.log`
  );

  const logData = fs.readFileSync(logFile, "utf8");
  const logs = logData
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch {
        return { msg: line, level: "unknown" };
      }
    })
    .reverse();

  // Return formatted HTML
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Logs - ${year}/${month}/${day}</title>
          <style>
            body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; }
            .log-entry { margin: 5px 0; padding: 8px; border-left: 4px solid #666; }
            .info { border-left-color: #4CAF50; }
            .error { border-left-color: #f44336; background: rgba(244, 67, 54, 0.1); }
            .warn { border-left-color: #ff9800; background: rgba(255, 152, 0, 0.1); }
            .debug { border-left-color: #2196F3; }
            .time { color: #888; font-size: 0.9em; }
            .level { font-weight: bold; text-transform: uppercase; }
            .message { margin-left: 10px; }
          </style>
        </head>
        <body>
            <div class="header-compact">
            <div class="log-title">
                <h1>📋 ${year}/${month}/${day} Logs</h1>
                </div>
                
                <span class="stat">🌍 ${zone}</span>
                <span class="stat">📊 ${logs.length} entries</span>
                <span class="stat">⬇️ Newest first</span>
            </div>
            </div>
          <hr>
          <div class="log-entries">
          ${logs
            .map(
              (log) => `
            <div class="log-entry ${log.level}">
              <span class="time">${DateTime.fromISO(log.time, {
                zone: timezone,
              }).toFormat("yyyy-MMM-dd HH:mm:ss")}</span>
              <span class="level">[${log.level}]</span>
              <span class="message">${log.msg}</span>
            </div>
          `
            )
            .join("")}
        </body>
      </html>
    `;

  res.send(html);
});
