// services/auth-service/src/routes/auth.ts
import { Router, Request, Response } from "express";
import { initFirebase, getAuth } from "../firebase";

/**
 * ============================================================================
 * SKILL.SCH LAB EXERCISE: Monolith Service Extraction - Carving Out Auth
 * STEP 2.5: Stateless Token Minting & Claim Structure
 * ============================================================================
 * Microservice Requirement:
 * Instead of creating a session row in a database, the extracted auth service
 * issues a cryptographically signed token containing verified claims.
 * Downstream services (stories, games) validate the signature without
 * querying the auth database.
 * ============================================================================
 */

export const authRouter = Router();
const app = initFirebase();
const firebaseAuth = getAuth(app);

// ----------------------------------------------------------------------------
// TODO [Lab Step 2.5A]: Child Login & Token Minting
// ----------------------------------------------------------------------------
authRouter.post("/login/child", async (req: Request, res: Response) => {
  const { childId, name, avatar } = req.body;

  if (!childId) {
    return res.status(400).json({ error: "childId is required" });
  }

  try {
    // Mint token carrying child claims
    const customToken = await firebaseAuth.createCustomToken(childId, {
      role: "child",
      name: name || "Child Cadet",
      avatar: avatar || "🦊",
      tenant_id: "azure-sub-skill-sch",
      scope: "read:stories read:math write:doodles write:stars",
    });

    return res.status(200).json({
      token: customToken,
      token_type: "Bearer",
      role: "child",
      expires_in: 14400,
    });
  } catch (err: unknown) {
    console.error("Error creating child token:", err);
    return res.status(200).json({
      token: `simulated_aks_child_jwt_${childId}`,
      role: "child",
      expires_in: 14400,
    });
  }
});

// ----------------------------------------------------------------------------
// TODO [Lab Step 2.5B]: Parent PIN Verification & Elevated Scope Token
// ----------------------------------------------------------------------------
authRouter.post("/verify-parent-pin", async (req: Request, res: Response) => {
  const { pin, parentId } = req.body;

  // Verify PIN (default demo PIN: 4821)
  if (!pin || pin !== "4821") {
    return res.status(401).json({ error: "Invalid Parent PIN" });
  }

  try {
    const parentToken = await firebaseAuth.createCustomToken(parentId || "parent-sarah-101", {
      role: "parent",
      scope: "admin:screentime admin:profiles write:settings",
      tenant_id: "azure-sub-skill-sch",
    });

    return res.status(200).json({
      verified: true,
      token: parentToken,
      role: "parent",
      expires_in: 1800,
    });
  } catch (err: unknown) {
    return res.status(200).json({
      verified: true,
      token: "simulated_aks_parent_jwt_sarah",
      role: "parent",
      expires_in: 1800,
    });
  }
});

// ----------------------------------------------------------------------------
// TODO [Lab Step 2.5C]: OIDC / Bearer Token Verification Endpoint
// ----------------------------------------------------------------------------
authRouter.post("/verify-token", async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  const idToken = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await firebaseAuth.verifyIdToken(idToken);
    return res.status(200).json({ valid: true, claims: decodedToken });
  } catch (err: unknown) {
    return res.status(401).json({ valid: false, error: "Invalid or expired token" });
  }
});
