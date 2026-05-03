// ============================================================
// PulseLock AI — Simplified analyzeData Engine
// Provides the core decision logic for the input simulation module
// ============================================================

export const analyzeData = async (input) => {
  await new Promise((r) => setTimeout(r, 800));

  const lower = input.toLowerCase();

  // PHI + external email → BLOCK
  if (lower.includes("patient") && lower.includes("email")) {
    return {
      decision: "BLOCK",
      confidence: 0.94,
      reason: "Unauthorized PHI transfer detected",
      severity: "HIGH",
      impact: [
        "Patient data secured",
        "Leak prevented",
        "Compliance maintained",
      ],
      logs: [
        "Request intercepted",
        "PHI detected",
        "Threat classified as data exfiltration",
        "Action blocked",
        "Security rule updated",
      ],
      learning: "Block external transmission of patient data",
    };
  }

  // Prompt injection patterns
  if (
    lower.includes("ignore") &&
    (lower.includes("rules") || lower.includes("instructions"))
  ) {
    return {
      decision: "BLOCK",
      confidence: 0.97,
      reason: "Prompt injection attack detected — override attempt suppressed",
      severity: "CRITICAL",
      impact: [
        "Injection neutralized",
        "AI integrity preserved",
        "Security rules intact",
      ],
      logs: [
        "Request intercepted",
        "Injection pattern identified",
        "Override attempt detected",
        "Malicious payload blocked",
        "Agent flagged for review",
        "Rule evolution triggered",
      ],
      learning:
        "Tighten detection for prompt injection patterns targeting rule override",
    };
  }

  // Unauthorized access
  if (
    lower.includes("access") &&
    lower.includes("without") &&
    lower.includes("authorization")
  ) {
    return {
      decision: "BLOCK",
      confidence: 0.91,
      reason: "Unauthorized access attempt to protected health records",
      severity: "HIGH",
      impact: [
        "Unauthorized access denied",
        "Patient records protected",
        "HIPAA compliance maintained",
      ],
      logs: [
        "Request intercepted",
        "Authorization check failed",
        "Access control violation detected",
        "Action blocked",
        "Incident logged to audit trail",
      ],
      learning: "Strengthen RBAC enforcement for record access requests",
    };
  }

  // Bulk data / export attempts
  if (
    lower.includes("all") &&
    (lower.includes("records") ||
      lower.includes("database") ||
      lower.includes("export"))
  ) {
    return {
      decision: "BLOCK",
      confidence: 0.89,
      reason: "Bulk data extraction attempt blocked",
      severity: "HIGH",
      impact: [
        "Mass data exposure prevented",
        "Patient privacy preserved",
        "Data residency enforced",
      ],
      logs: [
        "Request intercepted",
        "Bulk access pattern detected",
        "Volume threshold exceeded",
        "Action blocked",
        "Detection rules reinforced",
      ],
      learning: "Flag all bulk data extraction requests for review",
    };
  }

  // PHI detected but no external destination → QUARANTINE
  if (
    lower.includes("patient") ||
    lower.includes("medical") ||
    lower.includes("diagnosis") ||
    lower.includes("prescription")
  ) {
    return {
      decision: "QUARANTINE",
      confidence: 0.78,
      reason: "PHI detected — content quarantined for compliance review",
      severity: "MEDIUM",
      impact: [
        "Content isolated for review",
        "PHI flagged for compliance",
        "No data exposure occurred",
      ],
      logs: [
        "Request intercepted",
        "PHI patterns detected",
        "Content quarantined",
        "Compliance team notified",
      ],
      learning: "Monitor PHI-containing requests for policy adherence",
    };
  }

  // Safe request — no threat
  return {
    decision: "ALLOW",
    confidence: 0.85,
    reason: "No threat detected",
    severity: "LOW",
    impact: ["Safe operation"],
    logs: ["Request verified", "No anomaly detected"],
    learning: "No update required",
  };
};
