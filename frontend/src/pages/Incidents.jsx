import { useState, useEffect, useCallback } from "react";
import { api } from "../api";

const SEVERITIES = ["all", "critical", "high", "medium", "low", "safe"];

const SEV_CFG = {
  critical: { color: "var(--danger)", bg: "rgba(255,64,96,0.12)" },
  high:     { color: "#ff8c00",       bg: "rgba(255,140,0,0.10)" },
  medium:   { color: "var(--warn)",   bg: "rgba(255,170,0,0.10)" },
  low:      { color: "var(--accent)", bg: "rgba(0,200,255,0.08)" },
  safe:     { color: "var(--safe)",   bg: "rgba(0,230,118,0.08)" },
};

const ACT_CFG = {
  BLOCK:      { color: "var(--danger)", icon: "⊘" },
  DELETE:     { color: "#ff6400",       icon: "✕" },
  QUARANTINE: { color: "var(--warn)",   icon: "◈" },
  WARN:       { color: "#8888aa",       icon: "⚠" },
  ALLOW:      { color: "var(--safe)",   icon: "✓" },
};

function SevBadge({ sev }) {
  const c = SEV_CFG[sev] || SEV_CFG.low;
  return (
    <span style={{
      fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
      background: c.bg, color: c.color, textTransform: "uppercase", letterSpacing: "0.06em",
    }}>{sev}</span>
  );
}

function ActBadge({ act }) {
  const c = ACT_CFG[act] || ACT_CFG.ALLOW;
  return (
    <span style={{ color: c.color, fontWeight: 700, fontSize: "0.82rem" }}>
      {c.icon} {act}
    </span>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10,
      padding: "14px 18px",
    }}>
      <div style={{
        fontSize: "0.68rem", color: "var(--text2)", fontWeight: 700,
        letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6,
      }}>{label}</div>
      <div style={{ fontSize: "1.7rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function DetailPanel({ t, onClose }) {
  const act = ACT_CFG[t.action_taken] || ACT_CFG.ALLOW;
  const rows = [
    ["Threat Type",   t.threat_type?.replace(/_/g, " ") || "—"],
    ["Severity",      <SevBadge sev={t.severity} />],
    ["Action",        <ActBadge act={t.action_taken} />],
    ["Source",        t.source || "—"],
    ["Destination",   t.destination || "—"],
    ["PHI Detected",  t.phi_detected
      ? <span style={{ color: "var(--danger)" }}>Yes — Protected</span>
      : <span style={{ color: "var(--safe)" }}>No PHI</span>],
    ["Confidence",    `${Math.round((t.confidence || 0.9) * 100)}%`],
    ["Time",          new Date(t.timestamp).toLocaleString()],
  ];

  return (
    <div className="card" style={{ position: "sticky", top: 60 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div className="section-title" style={{ marginBottom: 0 }}>Incident Detail</div>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text3)", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>✕</button>
      </div>

      <div style={{
        textAlign: "center", padding: "16px 0 18px",
        borderBottom: `2px solid ${act.color}33`, marginBottom: 16,
      }}>
        <div style={{ fontSize: "1.8rem", fontWeight: 800, color: act.color }}>
          {act.icon} {t.action_taken}
        </div>
        <div style={{ fontSize: "0.78rem", color: "var(--text2)", marginTop: 6, lineHeight: 1.5 }}>
          {t.reason}
        </div>
      </div>

      {rows.map(([k, v]) => (
        <div key={k} style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: "0.82rem",
        }}>
          <span style={{ color: "var(--text2)" }}>{k}</span>
          <span style={{ color: "var(--text)", textAlign: "right", maxWidth: 180 }}>{v}</span>
        </div>
      ))}

      {["BLOCK","DELETE","QUARANTINE"].includes(t.action_taken) && (
        <div style={{
          marginTop: 14, padding: "10px 14px", borderRadius: 8,
          background: "rgba(0,230,118,0.07)", border: "1px solid rgba(0,230,118,0.25)",
          fontSize: "0.78rem", color: "var(--safe)", lineHeight: 1.6,
        }}>
          ✓ Patient data secured — unauthorized access prevented
        </div>
      )}
    </div>
  );
}

