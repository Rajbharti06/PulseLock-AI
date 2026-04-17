const BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  login: (username, password) =>
    request("/auth/login", { method: "POST", body: JSON.stringify({ username, password }) }),

  register: (username, password, role) =>
    request("/auth/register", { method: "POST", body: JSON.stringify({ username, password, role }) }),

  scan: (content, source = "ui", destination = "", zero_trust = false) =>
    request("/scan", { method: "POST", body: JSON.stringify({ content, source, destination, zero_trust }) }),

  scanEmail: (sender, subject, body) =>
    request("/scan/email", { method: "POST", body: JSON.stringify({ sender, subject, body }) }),

  scanA2A: (requesting_agent, action, data, requesting_role = "viewer") =>
    request("/scan/a2a", { method: "POST", body: JSON.stringify({ requesting_agent, action, data, requesting_role }) }),

  getThreats: (limit = 50, severity = null) =>
    request(`/threats?limit=${limit}${severity ? `&severity=${severity}` : ""}`),

  getStats: () => request("/threats/stats"),

  runAudit: () => request("/audit"),

  triggerLearning: () => request("/intelligence/learn", { method: "POST" }),

  triggerReport: () => request("/intelligence/report", { method: "POST" }),

  getReports: () => request("/intelligence/reports"),

  getHealth: () => request("/health"),

  getRules: () => request("/rules"),

  getSystemStatus: () => request("/system/status"),

  getEvolution: () => request("/intelligence/evolution"),

  getThreatTimeline: (id) => request(`/threats/${id}/timeline`),
};
