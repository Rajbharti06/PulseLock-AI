import { useState, useEffect, useCallback } from "react";
import { api } from "../api";

const EVO_COLORS = {
  threshold_update: "var(--warn)",
  keyword_added:    "var(--accent)",
  pattern_learned:  "var(--safe)",
};

function MiniBar({ value, max, color = "var(--accent)" }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99, transition: "width 0.5s ease" }} />
      </div>
      <span style={{ fontSize: "0.72rem", color: "var(--text2)", minWidth: 24, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function MetricPill({ label, value, color = "var(--accent)" }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "12px 18px", borderRadius: 10,
      background: `${color}12`, border: `1px solid ${color}30`,
      flex: 1,
    }}>
      <div style={{ fontSize: "1.5rem", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: "0.68rem", color: "var(--text2)", textAlign: "center", marginTop: 3, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function ReportViewer({ report }) {
  if (!report) return <div style={{ color: "var(--text2)", padding: 8 }}>Select a report to view.</div>;

  const lines = (report.report_markdown || "").split("\n");
  const maxVal = Math.max(report.total_threats || 0, 1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Metric pills */}
      <div style={{ display: "flex", gap: 10 }}>
        <MetricPill label="Total Threats"  value={report.total_threats}  color="var(--accent)" />
        <MetricPill label="Critical"       value={report.critical_count} color="var(--danger)" />
        <MetricPill label="Blocked"        value={report.blocked_count}  color="#ff6400"       />
        <MetricPill label="Auto Resolved"  value={report.auto_resolved}  color="var(--safe)"   />
      </div>

      {/* Bar breakdown */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {[
          { label: "Critical",      value: report.critical_count, color: "var(--danger)" },
          { label: "Blocked",       value: report.blocked_count,  color: "#ff6400"       },
          { label: "Auto Resolved", value: report.auto_resolved,  color: "var(--safe)"   },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "0.72rem", color: "var(--text2)", width: 100, flexShrink: 0 }}>{label}</span>
            <MiniBar value={value} max={maxVal} color={color} />
          </div>
        ))}
      </div>

      {/* Report text */}
      <div style={{
        background: "rgba(0,0,0,0.25)", border: "1px solid var(--border)",
        borderRadius: 10, padding: "16px 18px",
        fontSize: "0.83rem", lineHeight: 1.85, color: "var(--text2)",
        maxHeight: 360, overflowY: "auto",
      }}>
        {lines.map((line, i) => {
          if (line.startsWith("# "))
            return <div key={i} style={{ fontWeight: 800, fontSize: "1rem", color: "var(--text)", marginBottom: 10, marginTop: i > 0 ? 16 : 0 }}>{line.slice(2)}</div>;
          if (line.startsWith("## "))
            return <div key={i} style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--accent)", marginBottom: 8, marginTop: 14 }}>{line.slice(3)}</div>;
          if (line.startsWith("- "))
            return <div key={i} style={{ paddingLeft: 14, position: "relative", marginBottom: 3 }}>
              <span style={{ position: "absolute", left: 2, color: "var(--accent)" }}>·</span>
              {line.slice(2)}
            </div>;
          if (line.trim() === "")
            return <div key={i} style={{ height: 6 }} />;
          return <div key={i} style={{ marginBottom: 3 }}>{line}</div>;
        })}
      </div>
    </div>
  );
}