export default function Incidents() {
  const [threats, setThreats] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getThreats(100, filter === "all" ? null : filter);
      setThreats(data);
      setSelected(null);
    } catch (e) {
      console.warn("PulseLock threat log failed", e);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAudit() {
    setAuditLoading(true);
    try {
      setAudit(await api.runAudit());
    } catch (e) {
      console.warn("PulseLock audit failed", e);
    }
    setAuditLoading(false);
  }

  const counts = threats.reduce((acc, t) => { acc[t.severity] = (acc[t.severity] || 0) + 1; return acc; }, {});
  const blocked = threats.filter(t => ["BLOCK","DELETE","QUARANTINE"].includes(t.action_taken)).length;
  const phiCount = threats.filter(t => t.phi_detected).length;
  const selectedThreat = threats.find(t => t.id === selected);

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Threat Log</h1>
          <div style={{ fontSize: "0.78rem", color: "var(--text2)" }}>
            Real-time threat detection · HIPAA incident records
          </div>
        </div>
        <button className="btn btn-ghost" onClick={runAudit} disabled={auditLoading}
          style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {auditLoading ? <span className="spinner" /> : <>⬡ Run Security Audit</>}
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Total Events"  value={threats.length}       color="var(--accent)" />
        <StatCard label="Threats Blocked" value={blocked}            color="var(--danger)" />
        <StatCard label="PHI Detected"  value={phiCount}             color="var(--warn)"   />
        <StatCard label="Critical"      value={counts.critical || 0} color="#ff4060"       />
      </div>

      {/* Audit result */}
      {audit && (
        <div style={{
          marginBottom: 16, padding: "12px 16px", borderRadius: 10,
          border: `1px solid ${audit.status === "safe" ? "rgba(0,230,118,0.4)" : "rgba(255,170,0,0.4)"}`,
          background: audit.status === "safe" ? "rgba(0,230,118,0.06)" : "rgba(255,170,0,0.06)",
        }}>
          <div style={{ fontWeight: 700, color: audit.status === "safe" ? "var(--safe)" : "var(--warn)", marginBottom: audit.details?.length ? 8 : 0 }}>
            ⬡ Audit Result: {audit.status.toUpperCase()} — {audit.anomalies_found} anomalies detected
          </div>
          {audit.details?.length > 0 && (
            <ul style={{ paddingLeft: 20, fontSize: "0.82rem", color: "var(--text2)", display: "flex", flexDirection: "column", gap: 3 }}>
              {audit.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Filter tabs with counts */}
      <div className="tabs" style={{ marginBottom: 14 }}>
        {SEVERITIES.map((s) => (
          <div key={s} className={`tab ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
            {s !== "all" && counts[s] > 0 && (
              <span style={{ marginLeft: 5, fontSize: "0.68rem", opacity: 0.7 }}>({counts[s]})</span>
            )}
          </div>
        ))}
      </div>

      {/* Table + detail panel */}
      <div style={{ display: "grid", gridTemplateColumns: selectedThreat ? "1fr 320px" : "1fr", gap: 14, alignItems: "start" }}>
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 40 }}><span className="spinner" /></div>
          ) : threats.length === 0 ? (
            <div style={{ color: "var(--text2)", padding: 24 }}>No incidents found for this filter.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Threat Type</th>
                  <th>Severity</th>
                  <th>Source</th>
                  <th>Action</th>
                  <th>PHI</th>
                </tr>
              </thead>
              <tbody>
                {threats.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelected(selected === t.id ? null : t.id)}
                    style={{
                      cursor: "pointer",
                      borderLeft: selected === t.id ? "3px solid var(--accent)" : "3px solid transparent",
                      background: selected === t.id ? "rgba(0,200,255,0.05)" : "transparent",
                      transition: "background 0.15s",
                    }}
                  >
                    <td style={{ whiteSpace: "nowrap", fontSize: "0.78rem" }}>
                      <div style={{ color: "var(--text2)" }}>
                        {new Date(t.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text3)" }}>
                        {new Date(t.timestamp).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ fontSize: "0.82rem", fontWeight: 600 }}>
                      {t.threat_type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "—"}
                    </td>
                    <td><SevBadge sev={t.severity} /></td>
                    <td style={{ color: "var(--text2)", fontSize: "0.82rem" }}>{t.source}</td>
                    <td><ActBadge act={t.action_taken} /></td>
                    <td>
                      <span style={{
                        fontSize: "0.75rem",
                        color: t.phi_detected ? "var(--danger)" : "var(--text3)",
                        fontWeight: t.phi_detected ? 700 : 400,
                      }}>
                        {t.phi_detected ? "● PHI" : "○"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedThreat && (
          <DetailPanel t={selectedThreat} onClose={() => setSelected(null)} />
        )}
      </div>
    </>
  );
}
