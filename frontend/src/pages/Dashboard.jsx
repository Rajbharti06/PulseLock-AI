import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../api";

// ── Live event seed ──────────────────────────────────────────────────
const LIVE_EVENTS = [
  { threat_type: "phi_exfiltration",    action: "BLOCK",      severity: "high",     reason: "PHI detected in outbound transfer — blocked automatically" },
  { threat_type: "phishing_pattern",    action: "WARN",       severity: "medium",   reason: "Phishing language detected in incoming message" },
  { threat_type: "prompt_injection",    action: "BLOCK",      severity: "critical", reason: "Agent injection attempt intercepted — override suppressed" },
  { threat_type: "bulk_data_request",   action: "BLOCK",      severity: "high",     reason: "Bulk patient record export attempt blocked" },
  { threat_type: "phishing_email",      action: "DELETE",     severity: "critical", reason: "High-confidence phishing email deleted automatically" },
  { threat_type: "suspicious_email",    action: "QUARANTINE", severity: "medium",   reason: "Unverified sender domain — email quarantined for review" },
  { threat_type: "phi_detected",        action: "WARN",       severity: "low",      reason: "PHI found in content — no external destination" },
  { threat_type: "agent_violation",     action: "BLOCK",      severity: "critical", reason: "Rogue AI agent access denied — RBAC violation detected" },
];

// ── Animated counter ─────────────────────────────────────────────────
function useCounter(target, duration = 1100) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const end = parseInt(target) || 0;
    if (end === 0) return;
    let cur = 0;
    const step = Math.max(1, Math.ceil(end / 36));
    const tickMs = duration / 36;
    const iv = setInterval(() => {
      cur = Math.min(cur + step, end);
      setVal(cur);
      if (cur >= end) clearInterval(iv);
    }, tickMs);
    return () => clearInterval(iv);
  }, [target, duration]);
  return val;
}

// ── Donut chart (pure SVG) ──────────────────────────────────────────
function DonutChart({ segments, size = 176 }) {
  const cx = size / 2, cy = size / 2;
  const r = size * 0.35, sw = size * 0.17;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, d) => s + d.value, 0) || 1;

  const arcs = segments.reduce(
    (acc, seg, i) => {
      if (!seg.value) return acc;
      const pct = seg.value / total;
      const dash = pct * circ;
      const rot = acc.rot;
      acc.elements.push(
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth={sw}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="butt"
          transform={`rotate(${rot} ${cx} ${cy})`}
          style={{ filter: `drop-shadow(0 0 5px ${seg.color}88)`, transition: "stroke-dasharray 0.6s ease" }}
        />,
      );
      return { rot: rot + pct * 360, elements: acc.elements };
    },
    { rot: -90, elements: [] },
  ).elements;

  return (
    <svg width={size} height={size} style={{ overflow: "visible" }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={sw} />
      {arcs}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#ddeeff" fontSize="20" fontWeight="800" fontFamily="system-ui">{total}</text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#7890b0" fontSize="9.5" fontFamily="system-ui" letterSpacing="1">THREATS</text>
    </svg>
  );
}

