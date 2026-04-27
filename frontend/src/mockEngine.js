// ============================================================
// PulseLock AI — Offline Mock Intelligence Engine
// Simulates all backend AI agents with realistic responses
// ============================================================

let threatLog = [];
let scanCount = 0;
let ruleEvolutions = [];
let reportHistory = [];

// ── Helpers ──────────────────────────────────────────────────
function delay(ms = 900) {
  return new Promise((r) => setTimeout(r, ms));
}

function rand(min, max) {
  return Math.random() * (max - min) + min;
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function now() {
  return new Date().toISOString();
}

// ── PHI Detection ─────────────────────────────────────────────
const PHI_PATTERNS = [
  /\b\d{3}-\d{2}-\d{4}\b/, // SSN
  /\b(patient|mrn|dob|diagnosis|prescription|medical|healthcare|treatment|record|PHI|health)\b/i,
  /\b[a-z]+\s+[a-z]+\s+(MRN|DOB|patient\s+ID):\s*\d+/i,
  /\b(john doe|jane doe|john smith|jane smith)\b/i,
  /\bDOB:\s*\d{2}\/\d{2}\/\d{4}/i,
  /\b(hypertension|diabetes|cancer|HIV|mental health|surgery)\b/i,
];

function detectPHI(text) {
  return PHI_PATTERNS.some((p) => p.test(text));
}

function phiScore(text) {
  const matches = PHI_PATTERNS.filter((p) => p.test(text)).length;
  return Math.min(matches / PHI_PATTERNS.length + (matches > 0 ? 0.35 : 0), 1);
}

// ── Threat Detection ──────────────────────────────────────────
const PHISHING_SIGNALS = [
  /urgent/i, /immediately/i, /click here/i, /verify your/i,
  /suspended/i, /confirm.{0,30}(account|password|credentials)/i,
  /within 24 hours/i, /\baction required\b/i,
];

const INJECTION_SIGNALS = [
  /ignore (your |all |previous )?rules/i,
  /ignore (your |all |previous )?instructions/i,
  /bypass (security|rules|auth)/i,
  /send all (patient|records|data)/i,
  /export (all|every|complete) (records?|data|patient)/i,
  /http:\/\/evil|http:\/\/attacker|http:\/\/hack/i,
  /forget (your|all) (rules|instructions|guidelines)/i,
];

const EXTERNAL_SIGNALS = [
  /external|outside|send to|forward to|export to|upload to/i,
  /@(?!hospital\.org|clinic\.org|healthcare\.org)[a-z0-9.-]+\.[a-z]{2,}/i,
];

const BULK_SIGNALS = [
  /all (patient|records|database)/i,
  /entire (database|system|records)/i,
  /bulk (export|download|transfer)/i,
  /complete records/i,
];

function threatScore(text) {
  const phish = PHISHING_SIGNALS.filter((p) => p.test(text)).length;
  const inject = INJECTION_SIGNALS.filter((p) => p.test(text)).length;
  const bulk = BULK_SIGNALS.filter((p) => p.test(text)).length;
  const score = Math.min((phish * 0.22) + (inject * 0.38) + (bulk * 0.18), 1);
  return { score, phish, inject, bulk };
}

function intentScore(text, destination = "") {
  const external = EXTERNAL_SIGNALS.some((p) => p.test(text + " " + destination));
  const harmful = INJECTION_SIGNALS.some((p) => p.test(text));
  if (harmful) return { intent: "dangerous", score: 0.92 };
  if (external) return { intent: "risky", score: 0.65 };
  return { intent: "safe", score: 0.12 };
}

// ── Core Scan Logic ────────────────────────────────────────────
export async function mockScan(content, source = "ui", destination = "", zeroTrust = false) {
  await delay(rand(700, 1300));
  scanCount++;

  const hasPHI = detectPHI(content);
  const phi = phiScore(content);
  const { score: threat, phish, inject, bulk } = threatScore(content);
  const { intent, score: intentConf } = intentScore(content, destination);
  const hasExternal = EXTERNAL_SIGNALS.some((p) => p.test(content + " " + destination));

  // Find similar past threats
  const similar = threatLog.filter((t) =>
    t.threat_type && hasPHI === t.phi_detected
  ).slice(0, 3);

  let action, severity, threat_type, explanation, recommended_fix;
  let confidence;

  if (inject > 0) {
    action = "BLOCK";
    severity = "critical";
    threat_type = "prompt_injection";
    explanation = "This request contains a prompt injection pattern attempting to override PulseLock's security rules. The malicious instruction has been identified and suppressed — your patient data remains protected.";
    recommended_fix = "Review the origin of this request. This pattern suggests a compromised upstream agent or insider threat attempt. Escalate to your security team immediately.";
    confidence = rand(0.88, 0.97);
  } else if (hasPHI && hasExternal) {
    action = "BLOCK";
    severity = "high";
    threat_type = "phi_exfiltration";
    explanation = "Sensitive patient health information (PHI) detected in a request directed to an external destination. This violates HIPAA data residency rules and PulseLock's data protection policy. The transfer has been blocked.";
    recommended_fix = "Patient data must remain within the secure healthcare network. If external transfer is required, use approved encrypted channels with explicit authorization from your compliance officer.";
    confidence = rand(0.85, 0.95);
  } else if (bulk > 0) {
    action = "BLOCK";
    severity = "high";
    threat_type = "bulk_data_request";
    explanation = "This request attempted to retrieve or export bulk patient records. Bulk data extraction is a common data exfiltration technique. PulseLock has identified and blocked this unauthorized access pattern.";
    recommended_fix = "Bulk access requires multi-factor authorization. Submit a formal data access request through your healthcare administration portal.";
    confidence = rand(0.82, 0.93);
  } else if (phish > 0) {
    action = "WARN";
    severity = "medium";
    threat_type = "phishing_pattern";
    explanation = "Phishing language patterns detected in this request — urgency cues, credential prompts, or suspicious phrasing. Proceed with extreme caution.";
    recommended_fix = "Do not click any links in associated messages. Verify the request through a trusted internal channel before taking any action.";
    confidence = rand(0.72, 0.88);
  } else if (hasPHI && zeroTrust) {
    action = "QUARANTINE";
    severity = "medium";
    threat_type = "phi_in_zero_trust";
    explanation = "Zero Trust Mode is active. All content containing PHI is quarantined for review, regardless of intent. Patient data detected — holding for compliance verification.";
    recommended_fix = "Disable Zero Trust Mode only after proper authorization or route this content through the approved compliance review workflow.";
    confidence = rand(0.78, 0.90);
  } else if (hasPHI) {
    action = "WARN";
    severity = "low";
    threat_type = "phi_detected";
    explanation = "Patient health information detected in this content. No immediate threat, but ensure this data is handled according to your healthcare organization's privacy policies.";
    recommended_fix = "Tag this content as PHI-sensitive. Ensure it is stored and transmitted through HIPAA-compliant channels only.";
    confidence = rand(0.62, 0.78);
  } else {
    action = "ALLOW";
    severity = "safe";
    threat_type = null;
    explanation = "Content analyzed across all security dimensions — no PHI, no threat patterns, no injection attempts, no policy violations. This request is cleared for processing.";
    recommended_fix = null;
    confidence = rand(0.75, 0.92);
  }

  const record = {
    id: uid(),
    timestamp: now(),
    action_taken: action,
    severity,
    threat_type,
    source,
    phi_detected: hasPHI,
    reason: explanation,
    confidence,
    zero_trust_active: zeroTrust,
  };

  threatLog.unshift(record);
  if (threatLog.length > 200) threatLog.pop();

  // Auto-trigger rule evolution when threat repeats
  const repeatThreats = threatLog.filter((t) => t.threat_type === threat_type).length;
  if (repeatThreats >= 3 && action === "BLOCK" && threat_type) {
    const alreadyEvolved = ruleEvolutions.some((e) => e.triggered_by === threat_type);
    if (!alreadyEvolved) {
      ruleEvolutions.unshift({
        id: uid(),
        timestamp: now(),
        rule_type: "threshold_update",
        change_description: `Detection threshold tightened for "${threat_type?.replace(/_/g, " ")}" — pattern confirmed across ${repeatThreats} incidents`,
        triggered_by: threat_type,
        confidence: Math.min(0.5 + repeatThreats * 0.1, 0.95),
      });
    }
  }

  return {
    ...record,
    phi_score: phi,
    intent,
    explanation,
    recommended_fix,
    similar_incidents: similar.length,
    similarity_note:
      similar.length > 0
        ? `${similar.length} similar incident(s) on record — PulseLock recognized this pattern and responded ${similar.length > 1 ? "faster" : "immediately"}.`
        : null,
    agent_details: {
      policy_engine: {
        signals: {
          threat_confidence: Math.min(threat + 0.1, 1),
          intent_confidence: intentConf,
          previous_occurrences: similar.length,
          phi_score: phi,
        },
      },
    },
    redacted_content:
      action === "REDACT"
        ? content.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[SSN REDACTED]").replace(/John Doe|Jane Doe|John Smith|Jane Smith/gi, "[NAME REDACTED]")
        : null,
    zero_trust_active: zeroTrust,
  };
}

// ── Email Scan ──────────────────────────────────────────────────
export async function mockScanEmail(sender, subject, body) {
  await delay(rand(700, 1200));

  const text = `${sender} ${subject} ${body}`;
  const phishCount = PHISHING_SIGNALS.filter((p) => p.test(text)).length;
  const hasSuspiciousDomain = !/(@hospital\.org|@clinic\.org|@healthcare\.org|@nhs\.uk)/i.test(sender);
  const hasUrgency = /urgent|immediately|now|24 hours/i.test(text);
  const hasCredentials = /verify|credentials|login|password|account/i.test(text);

  let action, severity, threat_type, reason;
  const indicators = [];

  if (phishCount >= 3 || (hasSuspiciousDomain && hasUrgency && hasCredentials)) {
    action = "DELETE";
    severity = "critical";
    threat_type = "phishing_email";
    reason = "High-confidence phishing attempt detected. Multiple attack indicators identified including suspicious sender domain, urgency manipulation, and credential harvesting language. Email deleted automatically.";
    if (hasUrgency) indicators.push("urgency language");
    if (hasCredentials) indicators.push("credential request");
    if (hasSuspiciousDomain) indicators.push("suspicious domain");
    indicators.push("phishing pattern match");
  } else if (phishCount >= 1 || (hasSuspiciousDomain && hasUrgency)) {
    action = "QUARANTINE";
    severity = "high";
    threat_type = "suspicious_email";
    reason = "Suspicious email patterns detected. Email has been quarantined for review — it may be a phishing attempt or spoofed sender.";
    if (hasUrgency) indicators.push("urgency language");
    if (hasSuspiciousDomain) indicators.push("unverified sender domain");
  } else if (hasSuspiciousDomain) {
    action = "SPAM";
    severity = "medium";
    threat_type = "unverified_sender";
    reason = "Sender domain not recognized as a validated healthcare organization. Moved to spam for review.";
    indicators.push("unverified sender");
  } else {
    action = "ALLOW";
    severity = "safe";
    threat_type = null;
    reason = "Email passed all security checks. Sender domain verified, no phishing language detected, and no credential requests found. Safe to proceed.";
  }

  const record = {
    id: uid(),
    timestamp: now(),
    action_taken: action,
    source: "email",
    severity,
    threat_type,
    phi_detected: detectPHI(body),
    reason,
  };
  threatLog.unshift(record);
  if (threatLog.length > 200) threatLog.pop();

  return { action, reason, threat_type, severity, phishing_indicators: indicators };
}

// ── A2A Agent Scan ──────────────────────────────────────────────
export async function mockScanA2A(requesting_agent, action, data, requesting_role = "viewer") {
  await delay(rand(800, 1400));

  const hasPHI = detectPHI(data);
  const { score: threat } = threatScore(data);
  const isExternal = /export|external|http|send to|forward/i.test(action + " " + data);
  const isInjection = INJECTION_SIGNALS.some((p) => p.test(data));

  const rolePermissions = {
    admin: 1.0,
    doctor: 0.85,
    analyst: 0.5,
    viewer: 0.2,
  };
  const roleLevel = rolePermissions[requesting_role] || 0.2;
  const isReadOnly = /read|view|get|fetch|check/i.test(action);

  let decision, reason, severity;

  if (isInjection) {
    decision = "BLOCK";
    severity = "critical";
    reason = `PulseLock has detected a prompt injection attack from agent "${requesting_agent}". This agent attempted to bypass security protocols. The request has been blocked and the incident logged for forensic analysis.`;
  } else if (hasPHI && isExternal) {
    decision = "BLOCK";
    severity = "high";
    reason = `Agent "${requesting_agent}" attempted to exfiltrate patient PHI to an external endpoint. This violates healthcare data compliance rules. Action blocked — patient records remain within the secure network.`;
  } else if (hasPHI && roleLevel < 0.5) {
    decision = "BLOCK";
    severity = "high";
    reason = `Agent "${requesting_agent}" (role: ${requesting_role}) has insufficient permissions to access patient health information. Unauthorized PHI access attempt blocked.`;
  } else if (hasPHI && isReadOnly && roleLevel >= 0.85) {
    decision = "ALLOW";
    severity = "safe";
    reason = `Agent "${requesting_agent}" is authorized (role: ${requesting_role}) for read-only patient data access. Action: "${action}" cleared. Patient privacy maintained — no data leaving the secure boundary.`;
  } else if (threat > 0.5) {
    decision = "BLOCK";
    severity = "high";
    reason = `High threat confidence (${Math.round(threat * 100)}%) detected in agent "${requesting_agent}"'s request payload. Suspicious action pattern blocked.`;
  } else {
    decision = "ALLOW";
    severity = "safe";
    reason = `Agent "${requesting_agent}" passed all security checks. Role "${requesting_role}" is authorized for action "${action}". No PHI exposure, no threat signals. Request cleared.`;
  }

  const record = {
    id: uid(),
    timestamp: now(),
    action_taken: decision,
    source: `agent:${requesting_agent}`,
    severity,
    threat_type: decision === "BLOCK" ? "agent_security_violation" : null,
    phi_detected: hasPHI,
    reason,
  };
  threatLog.unshift(record);
  if (threatLog.length > 200) threatLog.pop();

  return {
    cleared: decision === "ALLOW",
    action: decision,
    reason,
    severity,
    agent: requesting_agent,
    confidence: decision === "BLOCK" ? rand(0.82, 0.97) : rand(0.78, 0.94),
  };
}

// ── Threats / Stats ──────────────────────────────────────────────
export async function mockGetThreats(limit = 50, severity = null) {
  await delay(200);
  let results = severity ? threatLog.filter((t) => t.severity === severity) : threatLog;
  return results.slice(0, limit);
}

export async function mockGetStats() {
  await delay(150);
  const blocked = threatLog.filter((t) => ["BLOCK", "DELETE", "QUARANTINE"].includes(t.action_taken)).length;
  const phi = threatLog.filter((t) => t.phi_detected).length;
  const critical = threatLog.filter((t) => t.severity === "critical").length;
  const lastHour = threatLog.filter((t) => new Date(t.timestamp) > new Date(Date.now() - 3600000));

  return {
    total_events: scanCount,
    blocked,
    phi_leak_attempts: phi,
    critical_threats: critical,
    last_hour: lastHour.length,
    allowed: threatLog.filter((t) => t.action_taken === "ALLOW").length,
  };
}

export async function mockGetSystemStatus() {
  await delay(150);
  const recentThreats = threatLog.filter(
    (t) => new Date(t.timestamp) > new Date(Date.now() - 3600000)
  );
  const criticalRecent = recentThreats.filter((t) => t.severity === "critical").length;
  const highRecent = recentThreats.filter((t) => t.severity === "high").length;

  let status = "stable";
  let status_label = "System Stable";
  let description = "All agents operating normally. No active threats detected.";

  if (criticalRecent > 0) {
    status = "under_threat";
    status_label = "Under Active Threat";
    description = `${criticalRecent} critical incident(s) detected in the last hour. PulseLock is operating in elevated defense mode.`;
  } else if (highRecent > 1 || ruleEvolutions.length > 0) {
    status = "learning";
    status_label = "Learning Mode Active";
    description = "Threat patterns detected. PulseLock is analyzing attack signatures and evolving its defense rules.";
  }

  return {
    status,
    status_label,
    description,
    metrics: {
      critical_last_hour: criticalRecent,
      high_last_hour: highRecent,
      total_last_hour: recentThreats.length,
      learning_cycles_24h: ruleEvolutions.length,
    },
  };
}

// ── Audit ────────────────────────────────────────────────────────
export async function mockRunAudit() {
  await delay(rand(1000, 1800));
  const anomalies = [];
  const criticalCount = threatLog.filter((t) => t.severity === "critical").length;
  const blockedRatio = scanCount > 0 ? threatLog.filter((t) => t.action_taken === "BLOCK").length / scanCount : 0;

  if (criticalCount > 3) anomalies.push(`${criticalCount} critical threats detected — review incident log immediately`);
  if (blockedRatio > 0.4) anomalies.push(`${Math.round(blockedRatio * 100)}% of requests blocked — possible coordinated attack underway`);
  if (ruleEvolutions.length > 5) anomalies.push(`High rule evolution activity (${ruleEvolutions.length} changes) — system is actively adapting`);

  return {
    status: anomalies.length === 0 ? "safe" : anomalies.length <= 2 ? "warning" : "critical",
    anomalies_found: anomalies.length,
    details: anomalies.length > 0 ? anomalies : ["No anomalies detected. Security posture is healthy."],
    timestamp: now(),
  };
}

// ── Self-Learning ────────────────────────────────────────────────
export async function mockTriggerLearning() {
  await delay(rand(1500, 2500));

  const recentThreats = threatLog.filter((t) =>
    new Date(t.timestamp) > new Date(Date.now() - 86400000) && t.action_taken === "BLOCK"
  );

  const newEvolutions = [];
  const typeCounts = {};

  recentThreats.forEach((t) => {
    if (t.threat_type) typeCounts[t.threat_type] = (typeCounts[t.threat_type] || 0) + 1;
  });

  Object.entries(typeCounts).forEach(([type, count]) => {
    if (count >= 2) {
      const alreadyDone = ruleEvolutions.some((e) => e.triggered_by === type && 
        new Date(e.timestamp) > new Date(Date.now() - 3600000));
      if (!alreadyDone) {
        const evo = {
          id: uid(),
          timestamp: now(),
          rule_type: count >= 4 ? "threshold_update" : count >= 3 ? "pattern_learned" : "keyword_added",
          change_description:
            count >= 4
              ? `Threat threshold tightened for "${type.replace(/_/g, " ")}" — ${count} incidents triggered automatic hardening`
              : count >= 3
              ? `New attack pattern catalogued: "${type.replace(/_/g, " ")}" — detection sensitivity increased by 15%`
              : `New keyword signature added from "${type.replace(/_/g, " ")}" attack analysis`,
          triggered_by: type,
          confidence: Math.min(0.5 + count * 0.1, 0.95),
        };
        ruleEvolutions.unshift(evo);
        newEvolutions.push(evo);
      }
    }
  });

  return {
    summary:
      newEvolutions.length > 0
        ? `Learning cycle complete. Analyzed ${recentThreats.length} recent threats and applied ${newEvolutions.length} rule evolution(s).`
        : `Learning cycle complete. ${recentThreats.length} threats analyzed — system rules are already optimized.`,
    threats_analyzed: recentThreats.length,
    evolutions: newEvolutions,
  };
}

// ── Reports ──────────────────────────────────────────────────────
export async function mockTriggerReport() {
  await delay(rand(1500, 2500));

  const blocked = threatLog.filter((t) => ["BLOCK", "DELETE", "QUARANTINE"].includes(t.action_taken)).length;
  const phi = threatLog.filter((t) => t.phi_detected).length;
  const critical = threatLog.filter((t) => t.severity === "critical").length;
  const total = threatLog.length;
  const types = [...new Set(threatLog.map((t) => t.threat_type).filter(Boolean))];

  const month = new Date().toLocaleString("default", { month: "long", year: "numeric" });

  const report = {
    id: uid(),
    period: month,
    generated_at: now(),
    total_threats: total,
    auto_resolved: blocked,
    report_markdown: `# PulseLock AI — Monthly Intelligence Report\n**Period:** ${month}\n\n---\n\n## Executive Summary\n\nPulseLock AI autonomously processed **${scanCount} security events** this period, blocking **${blocked} threats** before they could impact patient data. **${phi} PHI exposure attempts** were neutralized — protecting patient privacy across all monitored channels.\n\n## Threat Breakdown\n\n| Threat Type | Count | Action |\n|---|---|---|\n${types.map((t) => `| ${t.replace(/_/g, " ")} | ${threatLog.filter((l) => l.threat_type === t).length} | BLOCKED |`).join("\n")}\n\n## Key Insights\n\n- 🛡️ **${blocked} threats blocked automatically** — zero human intervention required\n- 🧠 **${ruleEvolutions.length} rule evolution(s)** applied — system is actively learning\n- 📊 **${critical} critical incidents** escalated to security team\n- ✅ **Patient data integrity maintained** — zero confirmed breaches\n\n## System Self-Assessment\n\nPulseLock's AI agents performed ${ruleEvolutions.length > 0 ? "above baseline" : "at expected baseline"} this period. The self-learning engine ${ruleEvolutions.length > 0 ? `evolved ${ruleEvolutions.length} detection rules` : "validated all existing rules"}, ensuring the system remains ahead of emerging threat patterns.\n\n---\n*Generated autonomously by PulseLock AI Intelligence Engine. No human review required.*`,
  };

  reportHistory.unshift(report);
  return report;
}

export async function mockGetReports() {
  await delay(200);
  return reportHistory;
}

export async function mockGetEvolution() {
  await delay(200);
  return ruleEvolutions;
}

// ── Chart / Analytics Data ────────────────────────────────────────
export async function mockGetChartData() {
  await delay(100);

  // Threat type breakdown
  const typeCounts = {};
  threatLog.forEach((t) => {
    if (t.threat_type) typeCounts[t.threat_type] = (typeCounts[t.threat_type] || 0) + 1;
  });

  // 24-hour hourly activity (real + synthetic baseline for visual richness)
  const hourlyActivity = [];
  for (let h = 23; h >= 0; h--) {
    const start = Date.now() - (h + 1) * 3600000;
    const end = Date.now() - h * 3600000;
    const realCount = threatLog.filter((t) => {
      const ts = new Date(t.timestamp).getTime();
      return ts >= start && ts < end;
    }).length;
    const hourOfDay = new Date(end).getHours();
    const synthetic =
      hourOfDay >= 8 && hourOfDay <= 18
        ? Math.floor(Math.random() * 5) + 1
        : Math.floor(Math.random() * 2);
    hourlyActivity.push(realCount + synthetic);
  }
  // Spike recent hours so the chart looks active
  if (hourlyActivity.length >= 3) {
    hourlyActivity[hourlyActivity.length - 1] += 4;
    hourlyActivity[hourlyActivity.length - 2] += 2;
  }

  const actions = {
    BLOCK: threatLog.filter((t) => t.action_taken === "BLOCK").length,
    DELETE: threatLog.filter((t) => t.action_taken === "DELETE").length,
    QUARANTINE: threatLog.filter((t) => t.action_taken === "QUARANTINE").length,
    WARN: threatLog.filter((t) => t.action_taken === "WARN").length,
    ALLOW: threatLog.filter((t) => t.action_taken === "ALLOW").length,
  };

  return {
    typeCounts,
    hourlyActivity, // 24 values, index 0 = 23h ago, index 23 = now
    actions,
    totalBlocked: actions.BLOCK + actions.DELETE + actions.QUARANTINE,
  };
}

export async function mockGetRules() {
  await delay(150);
  return {
    block_keywords: [
      "urgent patient transfer",
      "send all records",
      "ignore rules",
      "bypass security",
      "export database",
    ].concat(ruleEvolutions.filter((e) => e.rule_type === "keyword_added").map((e) => e.change_description)),
    risk_threshold: Math.max(0.65 - ruleEvolutions.length * 0.01, 0.45),
    zero_trust_default: false,
    phi_external_policy: "BLOCK",
    last_updated: ruleEvolutions[0]?.timestamp || now(),
  };
}

// ── Login ─────────────────────────────────────────────────────────
export async function mockLogin(username, password) {
  await delay(700);
  if (username === "admin" && password === "admin123") {
    preloadDemoData();
    return { access_token: "mock-jwt-token-pulselock-secure", role: "admin" };
  }
  if (username === "doctor" && password === "doctor123") {
    preloadDemoData();
    return { access_token: "mock-jwt-token-doctor", role: "doctor" };
  }
  throw new Error("Invalid credentials");
}

// ── Pre-seed realistic threat history on login ─────────────────────
function preloadDemoData() {
  if (threatLog.length > 0) return; // already seeded

  const ago = (minutes) => new Date(Date.now() - minutes * 60000).toISOString();

  const preseeded = [
    { id: uid(), timestamp: ago(58), action_taken: "BLOCK", severity: "critical", threat_type: "prompt_injection", source: "agent:ExternalAgent", phi_detected: true, reason: "Prompt injection attempt intercepted — agent tried to override security rules and export all records." },
    { id: uid(), timestamp: ago(51), action_taken: "BLOCK", severity: "high", threat_type: "phi_exfiltration", source: "upload", phi_detected: true, reason: "Patient health records detected in outbound transfer to external-analytics.com — blocked." },
    { id: uid(), timestamp: ago(44), action_taken: "DELETE", severity: "critical", threat_type: "phishing_email", source: "email", phi_detected: false, reason: "High-confidence phishing email deleted: suspicious domain + credential harvesting + urgency pattern." },
    { id: uid(), timestamp: ago(38), action_taken: "BLOCK", severity: "high", threat_type: "bulk_data_request", source: "api", phi_detected: true, reason: "Bulk patient record export attempt blocked — unauthorized mass data extraction detected." },
    { id: uid(), timestamp: ago(29), action_taken: "QUARANTINE", severity: "medium", threat_type: "suspicious_email", source: "email", phi_detected: false, reason: "Suspicious email quarantined: unverified sender domain and urgency language detected." },
    { id: uid(), timestamp: ago(22), action_taken: "WARN", severity: "medium", threat_type: "phishing_pattern", source: "message", phi_detected: false, reason: "Phishing-style language detected in internal message. User advised to verify before proceeding." },
    { id: uid(), timestamp: ago(15), action_taken: "BLOCK", severity: "high", threat_type: "phi_exfiltration", source: "api", phi_detected: true, reason: "PHI detected in API payload directed to external endpoint — transfer blocked, data secured." },
    { id: uid(), timestamp: ago(8), action_taken: "ALLOW", severity: "safe", threat_type: null, source: "ui", phi_detected: false, reason: "Content cleared — no PHI, no threat patterns. Safe to proceed." },
    { id: uid(), timestamp: ago(3), action_taken: "BLOCK", severity: "critical", threat_type: "prompt_injection", source: "agent:CompromisedAgent", phi_detected: true, reason: "Rogue AI agent attempted bypass of all security rules. Request denied and agent flagged." },
    { id: uid(), timestamp: ago(1), action_taken: "ALLOW", severity: "safe", threat_type: null, source: "ui", phi_detected: false, reason: "Authorized doctor request verified — patient vitals access granted within secure network." },
  ];

  threatLog.push(...preseeded);
  scanCount = preseeded.length;

  ruleEvolutions.push({
    id: uid(),
    timestamp: ago(45),
    rule_type: "pattern_learned",
    change_description: "New attack pattern catalogued: \"phi exfiltration\" — detection sensitivity increased by 15%",
    triggered_by: "phi_exfiltration",
    confidence: 0.88,
  });
}
