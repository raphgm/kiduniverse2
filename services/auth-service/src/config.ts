// services/auth-service/src/config.ts
import * as admin from "firebase-admin";

/**
 * ============================================================================
 * SKILL.SCH LAB EXERCISE: Monolith Service Extraction - Carving Out Auth
 * STEP 2: Configure Extracted Auth Microservice
 * ============================================================================
 * Instructions:
 * 1. Set up the PostgreSQL connection for Azure Private Link.
 *    - In Azure, your database is isolated behind a private endpoint.
 *    - The DB password should be read from environment variables populated
 *      by Azure Key Vault or Secrets Store CSI driver.
 * 2. Set up the Firebase Admin configuration using the mounted service account
 *    credentials from the Azure Key Vault CSI driver volume.
 * ============================================================================
 */

export const config = {
  port: parseInt(process.env.PORT || "8080", 10),

  // --------------------------------------------------------------------------
  // TODO [Lab Step 2.1]: Configure PostgreSQL Private Link Database
  // --------------------------------------------------------------------------
  db: {
    host: process.env.DB_HOST || "auth-service-psql.privatelink.postgres.database.azure.com",
    port: parseInt(process.env.DB_PORT || "5432", 10),
    user: process.env.DB_USER || "authsvc_admin",
    // In production, Azure Key Vault CSI driver mounts the DB password
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME || "authdb",
    // Azure PostgreSQL requires SSL connections
    ssl: { rejectUnauthorized: true }
  },

  // --------------------------------------------------------------------------
  // TODO [Lab Step 2.2]: Configure Azure Key Vault CSI Secret Mount for Firebase
  // --------------------------------------------------------------------------
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "enterprise-auth-prod",
    // Path where the AKS Secrets Store CSI driver mounts the service account JSON
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "/mnt/secrets-store/firebase-service-account.json"
  }
};