export default function Reports() {
  const [tab, setTab] = useState("reports");
  const [reports, setReports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [learning, setLearning] = useState(false);
  const [learningResult, setLearningResult] = useState(null);
  const [evolution, setEvolution] = useState([]);
  const [evoLoading, setEvoLoading] = useState(false);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data);
      if (data.length > 0) setSelected(data[0].id);
    } catch (e) {
      console.warn("PulseLock reports failed", e);
    }
    setLoading(false);
  }, []);

  const loadEvolution = useCallback(async () => {
    setEvoLoading(true);
    try {
      setEvolution(await api.getEvolution());
    } catch (e) {
      console.warn("PulseLock evolution fetch failed", e);
    }
    setEvoLoading(false);
  }, []);

  useEffect(() => {
    void loadReports();
  }, [loadReports]);

  useEffect(() => {
    if (tab === "evolution") void loadEvolution();
  }, [tab, loadEvolution]);

  async function generate() {
    setGenerating(true);
    try {
      const r = await api.triggerReport();
      setReports((prev) => [r, ...prev]);
      setSelected(r.id);
    } catch (e) {
      console.warn("PulseLock report generation failed", e);
    }
    setGenerating(false);
  }

  async function runLearning() {
    setLearning(true);
    try {
      const r = await api.triggerLearning();
      setLearningResult(r);
      if (r.evolutions?.length > 0) {
        await loadEvolution();
        setTab("evolution");
      }
    } catch (e) {
      console.warn("PulseLock learning cycle failed", e);
    }
    setLearning(false);
  }

  const selectedReport = reports.find((r) => r.id === selected);
  const maxThreats = Math.max(...reports.map(r => r.total_threats || 0), 1);

  return (
    <>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: 2 }}>Intelligence</h1>
          <div style={{ fontSize: "0.78rem", color: "var(--text2)" }}>
            Threat intelligence reports · Adaptive learning logs
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={runLearning} disabled={learning}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {learning ? <span className="spinner" /> : <>⟳ Run Learning Cycle</>}
          </button>
          <button className="btn btn-primary" onClick={generate} disabled={generating}
            style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {generating ? <span className="spinner" /> : <>◆ Generate Report</>}
          </button>
        </div>
      </div>

      {/* Learning result banner */}
      {learningResult && (
        <div style={{
          marginBottom: 16, padding: "12px 16px", borderRadius: 10,
          border: "1px solid rgba(0,230,118,0.35)", background: "rgba(0,230,118,0.06)",
          fontSize: "0.85rem",
        }}>
          <strong style={{ color: "var(--safe)" }}>Learning Complete:</strong>{" "}
          <span style={{ color: "var(--text2)" }}>{learningResult.summary}</span>
          {learningResult.evolutions?.length > 0 && (
            <span style={{ marginLeft: 8, color: "var(--accent)" }}>
              — {learningResult.evolutions.length} rule evolution(s) applied
            </span>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 16 }}>
        <div className={`tab ${tab === "reports" ? "active" : ""}`} onClick={() => setTab("reports")}>Monthly Reports</div>
        <div className={`tab ${tab === "evolution" ? "active" : ""}`} onClick={() => setTab("evolution")}>Rule Evolution</div>
      </div>

      {tab === "reports" && (
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 14, alignItems: "start" }}>
          {/* Report list */}
          <div className="card">
            <div className="section-title">Report History</div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 20 }}><span className="spinner" /></div>
            ) : reports.length === 0 ? (
              <div style={{ color: "var(--text2)", fontSize: "0.83rem" }}>No reports yet. Generate your first report.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {reports.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelected(r.id)}
                    style={{
                      padding: "12px 14px", borderRadius: 9, cursor: "pointer",
                      border: `1px solid ${selected === r.id ? "var(--accent)" : "var(--border)"}`,
                      background: selected === r.id ? "rgba(0,200,255,0.08)" : "rgba(0,0,0,0.2)",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ fontWeight: 700, color: "var(--text)", fontSize: "0.88rem" }}>{r.period}</div>
                    <div style={{ fontSize: "0.72rem", color: "var(--text2)", marginTop: 3 }}>
                      {new Date(r.generated_at).toLocaleDateString()}
                    </div>
                    <div style={{ marginTop: 8 }}>
                      <MiniBar value={r.total_threats} max={maxThreats} color={selected === r.id ? "var(--accent)" : "var(--text3)"} />
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      <span style={{ fontSize: "0.68rem", color: "var(--danger)" }}>⊘ {r.blocked_count} blocked</span>
                      <span style={{ fontSize: "0.68rem", color: "var(--safe)" }}>✓ {r.auto_resolved} resolved</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Report detail */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>
                {selectedReport ? selectedReport.period : "Report"}
              </div>
              {selectedReport && (
                <span style={{ fontSize: "0.72rem", color: "var(--text3)" }}>
                  Generated {new Date(selectedReport.generated_at).toLocaleString()}
                </span>
              )}
            </div>
            <ReportViewer report={selectedReport} />
          </div>
        </div>
      )}

      {tab === "evolution" && (
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
            <div className="section-title" style={{ marginBottom: 0 }}>Rule Evolution Log</div>
            <span style={{ fontSize: "0.72rem", color: "var(--text3)" }}>{evolution.length} evolution{evolution.length !== 1 ? "s" : ""}</span>
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text2)", marginBottom: 18 }}>
            Every time PulseLock learns from new attacks, it evolves its detection rules and records what changed.
          </div>

          {evoLoading ? (
            <div style={{ textAlign: "center", padding: 20 }}><span className="spinner" /></div>
          ) : evolution.length === 0 ? (
            <div style={{ color: "var(--text2)", fontSize: "0.83rem" }}>
              No rule evolutions yet. Run a learning cycle after threats are detected.
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              {/* Timeline line */}
              <div style={{
                position: "absolute", left: 11, top: 14, bottom: 14,
                width: 1, background: "var(--border)",
              }} />

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {evolution.map((e) => {
                  const color = EVO_COLORS[e.rule_type] || "var(--accent)";
                  return (
                    <div key={e.id} style={{ display: "flex", gap: 16, position: "relative" }}>
                      {/* Timeline dot */}
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: `${color}22`, border: `2px solid ${color}`,
                        flexShrink: 0, marginTop: 2,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "0.6rem", color,
                      }}>◆</div>

                      <div style={{
                        flex: 1, padding: "12px 16px", borderRadius: 10,
                        border: "1px solid var(--border)", background: "rgba(0,0,0,0.2)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                          <span style={{
                            fontSize: "0.68rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                            background: `${color}22`, color,
                          }}>
                            {e.rule_type.replace(/_/g, " ").toUpperCase()}
                          </span>
                          <span style={{
                            fontSize: "0.68rem", color: e.confidence >= 0.8 ? "var(--safe)" : "var(--warn)",
                            fontWeight: 600,
                          }}>
                            {Math.round(e.confidence * 100)}% confidence
                          </span>
                          <span style={{ marginLeft: "auto", fontSize: "0.72rem", color: "var(--text3)" }}>
                            {new Date(e.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", marginBottom: 5 }}>
                          {e.change_description}
                        </div>
                        <div style={{ fontSize: "0.78rem", color: "var(--text2)" }}>
                          Triggered by: {e.triggered_by}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
