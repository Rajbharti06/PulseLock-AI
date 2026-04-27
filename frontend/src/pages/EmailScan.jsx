import { useState } from "react";
import { api } from "../api";

const SAMPLE_PHISH = {
  sender: "admin@hospital-secure.net",
  subject: "URGENT: Verify your credentials immediately",
  body: "Your account will be suspended. Click here urgently to verify your login and confirm patient details now. This action required within 24 hours.",
};

const SAMPLE_SAFE = {
  sender: "dr.wilson@hospital.org",
  subject: "Team meeting reminder",
  body: "Just a reminder about our weekly team sync tomorrow at 10am. Please bring your department updates.",
};

const SAMPLE_SOCIAL = {
  sender: "hr-noreply@hospitalpayroll.io",
  subject: "Your payroll file is ready — download required",
  body: "Click the secure link to download your payroll document. Login with your hospital credentials to access the file. This link expires in 2 hours.",
};

const ACTION_CFG = {
  ALLOW:      { color: "var(--safe)",   label: "Delivered",    desc: "Email appears legitimate and safe to deliver." },
  SPAM:       { color: "var(--warn)",   label: "Marked Spam",  desc: "Email flagged as unwanted or suspicious content." },
  QUARANTINE: { color: "#ff6400",       label: "Quarantined",  desc: "Email isolated — requires admin review before delivery." },
  DELETE:     { color: "var(--danger)", label: "Deleted",      desc: "Email destroyed — confirmed malicious threat." },
};

function RiskGauge({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 75 ? "var(--danger)" : pct >= 45 ? "var(--warn)" : "var(--safe)";
  const radius = 38;
  const circ = 2 * Math.PI * radius;
  const filled = circ * (pct / 100);
  const label = pct >= 75 ? "High Risk" : pct >= 45 ? "Medium Risk" : "Low Risk";

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={100} height={100} viewBox="0 0 100 100">
        <circle cx={50} cy={50} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <circle
          cx={50} cy={50} r={radius} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeDashoffset={circ * 0.25}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease, stroke 0.4s" }}
        />
        <text x={50} y={46} textAnchor="middle" fill={color} fontSize={14} fontWeight={800}>{pct}%</text>
        <text x={50} y={60} textAnchor="middle" fill="rgba(120,144,176,0.9)" fontSize={7}>{label}</text>
      </svg>
    </div>
  );
}

function IndicatorTag({ label }) {
  return (
    <span style={{
      fontSize: "0.7rem", padding: "3px 10px", borderRadius: 99,
      background: "rgba(255,64,96,0.12)", color: "var(--danger)",
      border: "1px solid rgba(255,64,96,0.3)", fontWeight: 600,
    }}>{label}</span>
  );
}

