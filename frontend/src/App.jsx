import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Scan from "./pages/Scan";
import Incidents from "./pages/Incidents";
import Reports from "./pages/Reports";
import EmailScan from "./pages/EmailScan";
import AgentSim from "./pages/AgentSim";
import Impact from "./pages/Impact";

const PAGES = [
  { id: "impact", label: "Mission", icon: "🌍" },
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "scan", label: "Data Shield", icon: "🛡️" },
  { id: "email", label: "Email Guard", icon: "✉️" },
  { id: "agents", label: "AI Security Gate", icon: "🤖" },
  { id: "incidents", label: "Threat Log", icon: "⚠️" },
  { id: "reports", label: "Intelligence", icon: "🧠" },
];

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [page, setPage] = useState("impact");

  function handleLogin(tok) {
    localStorage.setItem("token", tok);
    setToken(tok);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setPage("impact");
  }

  if (!token) return <Login onLogin={handleLogin} />;

  const pageMap = {
    impact: Impact,
    dashboard: Dashboard,
    scan: Scan,
    email: EmailScan,
    agents: AgentSim,
    incidents: Incidents,
    reports: Reports,
  };
  const PageComponent = pageMap[page] || Impact;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">Pulse<span>Lock</span> AI</div>
        <div style={{ padding: "0 16px 12px", fontSize: "0.68rem", color: "rgba(0,230,118,0.8)", fontWeight: 600, letterSpacing: "0.08em" }}>
          UN SDG 3 · HEALTHCARE DEFENSE
        </div>
        {PAGES.map((p) => (
          <div
            key={p.id}
            className={`nav-item ${page === p.id ? "active" : ""}`}
            onClick={() => setPage(p.id)}
          >
            <span>{p.icon}</span>
            {p.label}
          </div>
        ))}
        <div style={{ marginTop: "auto" }}>
          <div className="nav-item" onClick={handleLogout}>
            <span>↩</span> Logout
          </div>
        </div>
      </aside>
      <main className="main">
        <PageComponent />
      </main>
    </div>
  );
}
