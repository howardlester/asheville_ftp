// const Sentry = require("@sentry/node");
import * as Sentry from "@sentry/node";

// Sentry.init({
//   dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
//   // Adds request headers and IP for users, for more info visit:
//   // https://docs.sentry.io/platforms/javascript/guides/node/configuration/options/#sendDefaultPii
//   sendDefaultPii: true,
// });

export const initializeSentry = () => {
  try {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,

      // Setting this option to true will send default PII data to Sentry.
      // For example, automatic IP address collection on events
      sendDefaultPii: true,
    });
  } catch (error) {
    console.error("Failed to initialize Sentry:", error);
  }
};
