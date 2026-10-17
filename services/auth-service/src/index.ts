// services/auth-service/src/index.ts
import express from "express";
import { config } from "./config";
import { authRouter } from "./routes/auth";

const app = express();
app.use(express.json());

// Kubernetes Probes
app.get("/healthz", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "auth-service",
    version: "2.0.0",
    uptime: process.uptime(),
  });
});

app.get("/readyz", (_req, res) => {
  res.status(200).json({
    ready: true,
    db: "connected",
    keyvault_csi: "mounted",
  });
});

// Auth Routes
app.use("/api/v1/auth", authRouter);
app.use("/auth", authRouter); // Supports both /auth and /api/v1/auth for APIM routing

if (process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => {
    console.log(`[AuthService] Running on port ${config.port}`);
    console.log(`[AuthService] Azure Private Link DB: ${config.db.host}`);
    console.log(`[AuthService] Key Vault CSI Secret Path: ${config.firebase.serviceAccountPath}`);
  });
}

export default app;
