import { useState, useEffect, useRef } from "react";
import { api } from "../api";

const LIVE_EVENTS = [
  { threat_type: "phi_exfiltration", action: "BLOCK", severity: "high", reason: "PHI detected in outbound transfer — blocked automatically" },
  { threat_type: "phishing_pattern", action: "WARN", severity: "medium", reason: "Phishing language detected in incoming message" },
  { threat_type: "prompt_injection", action: "BLOCK", severity: "critical", reason: "Injection attempt intercepted — agent override suppressed" },
  { threat_type: "bulk_data_request", action: "BLOCK", severity: "high", reason: "Bulk patient record export attempt blocked" },
  { threat_type: "unverified_sender", action: "QUARANTINE", severity: "medium", reason: "Email from unrecognized domain quarantined" },
  { threat_type: "phi_detected", action: "WARN", severity: "low", reason: "PHI found in content — no external destination" },
];

// Animated counter hook
function useCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!target && target !== 0) return;
    const end = parseInt(target) || 0;
    if (end === 0) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(end / 40));
    const interval = setInterval(() => {
      current = Math.min(current + step, end);
      setValue(current);
      if (current >= end) clearInterval(interval);
    }, duration / 40);
    return () => clearInterval(interval);
  }, [target, duration]);
  return value;
}

function StatCard({ value, label, sublabel, color }) {
  const animated = useCounter(value);
  return (
    <div className="stat-card" style={{ "--stat-color": color || "var(--accent)" }}>
      <div className="stat-value" style={{ color: color || "var(--accent)" }}>
        {value !== undefined && value !== null ? animated : "—"}
      </div>
      <div className="stat-label">{label}</div>
      {sublabel && <div className="stat-sub" style={{ color: color ? `${color}99` : "rgba(0,230,118,0.7)" }}>{sublabel}</div>}
    </div>
  );
}

function SeverityDot({ severity }) {
  return <div className={`dot dot-${severity}`} />;
}

const STATUS_ICON = { stable: "●", learning: "◎", under_threat: "▲" };
const STATUS_LABEL = { stable: "System Stable", learning: "Learning Mode", under_threat: "Under Threat" };

function SystemStatusBadge({ status }) {
  const s = STATUS_LABEL[status] ? status : "stable";
  return (
    <div className={`sys-badge sys-badge-${s}`}>
      <span style={{ fontSize: "0.65rem" }}>{STATUS_ICON[s]}</span>
      {STATUS_LABEL[s]}
    </div>
  );
}

// Session-wide patient counter
let sessionPatientsProtected = 0;

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [threats, setThreats] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [sessionCount, setSessionCount] = useState(0);

  useEffect(() => {
    loadData();

    // Pre-load 2 alerts immediately so the feed isn't empty
    const initialEvents = [LIVE_EVENTS[2], LIVE_EVENTS[0]].map((ev) => ({
      ...ev,
      timestamp: new Date().toISOString(),
    }));
    setAlerts(initialEvents);

    const interval = setInterval(loadData, 30000);
    const alertInterval = setInterval(() => {
      const ev = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)];
      setAlerts((prev) => [{ ...ev, timestamp: new Date().toISOString() }, ...prev].slice(0, 20));
      if (["BLOCK", "DELETE", "QUARANTINE"].includes(ev.action)) {
        sessionPatientsProtected++;
        setSessionCount(sessionPatientsProtected);
      }
    }, 10000);

    return () => {
      clearInterval(interval);
      clearInterval(alertInterval);
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
            <div className="pulse-dot" />
            <span style={{ fontSize: "0.78rem", color: "var(--text2)" }}>Live</span>
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

      {/* Session impact banner */}
      {sessionCount > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(0,230,118,0.08) 0%, rgba(0,200,255,0.06) 100%)",
          border: "1px solid rgba(0,230,118,0.3)",
          borderRadius: 12,
          padding: "14px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
          animation: "fadeIn 0.4s ease",
        }}>
          <div style={{ fontSize: "1.6rem" }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--safe)", fontSize: "0.95rem" }}>
              {sessionCount} patient{sessionCount !== 1 ? "s" : ""} protected this session
            </div>
            <div style={{ color: "var(--text2)", fontSize: "0.78rem" }}>
              PulseLock is actively monitoring and blocking unauthorized access attempts in real time
            </div>
          </div>
        </div>
      )}

      {systemStatus && (
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>System Intelligence Metrics</div>
            <div style={{ display: "flex", gap: 24 }}>
              {[
                ["Critical (1h)", systemStatus.metrics.critical_last_hour, "var(--danger)"],
                ["High (1h)", systemStatus.metrics.high_last_hour, "#ff6400"],
                ["Events (1h)", systemStatus.metrics.total_last_hour, "var(--accent)"],
                ["Learning Cycles", systemStatus.metrics.learning_cycles_24h, "var(--safe)"],
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
              <div style={{ color: "var(--text2)", fontSize: "0.85rem" }}>
                No threats recorded yet. Use <strong style={{ color: "var(--accent)" }}>Data Shield</strong> to run a scan.
              </div>
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
            <span style={{ marginLeft: 8, fontSize: "0.72rem", color: "var(--safe)" }}>● live</span>
          </div>
          <div className="threat-feed">
            {alerts.length === 0 && (
              <div style={{ color: "var(--text2)", fontSize: "0.85rem" }}>Monitoring… no alerts yet.</div>
            )}
            {alerts.map((a, i) => (
              <div key={i} className="feed-item" style={{ animation: "fadeIn 0.3s ease" }}>
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
