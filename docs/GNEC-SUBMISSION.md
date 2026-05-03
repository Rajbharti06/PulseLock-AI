# GNEC Hackathon 2026 Spring — Submission checklist

Official theme: **UN SDG 3 (Health and Well-Being)**.  
This file helps you satisfy Devpost uploads and judging.

## What Devpost asks for

| Item | Guidance for PulseLock |
|------|-------------------------|
| **2–5 min video** | Follow script outline below. Show live demo URL + Mission page SDG framing first. |
| **Work file (ZIP / slides / PDF)** | ZIP this repository (excluding `node_modules`, `venv`, `__pycache__`), **or** export your pitch deck PDF and attach alongside the ZIP. |

## Judging criteria (map your narration)

| Criterion | What to say/show in 30–45 seconds each |
|-----------|------------------------------------------|
| **Impact** | SDG 3: breaches harm **trust, care continuity, vulnerable populations**. Tie to NGOs/clinics with limited IT budgets. Mention social + economic sustainability (recovery costs divert funds from care). |
| **Innovation** | **Decision-before-execution** AI gate; PHI + threats + intent in one flow; AI-to-AI (A2A) angle; explainable BLOCK/ALLOW + learning. |
| **Feasibility & scalability** | Working web demo; layered architecture (UI → optional API → DB); FHIR-aligned story; deployable cheaply for small facilities. |
| **Design** | Walk **Mission → Threat Analyzer → Data Shield Demo** in order; emphasize clarity for non-specialists. |
| **Presentation** | One problem statistic → solution in one sentence → 2 min demo → close with measurable outcome (“breach prevented before data left”). |

## Suggested video structure (≈ 3 minutes)

**0:00–0:25 — Hook & SDG**  
“GNEC theme is SDG 3. Health systems run on data — when that data leaks, patients and communities lose trust. PulseLock blocks unsafe actions **before** they execute.”

**0:25–0:55 — Impact**  
One stat (breach volume or cost); “This isn’t theoretical for clinics and NGOs with small security teams.”

**0:55–2:35 — Demo (screen recording)**  
1. Log in (`admin` / `admin123`).  
2. **Mission** — point at SDG targets + demo shortcuts.  
3. **Threat Analyzer** — phrase from README → **Analyze Risk** → BLOCK + logs + “Without PulseLock” toggle if time.  
4. **Data Shield Demo** — **Run Attack Simulation** → summary “0 patient data exposed.”  
5. (Optional trim) Email Guard or AI Security Gate — one clear ALLOW vs BLOCK.

**2:35–3:00 — Close**  
Innovation one-liner; scalability one-liner; “PulseLock rebuilds digital trust — one interception at a time.”

## Zip contents reminder

Include: `frontend/`, `backend/`, `README.md`, `render.yaml`/Dockerfiles if applicable, `.github/workflows` if Pages deploy matters to judges.

Exclude: secrets, `.env`, API keys, large local DB files.