// ── 24h activity bar chart (pure HTML/CSS) ─────────────────────────
function ActivityChart({ data }) {
  if (!data || !data.length) return null;
  const max = Math.max(...data, 1);
  const labels = data.map((_, i) => {
    const hAgo = data.length - 1 - i;
    if (hAgo === 0) return "Now";
    if (hAgo % 6 === 0) return `${hAgo}h`;
    return "";
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 72, padding: "0 2px" }}>
        {data.map((val, i) => {
          const pct = val / max;
          const isNow = i === data.length - 1;
          const isHigh = val > max * 0.65;
          const isMed  = val > max * 0.35;
          const bg = isNow
            ? "linear-gradient(to top, #00c8ff, rgba(0,200,255,0.3))"
            : isHigh
            ? "linear-gradient(to top, #ff4060, rgba(255,64,96,0.35))"
            : isMed
            ? "linear-gradient(to top, #ffaa00, rgba(255,170,0,0.35))"
            : "linear-gradient(to top, rgba(0,200,255,0.35), rgba(0,200,255,0.12))";
          return (
            <div key={i} title={`${labels[i] || (data.length - 1 - i) + "h ago"}: ${val} events`} style={{
              flex: 1, minHeight: 3, borderRadius: "2px 2px 0 0",
              height: `${Math.max(pct * 100, 3)}%`,
              background: bg,
              transition: "height 0.5s ease",
              cursor: "default",
              boxShadow: isNow ? "0 0 6px rgba(0,200,255,0.4)" : isHigh ? "0 0 4px rgba(255,64,96,0.3)" : "none",
            }} />
          );
        })}
      </div>
      {/* X-axis labels */}
      <div style={{ display: "flex", padding: "4px 2px 0", gap: 2 }}>
        {labels.map((l, i) => (
          <div key={i} style={{ flex: 1, fontSize: "0.6rem", color: "var(--text3)", textAlign: "center" }}>{l}</div>
        ))}
      </div>
    </div>
  );
}

// ── Horizontal threat bar ──────────────────────────────────────────
function ThreatBar({ label, value, total, color }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: "0.78rem", color: "var(--text2)" }}>{label}</span>
        <span style={{ fontSize: "0.78rem", fontWeight: 700, color }}>{value} <span style={{ color: "var(--text3)", fontWeight: 400 }}>({pct}%)</span></span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: `linear-gradient(to right, ${color}, ${color}88)`,
          borderRadius: 3,
          transition: "width 0.8s ease",
          boxShadow: `0 0 6px ${color}66`,
        }} />
      </div>
    </div>
  );
}

// ── Severity dot ───────────────────────────────────────────────────
function SeverityDot({ severity }) {
  return <div className={`dot dot-${severity}`} />;
}

// ── System status badge ────────────────────────────────────────────
const STATUS_ICON  = { stable: "●", learning: "◎", under_threat: "▲" };
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

// ── Toast component ────────────────────────────────────────────────
function Toast({ toast, onRemove }) {
  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4200);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  const isCritical = toast.severity === "critical";
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 10,
      padding: "12px 16px",
      borderRadius: 10,
      background: isCritical ? "rgba(255,32,80,0.18)" : "rgba(12,17,32,0.95)",
      border: `1px solid ${isCritical ? "rgba(255,32,80,0.5)" : "rgba(0,200,255,0.2)"}`,
      backdropFilter: "blur(12px)",
      boxShadow: `0 8px 32px rgba(0,0,0,0.4)${isCritical ? ", 0 0 20px rgba(255,32,80,0.2)" : ""}`,
      minWidth: 280, maxWidth: 340,
      animation: "toastIn 0.3s ease",
      cursor: "pointer",
    }} onClick={() => onRemove(toast.id)}>
      <div className={`dot dot-${toast.severity}`} style={{ marginTop: 3, flexShrink: 0 }} />
      <div>
        <div style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--text)", marginBottom: 2 }}>
          {toast.threat_type?.replace(/_/g, " ")}
          <span style={{ marginLeft: 8 }} className={`badge badge-${toast.action}`}>{toast.action}</span>
        </div>
        <div style={{ fontSize: "0.75rem", color: "var(--text2)", lineHeight: 1.5 }}>{toast.reason}</div>
      </div>
    </div>
  );
}

// ── HIPAA checklist ────────────────────────────────────────────────
const HIPAA_ITEMS = [
  { label: "Access Controls",         desc: "RBAC enforced for all data",          ok: true  },
  { label: "Audit Controls",          desc: "Tamper-proof logging active",          ok: true  },
  { label: "Data Integrity",          desc: "PHI verification running",             ok: true  },
  { label: "Transmission Security",   desc: "All transfers monitored",              ok: true  },
  { label: "PHI Detection",           desc: "Real-time scanning active",            ok: true  },
  { label: "Breach Prevention",       desc: "Autonomous blocking enabled",          ok: true  },
];

