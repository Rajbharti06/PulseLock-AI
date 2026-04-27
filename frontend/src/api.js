// ============================================================
// PulseLock AI — API Layer (Offline Demo Mode)
// All calls routed through the local mock intelligence engine.
// Backend will be connected when Render deployment is live.
// ============================================================

import {
  mockLogin,
  mockScan,
  mockScanEmail,
  mockScanA2A,
  mockGetThreats,
  mockGetStats,
  mockGetSystemStatus,
  mockRunAudit,
  mockTriggerLearning,
  mockTriggerReport,
  mockGetReports,
  mockGetEvolution,
  mockGetRules,
  mockGetChartData,
} from "./mockEngine";

export const api = {
  login:        (username, password) => mockLogin(username, password),
  scan:         (content, source, destination, zero_trust) => mockScan(content, source, destination, zero_trust),
  scanEmail:    (sender, subject, body) => mockScanEmail(sender, subject, body),
  scanA2A:      (requesting_agent, action, data, requesting_role) => mockScanA2A(requesting_agent, action, data, requesting_role),
  getThreats:   (limit, severity) => mockGetThreats(limit, severity),
  getStats:     () => mockGetStats(),
  getSystemStatus: () => mockGetSystemStatus(),
  runAudit:     () => mockRunAudit(),
  triggerLearning: () => mockTriggerLearning(),
  triggerReport:   () => mockTriggerReport(),
  getReports:   () => mockGetReports(),
  getChartData: () => mockGetChartData(),
  getHealth:    () => Promise.resolve({ status: "online", mode: "demo" }),
  getRules:     () => mockGetRules(),
  getSystemStatus: () => mockGetSystemStatus(),
  getEvolution: () => mockGetEvolution(),
  getThreatTimeline: () => Promise.resolve([]),
};
