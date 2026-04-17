import { useState, useEffect } from "react";
import { api } from "../api";

const TABS = ["reports", "evolution"];

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

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (tab === "evolution" && evolution.length === 0) loadEvolution();
  }, [tab]);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await api.getReports();
      setReports(data);
      if (data.length > 0) setSelected(data[0].id);
    } catch {}
    setLoading(false);
  }

  async function loadEvolution() {
    setEvoLoading(true);
    try {
      setEvolution(await api.getEvolution());
    } catch {}
    setEvoLoading(false);
  }

  async function generate() {
    setGenerating(true);
    try {
      const r = await api.triggerReport();
      setReports((prev) => [r, ...prev]);
      setSelected(r.id);
    } catch {}
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
    } catch {}
    setLearning(false);
  }

  const selectedReport = reports.find((r) => r.id === selected);
  const evoTypeColors = {
    threshold_update: "var(--warn)",
    keyword_added: "var(--accent)",
    pattern_learned: "var(--safe)",
  };

  return (
    <>
      <div className="flex items-center justify-between mb-16">
        <h1 className="page-title" style={{ marginBottom: 0 }}>Intelligence</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={runLearning} disabled={learning}>
            {learning ? <span className="spinner" /> : "Run Learning Cycle"}
          </button>
          <button className="btn btn-primary" onClick={generate} disabled={generating}>
            {generating ? <span className="spinner" /> : "Generate Report"}
          </button>
        </div>
      </div>

      {learningResult && (
        <div className="alert-box alert-ALLOW" style={{ marginBottom: 16 }}>
          <strong>Learning Complete:</strong> {learningResult.summary}
          {learningResult.evolutions?.length > 0 && (
            <span style={{ marginLeft: 8, color: "var(--accent)" }}>
              {learningResult.evolutions.length} rule evolution(s) applied.
            </span>
          )}
        </div>
      )}

      <div className="tabs">
        <div className={`tab ${tab === "reports" ? "active" : ""}`} onClick={() => setTab("reports")}>Monthly Reports</div>
        <div className={`tab ${tab === "evolution" ? "active" : ""}`} onClick={() => setTab("evolution")}>Rule Evolution</div>
      </div>

      {tab === "reports" && (
        <div className="grid grid-2" style={{ alignItems: "start" }}>
          <div className="card">
            <div className="section-title">Report History</div>
            {loading ? (
              <div style={{ textAlign: "center", padding: 20 }}><span className="spinner" /></div>
            ) : reports.length === 0 ? (
              <div style={{ color: "var(--text2)" }}>No reports yet. Generate your first report.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {reports.map((r) => (
                  <div key={r.id} onClick={() => setSelected(r.id)} style={{
                    padding: "12px 16px", borderRadius: 8, cursor: "pointer",
                    border: `1px solid ${selected === r.id ? "var(--accent)" : "var(--border)"}`,
                    background: selected === r.id ? "rgba(0,200,255,0.08)" : "rgba(0,0,0,0.2)",
                    transition: "all 0.15s",
                  }}>
                    <div style={{ fontWeight: 600, color: "var(--text)" }}>{r.period}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text2)", marginTop: 2 }}>
                      {new Date(r.generated_at).toLocaleDateString()} · {r.total_threats} threats · {r.auto_resolved} resolved
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="card">
            <div className="section-title">Report</div>
            {!selectedReport ? (
              <div style={{ color: "var(--text2)" }}>Select a report to view.</div>
            ) : (
              <div className="report-content">{selectedReport.report_markdown || "No content."}</div>
            )}
          </div>
        </div>
      )}

      {tab === "evolution" && (
        <div className="card">
          <div className="section-title">Rule Evolution Log</div>
          <div style={{ fontSize: "0.82rem", color: "var(--text2)", marginBottom: 16 }}>
            Every time PulseLock learns from attacks, it records what changed and why.
          </div>
          {evoLoading ? (
            <div style={{ textAlign: "center", padding: 20 }}><span className="spinner" /></div>
          ) : evolution.length === 0 ? (
            <div style={{ color: "var(--text2)" }}>
              No rule evolutions yet. Run a learning cycle after threats are detected.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {evolution.map((e) => (
                <div key={e.id} style={{
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  background: "rgba(0,0,0,0.2)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{
                      fontSize: "0.72rem", fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                      background: `${evoTypeColors[e.rule_type] || "var(--accent)"}22`,
                      color: evoTypeColors[e.rule_type] || "var(--accent)",
                    }}>
                      {e.rule_type.replace(/_/g, " ").toUpperCase()}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--text2)", marginLeft: "auto" }}>
                      {new Date(e.timestamp).toLocaleString()}
                    </span>
                    <span style={{
                      fontSize: "0.72rem", color: e.confidence >= 0.8 ? "var(--safe)" : "var(--warn)",
                    }}>
                      {Math.round(e.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text)", marginBottom: 4 }}>
                    {e.change_description}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text2)" }}>
                    Triggered by: {e.triggered_by}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
