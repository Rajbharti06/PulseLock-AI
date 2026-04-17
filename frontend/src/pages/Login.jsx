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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-title">PulseLock AI</div>
        <div className="login-sub">Autonomous Healthcare Cyber Defense</div>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="field">
            <label className="label">Username</label>
            <input className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="admin" required />
          </div>
          <div className="field">
            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          {error && <div style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</div>}
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : "Access System"}
          </button>
        </form>
        <div style={{ marginTop: "16px", fontSize: "0.75rem", color: "var(--text2)", textAlign: "center" }}>
          Default: admin / admin123
        </div>
      </div>
    </div>
  );
}
