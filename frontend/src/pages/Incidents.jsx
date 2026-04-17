import { useState, useEffect } from "react";
import { api } from "../api";

const SEVERITIES = ["all", "critical", "high", "medium", "low", "safe"];

export default function Incidents() {
  const [threats, setThreats] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState(null);
  const [auditLoading, setAuditLoading] = useState(false);

  useEffect(() => {
    load();
  }, [filter]);

  async function load() {
    setLoading(true);
    try {
      const data = await api.getThreats(100, filter === "all" ? null : filter);
      setThreats(data);
    } catch {}
    setLoading(false);
  }

  async function runAudit() {
    setAuditLoading(true);
    try {
      const data = await api.runAudit();
      setAudit(data);
    } catch {}
    setAuditLoading(false);
  }

  return (
    <>
      <div className="flex items-center justify-between mb-16">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Incidents</h1>
        <button className="btn btn-ghost" onClick={runAudit} disabled={auditLoading}>
          {auditLoading ? <span className="spinner" /> : "Run Security Audit"}
        </button>
      </div>

      {audit && (
        <div className={`alert-box alert-${audit.status === "safe" ? "ALLOW" : audit.status === "warning" ? "WARN" : "BLOCK"}`} style={{ marginBottom: 16 }}>
          <strong>Audit: {audit.status.toUpperCase()}</strong> — {audit.anomalies_found} anomalies
          {audit.details.length > 0 && (
            <ul style={{ marginTop: 6, paddingLeft: 20 }}>
              {audit.details.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
        </div>
      )}

      <div className="tabs">
        {SEVERITIES.map((s) => (
          <div key={s} className={`tab ${filter === s ? "active" : ""}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}><span className="spinner" /></div>
        ) : threats.length === 0 ? (
          <div style={{ color: "var(--text2)", padding: 20 }}>No incidents found.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Type</th>
                <th>Severity</th>
                <th>Source</th>
                <th>Action</th>
                <th>PHI</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {threats.map((t) => (
                <tr key={t.id}>
                  <td style={{ whiteSpace: "nowrap", color: "var(--text2)" }}>
                    {new Date(t.timestamp).toLocaleString()}
                  </td>
                  <td>{t.threat_type?.replace(/_/g, " ") || "—"}</td>
                  <td><span className={`badge badge-${t.severity}`}>{t.severity}</span></td>
                  <td>{t.source}</td>
                  <td><span className={`badge badge-${t.action_taken}`}>{t.action_taken}</span></td>
                  <td style={{ color: t.phi_detected ? "var(--danger)" : "var(--safe)" }}>
                    {t.phi_detected ? "Yes" : "No"}
                  </td>
                  <td style={{ color: "var(--text2)", maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
