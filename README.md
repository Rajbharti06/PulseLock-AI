# 🛡️ PulseLock AI — Autonomous Healthcare Cyber Defense

> **UN SDG 3: Good Health and Well-Being**  
> Protecting patient privacy and healthcare systems through autonomous, real-time AI defense.

**Live Demo:** https://rajbharti06.github.io/PulseLock-AI/  
**Demo credentials:** `admin` / `admin123`

---

## The Problem

Healthcare is the most attacked industry in the world — and the most vulnerable.

| Statistic | Source |
|---|---|
| **40 million+** patient records exposed every year | IBM Cost of a Data Breach 2024 |
| **$10.9 million** average cost of a healthcare data breach | IBM Security Report (highest of any industry) |
| **1 in 3** healthcare organizations breached annually | HIPAA Journal / HHS Reports |
| **AI agents** are now performing clinical tasks — with zero security checkpoints | WHO Digital Health Report 2023 |

When a doctor's AI assistant is compromised, or a hospital email carries a phishing link, or an unauthorized system tries to bulk-export patient records — there is no autonomous guardian standing in the way.

**PulseLock is that guardian.**

---

## What PulseLock Does

PulseLock is an **autonomous, always-on AI security system** that intercepts every request touching patient data — from humans, software, and AI agents alike — and makes a real-time security decision before any action is executed.

```
Healthcare Request (human or AI)
         │
         ▼
┌─────────────────────────────────────┐
│          PULSELOCK AI GATE          │
│                                     │
│  ┌──────────┐  ┌──────────────────┐ │
│  │   PHI    │  │  Threat Detector │ │
│  │ Detector │  │  (injection,     │ │
│  │          │  │   phishing,      │ │
│  │ Finds    │  │   bulk export)   │ │
│  │ patient  │  └──────────────────┘ │
│  │ data     │  ┌──────────────────┐ │
│  └──────────┘  │ Intent Analyzer  │ │
│                │ (malicious vs    │ │
│                │  legitimate)     │ │
│                └──────────────────┘ │
│            ┌──────────────┐         │
│            │ Policy Engine│         │
│            │  ALLOW /     │         │
│            │  BLOCK /     │         │
│            │  REDACT /    │         │
│            │  QUARANTINE  │         │
│            └──────────────┘         │
└─────────────────────────────────────┘
         │
         ▼
   Decision + Audit Log + Self-Learning
```

**All agents run in parallel. Decision in under 300ms.**

---

## SDG 3 Alignment

| SDG Target | How PulseLock Addresses It |
|---|---|
| **3.8** Universal Health Coverage | Protects the health information systems that coverage depends on |
| **3.d** Health Security Capacity | Strengthens institutions' ability to detect and prevent cyber threats that directly harm patient care |
| **16.6** Accountable Institutions | Every security decision is logged with full audit trail — enabling transparent, accountable data governance |

A single data breach in a rural clinic can permanently destroy community trust in health services. PulseLock prevents that breach.

---

## Key Features

### 🛡️ Real-Time PHI Protection
Detects Protected Health Information (patient names, SSNs, medical record numbers, diagnoses) in any message, API call, file, or AI request — and blocks unauthorized access before it happens.

