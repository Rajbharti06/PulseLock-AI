import { useState, useEffect, useRef } from "react";
import { api } from "../api";

const WS_BASE = (import.meta.env.VITE_API_URL || "https://pulselock-backend.onrender.com")
  .replace(/^https/, "wss")
  .replace(/^http/, "ws");

function StatCard({ value, label, sublabel, color }) {
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color: color || "var(--accent)" }}>{value ?? "—"}</div>
      <div className="stat-label">{label}</div>
      {sublabel && <div style={{ fontSize: "0.68rem", color: "rgba(0,230,118,0.7)", marginTop: 3 }}>{sublabel}</div>}
    </div>
  );
}

function SeverityDot({ severity }) {
  return <div className={`dot dot-${severity}`} />;
}

function SystemStatusBadge({ status }) {
  const config = {
    stable: { color: "var(--safe)", bg: "rgba(0,230,118,0.1)", border: "rgba(0,230,118,0.3)", icon: "●", label: "System Stable" },
    learning: { color: "var(--warn)", bg: "rgba(255,170,0,0.1)", border: "rgba(255,170,0,0.3)", icon: "◎", label: "Learning Mode" },
    under_threat: { color: "var(--danger)", bg: "rgba(255,64,96,0.12)", border: "rgba(255,64,96,0.4)", icon: "▲", label: "Under Threat" },
  };
  const c = config[status] || config.stable;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 99, border: `1px solid ${c.border}`, background: c.bg }}>
      <span style={{ color: c.color, fontSize: "0.7rem" }}>{c.icon}</span>
      <span style={{ color: c.color, fontSize: "0.82rem", fontWeight: 600 }}>{c.label}</span>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const wsRef = useRef(null);
  const [wsConnected, setWsConnected] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);

    const ws = new WebSocket(`${WS_BASE}/ws/alerts`);
    wsRef.current = ws;
    ws.onopen = () => setWsConnected(true);
    ws.onclose = () => setWsConnected(false);
    ws.onmessage = (e) => {
      try { setAlerts((prev) => [JSON.parse(e.data), ...prev].slice(0, 20)); } catch {}
    };

    return () => {
      clearInterval(interval);
      ws.close();
    };
  }, []);

  async function loadData() {
    try {
      const [s, t, sys] = await Promise.all([api.getStats(), api.getThreats(10), api.getSystemStatus()]);
      setStats(s);
      setThreats(t);
      setSystemStatus(sys);
    } catch {}
  }

  return (
    <>
      <div className="flex items-center justify-between mb-16">
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Security Dashboard</h1>
          <div style={{ fontSize: "0.75rem", color: "rgba(0,230,118,0.8)", fontWeight: 600, letterSpacing: "0.06em" }}>
            SDG 3 · Protecting Patient Privacy in Real Time
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {systemStatus && <SystemStatusBadge status={systemStatus.status} />}
          <div className="status-bar" style={{ marginBottom: 0 }}>
            <div className={wsConnected ? "pulse-dot" : "dot dot-critical"} />
            <span style={{ fontSize: "0.78rem", color: "var(--text2)" }}>{wsConnected ? "Live" : "Offline"}</span>
          </div>
        </div>
      </div>

      {systemStatus && systemStatus.status !== "stable" && (
        <div className={`alert-box alert-${systemStatus.status === "under_threat" ? "BLOCK" : "WARN"}`} style={{ marginBottom: 20, fontSize: "0.85rem" }}>
          <strong>{systemStatus.status_label}:</strong> {systemStatus.description}
        </div>
      )}

      <div className="grid grid-4" style={{ marginBottom: 24 }}>
        <StatCard value={stats?.total_events} label="Total Scans" sublabel="requests analyzed" />
        <StatCard value={stats?.blocked} label="Threats Blocked" sublabel="patients protected" color="var(--danger)" />
        <StatCard value={stats?.phi_leak_attempts} label="PHI Leaks Prevented" sublabel="privacy preserved" color="var(--warn)" />
        <StatCard value={stats?.critical_threats} label="Critical Threats" sublabel="highest severity" color="#ff2050" />
      </div>

      {systemStatus && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>System Intelligence Metrics</div>
            <div style={{ display: "flex", gap: 24 }}>
              {[
                ["Critical (1h)", systemStatus.metrics.critical_last_hour, "var(--danger)"],
                ["High (1h)", systemStatus.metrics.high_last_hour, "#ff6400"],
                ["Events (1h)", systemStatus.metrics.total_last_hour, "var(--accent)"],
                ["Learning Cycles (24h)", systemStatus.metrics.learning_cycles_24h, "var(--safe)"],
              ].map(([label, val, color]) => (
                <div key={label} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "1.3rem", fontWeight: 700, color }}>{val}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text2)", marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">Recent Threats</div>
          <div className="threat-feed">
            {threats.length === 0 && (
              <div style={{ color: "var(--text2)", fontSize: "0.85rem" }}>No threats recorded yet. Run a scan to begin.</div>
            )}
            {threats.map((t) => (
              <div key={t.id} className="feed-item">
                <SeverityDot severity={t.severity} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 6 }}>
                    {t.threat_type?.replace(/_/g, " ") || "Unknown"}
                    <span className={`badge badge-${t.action_taken}`}>{t.action_taken}</span>
                    <span className={`badge badge-${t.severity}`}>{t.severity}</span>
                  </div>
                  <div style={{ color: "var(--text2)", fontSize: "0.75rem", marginTop: 3 }}>
                    {t.source} · {new Date(t.timestamp).toLocaleTimeString()}
                    {t.phi_detected && <span style={{ color: "var(--warn)", marginLeft: 6 }}>· PHI detected</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="section-title">
            Live Alert Stream
            {wsConnected && <span style={{ marginLeft: 8, fontSize: "0.72rem", color: "var(--safe)" }}>● live</span>}
          </div>
          <div className="threat-feed">
            {alerts.length === 0 && (
              <div style={{ color: "var(--text2)", fontSize: "0.85rem" }}>
                {wsConnected ? "Monitoring… no alerts yet." : "Connecting to alert stream…"}
              </div>
            )}
            {alerts.map((a, i) => (
              <div key={i} className="feed-item">
                <SeverityDot severity={a.severity} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.85rem" }}>
                    {a.threat_type?.replace(/_/g, " ")}
                    <span style={{ marginLeft: 8 }} className={`badge badge-${a.action}`}>{a.action}</span>
                  </div>
                  <div style={{ color: "var(--text2)", fontSize: "0.75rem", marginTop: 2 }}>{a.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
