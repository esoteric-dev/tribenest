import * as admin from "firebase-admin";
import path from "path";
import { logger } from "./logger";

// Adjust this path if the backend runs from build directory or root
const serviceAccountPath = path.resolve(
  __dirname,
  "../../../../multi-authenticator-f56f2-firebase-adminsdk-fbsvc-eed4f84773.json"
);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });
  logger.info("Firebase Admin initialized successfully.");
} catch (error) {
  logger.error("Failed to initialize Firebase Admin:", error);
}

export const firebaseAdmin = admin;
export const firebaseAuth = admin.auth();
