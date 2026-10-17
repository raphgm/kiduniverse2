// services/auth-service/src/firebase.ts
import { initializeApp, cert, getApps, getApp, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import * as fs from "fs";
import { config } from "./config";

/**
 * ============================================================================
 * SKILL.SCH LAB EXERCISE: Monolith Service Extraction - Carving Out Auth
 * STEP 2.4: Azure Key Vault CSI Secret Mount Integration
 * ============================================================================
 * Security Best Practice:
 * Never bake service account keys or certificates into Docker images or Git!
 *
 * The Secrets Store CSI Driver mounts the Azure Key Vault secret directly into
 * the Pod's filesystem at runtime (specified in `config.firebase.serviceAccountPath`).
 * ============================================================================
 */

let initialized = false;

export function initFirebase(): App {
  if (initialized && getApps().length > 0) {
    return getApp();
  }

  try {
    // ------------------------------------------------------------------------
    // TODO [Lab Step 2.4]: Read mounted service account credential from Key Vault CSI mount
    // ------------------------------------------------------------------------
    if (fs.existsSync(config.firebase.serviceAccountPath)) {
      const serviceAccount = JSON.parse(
        fs.readFileSync(config.firebase.serviceAccountPath, "utf-8")
      );
      initializeApp({
        credential: cert(serviceAccount),
        projectId: config.firebase.projectId,
      });
      console.log(`[AuthService] Initialized Firebase with Azure Key Vault CSI secret from ${config.firebase.serviceAccountPath}`);
    } else {
      console.warn(`[AuthService] Key Vault secret path ${config.firebase.serviceAccountPath} not found. Falling back to application default credentials.`);
      initializeApp({
        projectId: config.firebase.projectId,
      });
    }
  } catch (err) {
    console.warn(`[AuthService] Fallback to project ID auth:`, err);
    if (getApps().length === 0) {
      initializeApp({
        projectId: config.firebase.projectId,
      });
    }
  }

  initialized = true;
  return getApp();
}

export { getAuth };