### 🤖 AI-to-AI Security Gate (A2A Protocol)
As hospitals deploy AI agents for diagnosis, scheduling, and records management, PulseLock enforces a security checkpoint between every agent-to-agent interaction. Built on the [A2A open protocol](https://google.github.io/A2A/) by Google and the Linux Foundation.

### ✉️ Email Threat Detection
Detects phishing, credential theft, and social engineering in healthcare email — the #1 attack vector for hospital breaches.

### 🧠 Self-Learning Defense
After every incident, PulseLock's learning engine analyzes attack patterns and automatically evolves its detection rules. It gets smarter with every threat.

### 📊 Zero Trust Mode
Tightened enforcement where all external destinations are blocked by default — HIPAA-aligned for high-risk environments.

### 🌍 FHIR Compatible
Reads patient context from FHIR (Fast Healthcare Interoperability Resources) servers — the global standard used by Epic, ABDM (India), OpenMRS, and WHO systems.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│              React + Vite → GitHub Pages                    │
│   Dashboard | Data Shield | Email Guard | AI Security Gate  │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS REST + WebSocket
┌─────────────────────▼───────────────────────────────────────┐
│                     BACKEND API                             │
│                FastAPI (Python 3.11)                        │
│              Render.com → Free Docker Hosting               │
│                                                             │
│  /scan          → PHI + Threat + Intent pipeline            │
│  /scan/email    → Email security analysis                   │
│  /scan/a2a      → AI agent clearance gate                   │
│  /threats       → Incident log                              │
│  /intelligence  → Self-learning + monthly reports           │
│  /ws/alerts     → Real-time WebSocket feed                  │
└──────┬──────────────────────────────────────┬───────────────┘
       │                                      │
┌──────▼──────────┐                  ┌────────▼────────────────┐
│  AI AGENTS      │                  │   PULSELOCK A2A AGENT   │
│  (parallel)     │                  │   Google ADK + Gemini   │
│                 │                  │   A2A Protocol Server   │
│  PHI Detector   │                  │   Prompt Opinion        │
│  Threat Det.    │                  │   Marketplace Ready     │
│  Intent Anal.   │                  └─────────────────────────┘
│  Policy Engine  │
│  Response Agent │
└──────┬──────────┘
       │
┌──────▼──────────┐
│  SQLite DB      │
│  Threat Logs    │
│  Learning Logs  │
│  Rule Evolution │
│  Monthly Reports│
└─────────────────┘
```

---

## How to Run

### Prerequisites
- Python 3.11+
- Node.js 20+

### Backend
```bash
git clone https://github.com/Rajbharti06/PulseLock-AI.git
cd PulseLock-AI

pip install -r backend/requirements.txt

PYTHONPATH=. uvicorn backend.main:app --reload --port 8000
```

Backend live at: `http://localhost:8000`  
API docs at: `http://localhost:8000/docs`

### Frontend
```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

Frontend live at: `http://localhost:5173`

### Login
```
Username: admin
Password: admin123
```

---

## Demo Steps

**Start here → [https://rajbharti06.github.io/PulseLock-AI/](https://rajbharti06.github.io/PulseLock-AI/)**

### Step 1: Mission Page
Log in → You land on the **Mission** page. Read the SDG 3 alignment, the global crisis stats, and PulseLock's response. This is the "why."

### Step 2: Scan a PHI Leak Attempt
Go to **Data Shield** → Click **"PHI Leak Attempt"** sample → Click **"Run Security Scan"**  
Watch PulseLock detect patient SSN + MRN, classify it as a critical threat, and **BLOCK** the request with a full explanation and recommended fix.

### Step 3: Detect a Phishing Email
Go to **Email Guard** → Click **"Load: Phishing Email"** → Click **"Analyze Email"**  
PulseLock identifies urgency manipulation, credential harvesting signals, and quarantines the email.

### Step 4: AI Security Gate (the most powerful demo)
Go to **AI Security Gate** → Click **"Attack: External API bulk-exports records"** → Click **"Request Security Clearance"**  
An AI agent tries to export all patient data to an external server. PulseLock **DENIED** — autonomously, in milliseconds, without human involvement.

Then try **"Safe: Doctor's AI reads patient vitals"** — PulseLock **CLEARED** — because the request is legitimate.

### Step 5: Intelligence
Go to **Intelligence** → Click **"Run Learning Cycle"**  
PulseLock analyzes all threats, finds patterns, and evolves its detection rules automatically.

---

## Deployment

PulseLock runs completely free with no cloud billing:

| Component | Platform | URL |
|---|---|---|
| Backend API | Render.com (Docker, Free tier) | `https://pulselock-backend.onrender.com` |
| A2A Agent | Render.com (Docker, Free tier) | `https://pulselock-agent.onrender.com` |
| Frontend Dashboard | GitHub Pages | `https://rajbharti06.github.io/PulseLock-AI/` |

> A rural hospital with internet access can deploy PulseLock today at zero cost.

---

## Why This Matters for SDG 3

Healthcare data is not just data. It is:
- A cancer patient's treatment history
- A child's vaccination record
- A survivor's mental health notes

When that data is stolen or corrupted, real people are harmed. Appointments are missed. Treatments are delayed. Trust in the healthcare system — already fragile in many communities — breaks down further.

PulseLock is not just a security tool. It is infrastructure for trust.

Every hospital that adopts PulseLock becomes safer. Every patient whose data is protected can rely on their healthcare system. And every AI agent deployed in healthcare — however well-intentioned — operates within a framework that puts patient safety first.

**This is SDG 3 in action.**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy, asyncio |
| AI Agents | Google Gemini 2.0 Flash, Google ADK |
| A2A Protocol | a2a-sdk, Starlette, Agent-to-Agent open standard |
| Security | passlib/bcrypt, python-jose (JWT), Zero Trust enforcement |
| Database | SQLite (dev) / PostgreSQL-ready |
| Frontend | React 18, Vite, WebSocket real-time feed |
| Deployment | Docker, Render.com, GitHub Pages, GitHub Actions CI/CD |
| Healthcare | FHIR R4 compatible, HIPAA-aligned design |

---

## Team

Built by **Raj Bharti** for the GNEC Hackathon 2026 Spring.

> *"The greatest threat to healthcare is not disease — it is the erosion of trust in the systems meant to protect us. PulseLock rebuilds that trust, one decision at a time."*
