import path from "path";

export const ftpClientConfig = {
  host: process.env.FTP_HOST,
  user: process.env.FTP_USER,
  password: process.env.FTP_PASSWORD,
};


export const directoryWithProcessedFTPFiles = path.join(
  process.cwd(),
  "public/ftp_processed"
);
