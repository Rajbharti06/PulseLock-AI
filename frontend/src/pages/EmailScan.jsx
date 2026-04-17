import { useState } from "react";
import { api } from "../api";

const SAMPLE_PHISH = {
  sender: "admin@hospital-secure.net",
  subject: "URGENT: Verify your credentials immediately",
  body: "Your account will be suspended. Click here urgently to verify your login and confirm patient details now. This action required within 24 hours.",
};

const SAMPLE_SAFE = {
  sender: "dr.wilson@hospital.org",
  subject: "Patient follow-up reminder",
  body: "Please remember to update the treatment notes for the patient scheduled tomorrow at 10am.",
};

const actionColors = { ALLOW: "var(--safe)", SPAM: "var(--warn)", QUARANTINE: "#ff6400", DELETE: "var(--danger)" };

export default function EmailScan() {
  const [form, setForm] = useState({ sender: "", subject: "", body: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k) {
    return (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleScan(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const data = await api.scanEmail(form.sender, form.subject, form.body);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1 className="page-title">Email Guard</h1>
      <div className="grid grid-2" style={{ alignItems: "start" }}>
        <div className="card">
          <div className="section-title">Analyze Email</div>
          <form onSubmit={handleScan} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label className="label">Sender</label>
              <input className="input" value={form.sender} onChange={set("sender")} placeholder="sender@domain.com" required />
            </div>
            <div className="field">
              <label className="label">Subject</label>
              <input className="input" value={form.subject} onChange={set("subject")} placeholder="Email subject" required />
            </div>
            <div className="field">
              <label className="label">Body</label>
              <textarea className="input" value={form.body} onChange={set("body")} placeholder="Email body..." required />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button type="button" className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "6px 12px" }}
                onClick={() => setForm(SAMPLE_PHISH)}>Load: Phishing Email</button>
              <button type="button" className="btn btn-ghost" style={{ fontSize: "0.78rem", padding: "6px 12px" }}
                onClick={() => setForm(SAMPLE_SAFE)}>Load: Safe Email</button>
            </div>
            {error && <div style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? <span className="spinner" /> : "Analyze Email"}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="section-title">Email Analysis</div>
          {!result && !loading && <div style={{ color: "var(--text2)", fontSize: "0.85rem" }}>Submit an email to analyze.</div>}
          {loading && <div style={{ textAlign: "center", padding: 40 }}><span className="spinner" /></div>}
          {result && (
            <div className="result-section">
              <div style={{ fontSize: "1.8rem", fontWeight: 700, color: actionColors[result.action] || "var(--text)" }}>
                {result.action}
              </div>
              <div style={{ color: "var(--text2)", fontSize: "0.85rem" }}>{result.reason}</div>

              <div className="card" style={{ padding: 14 }}>
                {[
                  ["Threat Type", result.threat_type?.replace(/_/g, " ") || "None"],
                  ["Severity", <span className={`badge badge-${result.severity}`}>{result.severity}</span>],
                ].map(([k, v]) => (
                  <div key={k} className="detail-row" style={{ padding: "6px 0", borderBottom: "1px solid var(--border)" }}>
                    <span className="detail-key">{k}</span>
                    <span className="detail-val">{v}</span>
                  </div>
                ))}
              </div>

              {result.phishing_indicators?.length > 0 && (
                <div>
                  <div className="label">Detected Indicators</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.phishing_indicators.map((ind, i) => (
                      <span key={i} className="badge badge-high">{ind}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
