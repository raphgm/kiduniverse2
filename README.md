# Kiddopia Universe · Azure Monolith Extraction Cloud Lab

[![Workload: SKILL.SCH Cloud Lab](https://img.shields.io/badge/SKILL.SCH-Cloud_Lab_Workload-0284c7?style=flat-square)](https://skill-sch.com/cloudlabs?lab=Monolith+Service+Extraction%3A+Carving+Out+Auth+on+Azure)
[![Architecture: Strangler Fig](https://img.shields.io/badge/Pattern-Strangler_Fig-10b981?style=flat-square)](#architecture-overview)
[![Cloud: Azure AKS + APIM](https://img.shields.io/badge/Azure-AKS_%7C_APIM_%7C_KeyVault-0078d4?style=flat-square)](#azure-infrastructure--security)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue?style=flat-square)](LICENSE)

An interactive, production-grade children’s learning application paired with an **Azure Cloud Architecture Simulator** built specifically for the **[SKILL.SCH Monolith Service Extraction: Carving Out Auth on Azure](https://skill-sch.com/cloudlabs?lab=Monolith+Service+Extraction%3A+Carving+Out+Auth+on+Azure)** cloud training lab.

This repository serves as both:
1. **A delightful Children's Application ("Kiddopia Universe")**: Interactive illustrated stories with voice narration, rocket arithmetic mini-games, an HTML5 doodle canvas with a refrigerator art gallery, and COPPA-compliant parental controls.
2. **A Live Azure Microservices Workbench**: An architecture console simulating the **Strangler Fig pattern**, Azure API Management (APIM) canary routing, Azure Kubernetes Service (AKS), Azure Key Vault CSI Secret Store, and stateless OIDC/JWT token verification.

---

## Table of Contents

- [Architectural Overview](#architectural-overview)
  - [The Monolith Problem](#the-monolith-problem)
  - [The Extracted Azure Architecture](#the-extracted-azure-architecture)
- [The 5-Phase Lab Curriculum](#the-5-phase-lab-curriculum)
- [Application Features](#application-features)
  - [Story Explorer](#1-story-explorer)
  - [Math Planet Rocket Launch](#2-math-planet-rocket-launch)
  - [Doodle Studio & Refrigerator Gallery](#3-doodle-studio--refrigerator-gallery)
  - [Trophy Case & Certificates](#4-trophy-case--certificates)
  - [Child Quick Sign-In & Parent Gate](#5-child-quick-sign-in--parent-gate)
- [Azure Cloud Lab Console](#azure-cloud-lab-console)
  - [Live Topology & Canary Slider](#1-live-topology--canary-slider)
  - [Real-Time HTTP Wiretap & OIDC Claims Inspector](#2-real-time-http-wiretap--oidc-claims-inspector)
  - [Resilience & Chaos Testing](#3-resilience--chaos-testing)
- [Azure Configuration Snippets](#azure-configuration-snippets)
  - [1. Azure APIM Strangler Fig Canary Policy (XML)](#1-azure-apim-strangler-fig-canary-policy-xml)
  - [2. AKS Secrets Store CSI SecretProviderClass (YAML)](#2-aks-secrets-store-csi-secretproviderclass-yaml)
  - [3. Decoded RS256 JWT Claims (JSON)](#3-decoded-rs256-jwt-claims-json)
- [Project Directory Structure](#project-directory-structure)
- [Getting Started](#getting-started)
- [Compliance & Safety](#compliance--safety)

---

## Architectural Overview

### The Monolith Problem

In the baseline monolithic architecture:
* All requests (`/api/v1/auth/*`, `/api/v1/stories/*`, `/api/v1/math/*`, `/api/v1/art/*`) hit a single monolithic backend container.
* User sessions are **stateful** and stored in the primary monolith database.
* High traffic or database deadlocks in the story catalog or art uploads can crash authentication and lock parents out of security controls.
* Database query lock contention results in elevated auth response latency (**~140ms**).

```
[ Client Browser / Tablet ]
            │
            ▼
┌───────────────────────────────────────────────┐
│        LEGACY CORE MONOLITH CONTAINER         │
│  - /api/v1/auth/login                         │
│  - /api/v1/parent/verify-pin                  │
│  - /api/v1/stories/*                          │
│  - /api/v1/math/*                             │
│  - /api/v1/art/*                              │
└───────────────────────┬───────────────────────┘
                        │
                        ▼
┌───────────────────────────────────────────────┐
│        SINGLE SHARED MONOLITH DATABASE        │
│  (Users, Sessions, Stories, Art, Leaderboard) │
└───────────────────────────────────────────────┘
```

### The Extracted Azure Architecture

Using the **Strangler Fig migration pattern**:
1. **Azure API Management (APIM)** sits in front of all services.
2. Authentication is carved out into a standalone, containerized microservice deployed on **Azure Kubernetes Service (AKS)** in namespace `kiddopia-core`.
3. The auth database is separated into **Azure Database for PostgreSQL**, secured via an **Azure Private Link** endpoint inside a private VNet subnet.
4. Token signing certificates are managed in **Azure Key Vault** and mounted into AKS pods using the **Secrets Store CSI Driver**.
5. Stateful session cookies are replaced with stateless **RS256 OIDC Bearer Tokens**.
6. Response latency drops to **~28ms**.

```
                           [ Client Browser / Tablet ]
                                        │
                                        ▼
                  ┌───────────────────────────────────────────┐
                  │         AZURE APIM GATEWAY ROUTER         │
                  │   - Strangler Fig Inbound Policy          │
                  │   - Dynamic Canary Split (0% - 100%)      │
                  └─────────────┬───────────────┬─────────────┘
                                │               │
          (100 - Canary)% Auth  │               │  Canary% Auth
          + All Content Traffic │               │  Traffic
                                ▼               ▼
┌───────────────────────────────────┐   ┌────────────────────────────────────────┐
│      CORE MONOLITH CONTAINER      │   │    AZURE AKS AUTH MICROSERVICE PODS    │
│  - Story Explorer                 │   │  - Stateless RS256 Token Issuance      │
│  - Math Planet Engine             │   │  - Child 3-Color Pattern Verifier      │
│  - Validates Bearer JWTs          │   │  - Parent PIN Verifier                 │
└─────────────────┬─────────────────┘   └──────────┬───────────────────┬─────────┘
                  │                                │                   │
                  ▼                                ▼                   ▼
┌───────────────────────────────────┐   ┌──────────────────────┐ ┌───────────────┐
│      MONOLITH DATABASE            │   │  AZURE KEY VAULT CSI │ │ AZURE POSTGRES│
│  (Catalog & Game Progress Only)   │   │  (RS256 Signing Key) │ │(Private Link) │
└───────────────────────────────────┘   └──────────────────────┘ └───────────────┘
```

---

## The 5-Phase Lab Curriculum

This app directly mirrors the 5 sequential phases in the [SKILL.SCH Azure Track](https://skill-sch.com/cloudlabs?lab=Monolith+Service+Extraction%3A+Carving+Out+Auth+on+Azure):

1. **Phase 1: Baseline Monolith Audit**  
   Audit legacy monolith authentication (`POST /api/v1/auth/login`). Inspect the stateful session cookie (`Set-Cookie: session_id=sid_...`) and measure database lock latency (~140ms).
2. **Phase 2: Carve Out Auth to Azure AKS**  
   Provision `auth-service-v2` on Azure Kubernetes Service with Azure Key Vault Secrets Store CSI Driver and PostgreSQL Private Link isolation.
3. **Phase 3: Strangler Fig Canary Traffic Routing (25% - 50%)**  
   Configure Azure API Management inbound routing policy to divert a portion of live auth requests to the AKS cluster while keeping business content on the monolith.
4. **Phase 4: Stateless Token Claims & Parent Lock Validation**  
   Downstream story and math services validate stateless RS256 Bearer JWTs carrying claims (`tenant_id`, `role: "child" | "parent"`, `vault_key_version`).
5. **Phase 5: 100% Cutover & Monolith Auth Retirement**  
   Shift all auth traffic to AKS (100%). Return `HTTP 410 Gone` on the deprecated monolith auth endpoints. Inject monolith faults to confirm zero-downtime auth survivability.

---

## Application Features

### 1. Story Explorer
* **Interactive Storybooks**:
  * *Oliver & the Stardust Comet*: An owl astronaut on a cosmic treasure hunt.
  * *Penny's Coral Submarine*: Bioluminescent deep-sea exploration.
  * *Dino Pip's Lost Spark*: A baby triceratops finding courage.
* **Text-to-Speech Narration**: Real-time reading using the browser's Web Speech API with sentence highlighting.
* **Interactive Story Pickups**: Hidden stars, keys, and pearls embedded in story pages that reward the child with stars.

### 2. Math Planet Rocket Launch
* **Arithmetic Challenges**: Addition, subtraction, and multiplication tailored for early learners.
* **Visual Starlight Counters**: Visual emojis grouped by number to help young children count visually.
* **Streak Bonuses & Confetti**: Escalating score multipliers and celebratory animations on consecutive answers.
* **Dynamic Generator**: Generates infinite random math challenges on demand.

### 3. Doodle Studio & Refrigerator Gallery
* **Interactive Canvas**: HTML5 canvas supporting both mouse and multi-touch tablet input.
* **Creative Tools**:
  * 7 child-safe colors + **Rainbow Mode** (dynamic HSL color-cycling brush).
  * 4 brush thickness levels (Fine, Medium, Chunky, Giant).
  * Fun rubber stamps (⭐ Star, 🦕 Dino, 🚀 Rocket, 👑 Crown, ❤️ Heart, 🌈 Rainbow).
* **Family Refrigerator Gallery**: Save drawings directly to a persistent, magnetized gallery view.

### 4. Trophy Case & Certificates
* **Milestone Badges**: *Storybook Cadet*, *Math Rocket Ace*, *Picasso Junior*, *Starlight Sovereign*, *Cloud Architect Master*.
* **Interactive Certificates**: Printable and celebratory achievement certificates with confetti effects.

### 5. Child Quick Sign-In & Parent Gate
* **Child Quick Sign-In**:
  * Avatar selector (Fox, Owl, Dino, Bunny, Penguin, Lion).
  * 3-Color Secret Pattern password (e.g., Red-Blue-Yellow) designed for children who cannot read or type text passwords.
* **COPPA Parent Security Gate**:
  * Adult multiplication challenge (e.g. $7 \times 6 = 42$) to prevent accidental child access.
  * 4-digit PIN protection (`4821`).
  * Parental dashboard for daily screen time limits and session token inspection.

---

## Azure Cloud Lab Console

Access the console anytime by clicking the **"Azure Lab Console"** button in the top navigation bar or the floating badge in the bottom-right corner.

### 1. Live Topology & Canary Slider
* Interactive SVG diagram displaying live request paths through Azure APIM, AKS Pods, Azure Key Vault, and PostgreSQL Private Link.
* **Canary Slider**: Adjust traffic from `0%` to `100%` in real time with instant traffic split visualization.
* **Quick Presets**: `0%` (Monolith), `25%` (Canary Initial), `50%` (Canary Half), `100%` (Full Cutover).

### 2. Real-Time HTTP Wiretap & OIDC Claims Inspector
* Real-time network stream logging every HTTP request made by the user interface:
  * HTTP Method (`GET`, `POST`)
  * Endpoint URI
  * Response Status Code (`200`, `401`, `503`, etc.)
  * Execution Latency in milliseconds
  * Handling Upstream (`monolith` vs `aks-auth-service`)
  * Auth Type (`Session-Cookie` vs `Bearer-JWT`)
* **Deep Inspection Drawer**:
  * Inbound routing headers (`X-APIM-Canary-Target`, `Authorization: Bearer ...`)
  * Decoded RS256 JWT claims payload
  * Response body preview

### 3. Resilience & Chaos Testing
* Click **"● MONOLITH HEALTHY"** to simulate a database lock or monolith outage.
* Observe that in **Extracted AKS Mode**, child login, parent PIN verification, and token issuance remain **100% operational**!

---

## Azure Configuration Snippets

### 1. Azure APIM Strangler Fig Canary Policy (XML)

```xml
<policies>
  <inbound>
    <base />
    <!-- Skill-Sch Strangler Fig: Split 25% traffic to AKS Auth microservice -->
    <choose>
      <when condition="@(new Random().Next(100) < 25)">
        <set-backend-service base-url="https://aks-ingress.skill-sch.internal/auth" />
        <set-header name="X-APIM-Canary-Target" exists-action="override">
          <value>aks-auth-service-v2.kiddopia-core</value>
        </set-header>
      </when>
      <otherwise>
        <set-backend-service base-url="https://monolith-core.skill-sch.internal/api/v1/auth" />
      </otherwise>
    </choose>
  </inbound>
</policies>
```

### 2. AKS Secrets Store CSI SecretProviderClass (YAML)

```yaml
apiVersion: secrets-store.csi.x-k8s.io/v1
kind: SecretProviderClass
metadata:
  name: azure-kv-csi-auth
  namespace: kiddopia-core
spec:
  provider: azure
  parameters:
    usePodIdentity: "false"
    useVMManagedIdentity: "true"
    userAssignedIdentityID: "${AZURE_MANAGED_IDENTITY_ID}"
    keyvaultName: "kv-kiddopia-prod"
    cloudName: "AzurePublicCloud"
    objects: |
      array:
        - objectName: jwt-signing-cert-rs256
          objectType: key
        - objectName: postgres-private-link-conn
          objectType: secret
```

### 3. Decoded RS256 JWT Claims (JSON)

```json
{
  "iss": "https://aks-auth.skill-sch.azure/v2",
  "sub": "kid-leo-01",
  "aud": "https://api.kiddopia.io/kids",
  "tenant_id": "azure-sub-skill-sch-kiddopia",
  "role": "child",
  "user_name": "Leo",
  "avatar": "🦊",
  "age": 6,
  "family_id": "fam-sarah-jenkins",
  "scope": "read:stories read:math write:doodles write:stars",
  "auth_provider": "azure_aks_auth_v2",
  "vault_key_version": "7f91a82d-azure-kv-2026",
  "iat": 1792244925,
  "exp": 1792259325
}
```

---

## Project Directory Structure

```
├── index.html                       # HTML entry point with synchronized metadata & fonts
├── metadata.json                    # AI Studio metadata & permissions
├── package.json                     # Node.js dependencies & scripts
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite build & Tailwind CSS plugin configuration
└── src/
    ├── main.tsx                     # React application root entry point
    ├── index.css                    # Tailwind CSS v4 styling & typography
    ├── App.tsx                      # Main app shell & lab state coordinator
    ├── types/
    │   └── index.ts                 # TypeScript types (Tokens, NetworkLogs, LabTasks, Profiles)
    ├── data/
    │   └── initialData.ts           # Initial children profiles, stories, math questions & lab tasks
    ├── services/
    │   └── authSimulator.ts         # Monolith & AKS Auth routing engine, latency & JWT simulation
    └── components/
        ├── TopNav.tsx               # Top Bar Contract (Wordmark, Nav links, Profile/Lab triggers)
        ├── HeroBanner.tsx           # Welcome banner & Azure architecture quick card
        ├── StoryExplorer.tsx        # Interactive illustrated stories & audio narration
        ├── MathPlanet.tsx           # Rocket arithmetic challenge with visual counters
        ├── DoodleStudio.tsx         # HTML5 canvas drawing pad & Refrigerator Gallery
        ├── TrophyCase.tsx           # Badges & Achievement Certificate modal
        ├── AuthModal.tsx            # Child 3-Color Pattern login & Parent PIN security gate
        └── lab/
            ├── LabDrawer.tsx        # Slide-over Azure Lab Console container
            ├── TopologyDiagram.tsx  # Interactive Azure architecture flow graph & health toggles
            ├── NetworkWiretap.tsx   # Live HTTP stream & decoded JWT claims inspector
            └── LabTasks.tsx         # 5-Phase lab curriculum tracker with expandable Azure snippets
```

---

## Getting Started

### Prerequisites
* Node.js $\ge 20$
* npm or bun

### Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

3. **Validate TypeScript & linting**:
   ```bash
   npm run lint
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## Compliance & Safety

* **COPPA Compliant Design**: No unverified data collection; child accounts use non-identifying animal avatars and pattern passcodes.
* **Parental Gates**: Mandatory adult mathematical confirmation challenge before granting access to configuration screens.
* **Least Privilege Identity**: Auth tokens carry strict resource scopes (`read:stories`, `read:math`) adhering to zero-trust principles.

---

*Built for the [SKILL.SCH Cloud Training Platform](https://skill-sch.com).*