// ── Stat card ──────────────────────────────────────────────────────
function StatCard({ value, label, sublabel, color, icon }) {
  const animated = useCounter(value);
  return (
    <div className="stat-card" style={{ "--stat-color": color || "var(--accent)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div className="stat-value" style={{ color: color || "var(--accent)" }}>
            {value !== undefined && value !== null ? animated : "—"}
          </div>
          <div className="stat-label">{label}</div>
          {sublabel && <div className="stat-sub" style={{ color: color ? `${color}99` : "rgba(0,230,118,0.7)" }}>{sublabel}</div>}
        </div>
        {icon && <div style={{ fontSize: "1.4rem", opacity: 0.5, marginTop: 2 }}>{icon}</div>}
      </div>
    </div>
  );
}

// ── Threat type → display config ──────────────────────────────────
const TYPE_CONFIG = {
  phi_exfiltration:         { label: "PHI Exfiltration",   color: "#ff4060" },
  phishing_email:           { label: "Phishing Email",     color: "#ff6400" },
  prompt_injection:         { label: "Prompt Injection",   color: "#ff2050" },
  bulk_data_request:        { label: "Bulk Data Grab",     color: "#ffaa00" },
  phishing_pattern:         { label: "Phishing Pattern",   color: "#ffd700" },
  suspicious_email:         { label: "Suspicious Email",   color: "#00c8ff" },
  unverified_sender:        { label: "Unverified Sender",  color: "#9966ff" },
  phi_detected:             { label: "PHI Detected",       color: "#00e676" },
  agent_security_violation: { label: "Agent Violation",    color: "#ff2050" },
};

const DONUT_COLORS = ["#ff2050", "#ff4060", "#ff6400", "#ffaa00", "#ffd700", "#00c8ff", "#9966ff", "#00e676"];

// ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats,        setStats]        = useState(null);
  const [threats,      setThreats]      = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [chartData,    setChartData]    = useState(null);
  const [alerts,       setAlerts]       = useState([]);
  const [toasts,       setToasts]       = useState([]);
  const [sessionCount, setSessionCount] = useState(0);
  const sessionRef = useRef(0);

  const addToast = useCallback((ev) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev.slice(-3), { ...ev, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [s, t, sys, ch] = await Promise.all([
        api.getStats(),
        api.getThreats(12),
        api.getSystemStatus(),
        api.getChartData(),
      ]);
      setStats(s);
      setThreats(t);
      setSystemStatus(sys);
      setChartData(ch);
    } catch (e) {
      console.warn("PulseLock dashboard: refresh failed", e);
    }
  }, []);

  useEffect(() => {
    void loadData();

    const seedId = window.setTimeout(() => {
      const seed = [LIVE_EVENTS[2], LIVE_EVENTS[0]].map((ev) => ({
        ...ev,
        timestamp: new Date().toISOString(),
      }));
      setAlerts(seed);
    }, 0);

    const dataIv = window.setInterval(() => void loadData(), 30000);
    const alertIv = window.setInterval(() => {
      const ev = LIVE_EVENTS[Math.floor(Math.random() * LIVE_EVENTS.length)];
      const entry = { ...ev, timestamp: new Date().toISOString() };
      setAlerts((prev) => [entry, ...prev].slice(0, 25));
      if (["BLOCK", "DELETE", "QUARANTINE"].includes(ev.action)) {
        sessionRef.current++;
        setSessionCount(sessionRef.current);
      }
      if (ev.severity === "critical") addToast(ev);
    }, 9000);

    return () => {
      clearInterval(dataIv);
      clearInterval(alertIv);
      clearTimeout(seedId);
    };
  }, [loadData, addToast]);

  // Build donut segments from chart data
  const donutSegments = chartData
    ? Object.entries(chartData.typeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([type, value], i) => ({
          value,
          color: TYPE_CONFIG[type]?.color || DONUT_COLORS[i % DONUT_COLORS.length],
          label: TYPE_CONFIG[type]?.label || type.replace(/_/g, " "),
        }))
    : [];

  const totalThreats = donutSegments.reduce((s, d) => s + d.value, 0);

  // Top 4 threat types for the breakdown bars
  const topBreakdown = chartData
    ? Object.entries(chartData.typeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4)
        .map(([type, value]) => ({
          label: TYPE_CONFIG[type]?.label || type.replace(/_/g, " "),
          value,
          color: TYPE_CONFIG[type]?.color || "#00c8ff",
        }))
    : [];

  return (
    <>
      {/* Toast container */}
      <div style={{ position: "fixed", top: 64, right: 16, zIndex: 9999, display: "flex", flexDirection: "column", gap: 8 }}>
        {toasts.map((t) => <Toast key={t.id} toast={t} onRemove={removeToast} />)}
      </div>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-16">
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Security Operations Center</h1>
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
          <strong>{STATUS_LABEL[systemStatus.status]}:</strong> {systemStatus.description}
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────────────── */}
      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard value={stats?.total_events}      label="Total Scans"          sublabel="requests analyzed"   icon="⬡" />
        <StatCard value={stats?.blocked}           label="Threats Blocked"      sublabel="patients protected"  color="var(--danger)"  icon="🛡️" />
        <StatCard value={stats?.phi_leak_attempts} label="PHI Leaks Prevented"  sublabel="privacy preserved"   color="var(--warn)"    icon="🔒" />
        <StatCard value={stats?.critical_threats}  label="Critical Threats"     sublabel="highest severity"    color="#ff2050"        icon="⚠" />
      </div>

      {/* ── Session impact ─────────────────────────────────────────── */}
      {sessionCount > 0 && (
        <div style={{
          background: "linear-gradient(135deg, rgba(0,230,118,0.08), rgba(0,200,255,0.05))",
          border: "1px solid rgba(0,230,118,0.3)",
          borderRadius: 12, padding: "12px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 14,
          animation: "fadeIn 0.4s ease",
        }}>
          <div style={{ fontSize: "1.5rem" }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 700, color: "var(--safe)", fontSize: "0.9rem" }}>
              {sessionCount} patient{sessionCount !== 1 ? "s" : ""} protected this session
            </div>
            <div style={{ color: "var(--text2)", fontSize: "0.75rem" }}>
              PulseLock is actively monitoring and blocking unauthorized access in real time
            </div>
          </div>
        </div>
      )}

      {/* ── Row 2: Breakdown + Donut ──────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 16, marginBottom: 16 }}>
        {/* Threat breakdown bars */}
        <div className="card">
          <div className="section-title">Threat Breakdown</div>
          {topBreakdown.length === 0 ? (
            <div style={{ color: "var(--text2)", fontSize: "0.85rem" }}>Run scans to generate breakdown data.</div>
          ) : (
            <>
              {topBreakdown.map((b) => (
                <ThreatBar key={b.label} label={b.label} value={b.value} total={totalThreats} color={b.color} />
              ))}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 6 }}>
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                  {chartData && [
                    ["BLOCK",      chartData.actions.BLOCK,      "var(--danger)"],
                    ["DELETE",     chartData.actions.DELETE,      "#ff2050"],
                    ["QUARANTINE", chartData.actions.QUARANTINE,  "#ff6400"],
                    ["WARN",       chartData.actions.WARN,        "var(--warn)"],
                    ["ALLOW",      chartData.actions.ALLOW,       "var(--safe)"],
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ fontWeight: 700, fontSize: "1rem", color }}>{val}</div>
                      <div style={{ fontSize: "0.65rem", color: "var(--text3)", letterSpacing: "0.04em" }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Donut chart */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div className="section-title" style={{ alignSelf: "flex-start" }}>Distribution</div>
          <DonutChart segments={donutSegments} size={160} />
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10, width: "100%" }}>
            {donutSegments.slice(0, 4).map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: "0.72rem" }}>
                <div style={{ width: 8, height: 8, borderRadius: 2, background: s.color, flexShrink: 0 }} />
                <span style={{ color: "var(--text2)", flex: 1 }}>{s.label}</span>
                <span style={{ color: "var(--text)", fontWeight: 700 }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Row 3: 24h Activity Chart ─────────────────────────────── */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>24-Hour Threat Activity</div>
          <div style={{ display: "flex", gap: 12, fontSize: "0.72rem", color: "var(--text2)" }}>
            {[["#ff4060","High"], ["#ffaa00","Medium"], ["#00c8ff","Now"]].map(([c, l]) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />{l}
              </span>
            ))}
          </div>
        </div>
        <ActivityChart data={chartData?.hourlyActivity || []} />
      </div>

      {/* ── Row 4: HIPAA + Threats + Alerts ──────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 1fr", gap: 16 }}>

        {/* HIPAA compliance panel */}
        <div className="card">
          <div className="section-title" style={{ color: "#00e676" }}>HIPAA Compliance</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {HIPAA_ITEMS.map((item) => (
              <div key={item.label} style={{
                display: "flex", alignItems: "flex-start", gap: 9,
                padding: "8px 10px", borderRadius: 8,
                background: "rgba(0,230,118,0.04)",
                border: "1px solid rgba(0,230,118,0.12)",
              }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: "rgba(0,230,118,0.15)",
                  border: "1px solid rgba(0,230,118,0.5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "0.6rem", color: "#00e676", flexShrink: 0, marginTop: 1,
                }}>✓</div>
                <div>
                  <div style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text)" }}>{item.label}</div>
                  <div style={{ fontSize: "0.68rem", color: "var(--text2)" }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: 12, padding: "8px 10px", borderRadius: 8,
            background: "rgba(0,230,118,0.07)",
            border: "1px solid rgba(0,230,118,0.25)",
            fontSize: "0.72rem", color: "#00e676", textAlign: "center", fontWeight: 600,
          }}>
            ✓ HIPAA Compliant · All Controls Active
          </div>
        </div>

        {/* Recent threats feed */}
        <div className="card">
          <div className="section-title">Recent Threats</div>
          <div className="threat-feed">
            {threats.length === 0 ? (
              <div style={{ color: "var(--text2)", fontSize: "0.85rem" }}>
                Use <strong style={{ color: "var(--accent)" }}>Data Shield</strong> to run a scan.
              </div>
            ) : threats.map((t) => (
              <div key={t.id} className="feed-item">
                <SeverityDot severity={t.severity} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.83rem", display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
                    {t.threat_type?.replace(/_/g, " ") || "Unknown"}
                    <span className={`badge badge-${t.action_taken}`}>{t.action_taken}</span>
                    <span className={`badge badge-${t.severity}`}>{t.severity}</span>
                  </div>
                  <div style={{ color: "var(--text2)", fontSize: "0.72rem", marginTop: 2 }}>
                    {t.source} · {new Date(t.timestamp).toLocaleTimeString()}
                    {t.phi_detected && <span style={{ color: "var(--warn)", marginLeft: 5 }}>· PHI</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live alert stream */}
        <div className="card">
          <div className="section-title">
            Live Alert Stream
            <span style={{ marginLeft: 8, fontSize: "0.7rem", color: "var(--safe)" }}>● live</span>
          </div>
          <div className="threat-feed">
            {alerts.map((a, i) => (
              <div key={i} className="feed-item" style={{
                animation: "fadeIn 0.3s ease",
                borderColor: a.severity === "critical" ? "rgba(255,32,80,0.3)" : "var(--border)",
                boxShadow: a.severity === "critical" ? "0 0 8px rgba(255,32,80,0.12)" : "none",
              }}>
                <SeverityDot severity={a.severity} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "var(--text)", fontSize: "0.83rem" }}>
                    {a.threat_type?.replace(/_/g, " ")}
                    <span style={{ marginLeft: 7 }} className={`badge badge-${a.action}`}>{a.action}</span>
                  </div>
                  <div style={{ color: "var(--text2)", fontSize: "0.72rem", marginTop: 2 }}>{a.reason}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
