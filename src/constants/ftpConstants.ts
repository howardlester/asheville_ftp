import path from "path";

export const directoryWithProcessedFTPFiles = path.join(
  process.cwd(),
  "public/ftp_processed"
);

export const moveAfterProcessing = true;

