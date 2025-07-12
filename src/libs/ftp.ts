import { Client } from "basic-ftp";

export async function connectToFtp() {
  const client = new Client();
  try {
    await client.access({
      host: process.env.FTP_HOST,
      user: process.env.FTP_USER,
      password: process.env.FTP_PASSWORD,
      secure: true, // Enable secure connection
      secureOptions: {
        rejectUnauthorized: false // Accept self-signed certificates
      }
    });
    console.log("Connected to FTP server");
    return client;
  } catch (error) {
    console.error("Failed to connect to FTP server:", error);
    throw error;
  }
}