export default function EmailScan() {
  const [form, setForm] = useState({ sender: "", subject: "", body: "" });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k) { return (e) => setForm((f) => ({ ...f, [k]: e.target.value })); }

  async function handleScan(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      setResult(await api.scanEmail(form.sender, form.subject, form.body));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const cfg = result ? (ACTION_CFG[result.action] || ACTION_CFG.ALLOW) : null;
  const isBlocked = result && ["QUARANTINE", "DELETE", "SPAM"].includes(result.action);

  return (
    <>
      <h1 className="page-title">Email Guard</h1>
      <div className="page-subtitle">Phishing detection · Social engineering analysis · PHI exposure scanning</div>

      {/* Preset examples */}
      <div style={{
        background: "rgba(0,200,255,0.04)", border: "1px solid var(--border)",
        borderRadius: 12, padding: "14px 18px", marginBottom: 20,
      }}>
        <div style={{ fontSize: "0.72rem", color: "var(--text2)", marginBottom: 10, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Load Test Scenario
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {[
            { label: "✉ Phishing Attack",       sample: SAMPLE_PHISH,   badge: "THREAT",  bc: "var(--danger)" },
            { label: "✉ Social Engineering",    sample: SAMPLE_SOCIAL,  badge: "THREAT",  bc: "var(--warn)"   },
            { label: "✉ Legitimate Email",      sample: SAMPLE_SAFE,    badge: "SAFE",    bc: "var(--safe)"   },
          ].map(({ label, sample, badge, bc }) => (
            <button
              key={label}
              type="button"
              className="btn btn-ghost"
              onClick={() => { setForm(sample); setResult(null); }}
              style={{ fontSize: "0.78rem", display: "flex", alignItems: "center", gap: 8 }}
            >
              {label}
              <span style={{
                fontSize: "0.62rem", padding: "1px 7px", borderRadius: 99,
                background: `${bc}1a`, color: bc, fontWeight: 700,
              }}>{badge}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-2" style={{ alignItems: "start" }}>
        {/* Form */}
        <div className="card">
          <div className="section-title">Analyze Email</div>
          <form onSubmit={handleScan} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field">
              <label className="label">Sender Address</label>
              <input className="input" value={form.sender} onChange={set("sender")} placeholder="sender@domain.com" required />
            </div>
            <div className="field">
              <label className="label">Subject Line</label>
              <input className="input" value={form.subject} onChange={set("subject")} placeholder="Email subject" required />
            </div>
            <div className="field">
              <label className="label">Email Body</label>
              <textarea className="input" value={form.body} onChange={set("body")} rows={6} placeholder="Paste email body here..." required style={{ resize: "vertical" }} />
            </div>
            {error && <div style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <span className="spinner" /> : "✉ Analyze Email"}
            </button>
          </form>
        </div>

        {/* Result */}
        <div className="card">
          <div className="section-title">Analysis Result</div>

          {!result && !loading && (
            <div style={{ color: "var(--text2)", fontSize: "0.85rem", lineHeight: 1.7 }}>
              Submit an email to see PulseLock's threat analysis, risk score, and detected indicators.
              <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                {["PHI / sensitive data detection", "Phishing URL and sender analysis", "Social engineering pattern matching", "Urgency and credential harvesting signals"].map(cap => (
                  <div key={cap} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: "0.78rem", color: "var(--text3)" }}>
                    <span style={{ color: "var(--accent)" }}>◆</span> {cap}
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: "center", padding: 40 }}>
              <span className="spinner" />
              <div style={{ color: "var(--text2)", fontSize: "0.82rem", marginTop: 12 }}>Scanning email for threats…</div>
            </div>
          )}

          {result && cfg && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, animation: "slideUp 0.3s ease" }}>
              {/* Action + gauge */}
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "1.7rem", fontWeight: 800, color: cfg.color }}>{cfg.label}</div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text2)", marginTop: 4 }}>{cfg.desc}</div>
                </div>
                <RiskGauge score={result.risk_score ?? (isBlocked ? 0.82 : 0.18)} />
              </div>

              {/* Threat/severity row */}
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{
                  flex: 1, padding: "10px 14px", borderRadius: 9,
                  background: "rgba(0,0,0,0.25)", border: "1px solid var(--border)",
                  fontSize: "0.82rem",
                }}>
                  <div style={{ color: "var(--text2)", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>Threat Type</div>
                  <div style={{ color: "var(--text)", fontWeight: 600 }}>
                    {result.threat_type?.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "None Detected"}
                  </div>
                </div>
                <div style={{
                  flex: 1, padding: "10px 14px", borderRadius: 9,
                  background: "rgba(0,0,0,0.25)", border: "1px solid var(--border)",
                  fontSize: "0.82rem",
                }}>
                  <div style={{ color: "var(--text2)", fontSize: "0.68rem", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 4 }}>Severity</div>
                  <span className={`badge badge-${result.severity}`}>{result.severity}</span>
                </div>
              </div>

              {/* Reason */}
              <div style={{
                padding: "12px 16px", borderRadius: 9,
                background: isBlocked ? "rgba(255,64,96,0.07)" : "rgba(0,230,118,0.07)",
                border: `1px solid ${isBlocked ? "rgba(255,64,96,0.25)" : "rgba(0,230,118,0.25)"}`,
                fontSize: "0.83rem", color: "var(--text2)", lineHeight: 1.6,
              }}>
                <span style={{ color: isBlocked ? "var(--danger)" : "var(--safe)", fontWeight: 700 }}>
                  {isBlocked ? "⚠ " : "✓ "}
                </span>
                {result.reason}
              </div>

              {/* Phishing indicators */}
              {result.phishing_indicators?.length > 0 && (
                <div>
                  <div style={{ fontSize: "0.72rem", color: "var(--text2)", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
                    Detected Indicators ({result.phishing_indicators.length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {result.phishing_indicators.map((ind, i) => <IndicatorTag key={i} label={ind} />)}
                  </div>
                </div>
              )}

              {/* What PulseLock did */}
              {isBlocked && (
                <div style={{
                  padding: "10px 14px", borderRadius: 9,
                  background: "rgba(0,200,255,0.05)", border: "1px solid var(--border)",
                }}>
                  <div style={{ fontSize: "0.72rem", color: "var(--accent)", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
                    Actions Taken
                  </div>
                  {["Email delivery blocked", "Threat logged to incident database", "Detection rules reinforced"].map(a => (
                    <div key={a} style={{ fontSize: "0.78rem", color: "var(--text2)", display: "flex", gap: 8, marginBottom: 4 }}>
                      <span style={{ color: "var(--safe)" }}>✓</span> {a}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
