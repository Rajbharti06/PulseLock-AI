import { useState } from "react";
import { api } from "../api";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.login(username, password);
      onLogin(data.access_token);
    } catch (err) {
      const m = typeof err?.message === "string" ? err.message : "";
      const looksNetwork = /fail|fetch|network|Load failed/i.test(m);
      setError(
        looksNetwork
          ? "Demo login runs in the browser. Hard-refresh (Ctrl+F5), then use admin / admin123. Ensure the latest build is deployed from main."
          : "Invalid credentials. Use demo: admin / admin123",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--bg)" }}>
      {/* Left: Mission Panel */}
      <div style={{
        flex: 1,
        background: "linear-gradient(135deg, rgba(0,200,100,0.1) 0%, rgba(0,200,255,0.06) 100%)",
        borderRight: "1px solid var(--border)",
        padding: "60px 48px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}>
        <div style={{
          display: "inline-block", fontSize: "0.68rem", fontWeight: 700,
          letterSpacing: "0.12em", color: "#00e676",
          background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.25)",
          padding: "5px 14px", borderRadius: 99, marginBottom: 24,
        }}>UN SDG 3 · GOOD HEALTH & WELL-BEING</div>

        <div
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            color: "var(--text2)",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          GNEC Hackathon 2026 Spring — Health & sustainability through trustworthy systems
        </div>

        <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text)", lineHeight: 1.3, marginBottom: 16 }}>
          Autonomous AI Defense<br />for Healthcare Systems
        </div>
        <div style={{ fontSize: "0.95rem", color: "var(--text2)", lineHeight: 1.8, maxWidth: 440, marginBottom: 36 }}>
          Every day, healthcare institutions are attacked by bad actors seeking patient data.
          PulseLock is an autonomous, always-on AI system that intercepts and blocks threats
          before they cause harm — protecting patients, providers, and trust.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            ["🛡️", "Blocks PHI leaks in real time"],
            ["🧠", "Multi-agent AI analyzes every request"],
            ["🤖", "Secures AI-to-AI healthcare pipelines"],
            ["📈", "Learns and evolves with every new attack"],
          ].map(([icon, text]) => (
            <div key={text} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8,
                background: "rgba(0,200,255,0.08)",
                border: "1px solid var(--border)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "1rem", flexShrink: 0,
              }}>{icon}</div>
              <span style={{ color: "var(--text)", fontSize: "0.88rem" }}>{text}</span>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: "16px 20px", borderRadius: 10, background: "rgba(0,0,0,0.25)", border: "1px solid var(--border)" }}>
          <div style={{ fontSize: "0.72rem", color: "var(--text2)", marginBottom: 6, letterSpacing: "0.06em" }}>GLOBAL IMPACT</div>
          <div style={{ display: "flex", gap: 32 }}>
            {[["40M+", "Records at risk yearly"], ["$10.9M", "Avg breach cost"], ["1 in 3", "Orgs breached/year"]].map(([n, l]) => (
              <div key={n}>
                <div style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--danger)" }}>{n}</div>
                <div style={{ fontSize: "0.68rem", color: "var(--text2)", marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Login Form */}
      <div style={{
        width: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 40,
      }}>
        <div style={{ width: "100%" }}>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--accent)", marginBottom: 4 }}>PulseLock AI</div>
          <div style={{ color: "var(--text2)", fontSize: "0.85rem", marginBottom: 32 }}>Autonomous Healthcare Cyber Defense</div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label className="label">Username</label>
              <input
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
              />
            </div>
            <div className="field">
              <label className="label">Password</label>
              <input
                className="input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {error && <div style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</div>}
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginTop: 4 }}>
              {loading ? <span className="spinner" /> : "Access System"}
            </button>
          </form>

          <div style={{ marginTop: 20, fontSize: "0.75rem", color: "var(--text2)", textAlign: "center" }}>
            Demo credentials: <strong style={{ color: "var(--text)" }}>admin</strong> / <strong style={{ color: "var(--text)" }}>admin123</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
