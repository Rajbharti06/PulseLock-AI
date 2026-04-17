import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Scan from "./pages/Scan";
import Incidents from "./pages/Incidents";
import Reports from "./pages/Reports";
import EmailScan from "./pages/EmailScan";
import AgentSim from "./pages/AgentSim";

const PAGES = [
  { id: "dashboard", label: "Dashboard", icon: "⬡" },
  { id: "scan", label: "Scan Content", icon: "⬡" },
  { id: "email", label: "Email Guard", icon: "⬡" },
  { id: "agents", label: "Agent Simulator", icon: "⬡" },
  { id: "incidents", label: "Incidents", icon: "⬡" },
  { id: "reports", label: "Reports", icon: "⬡" },
];

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [page, setPage] = useState("dashboard");

  function handleLogin(tok) {
    localStorage.setItem("token", tok);
    setToken(tok);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setPage("dashboard");
  }

  if (!token) return <Login onLogin={handleLogin} />;

  const pageMap = { dashboard: Dashboard, scan: Scan, email: EmailScan, agents: AgentSim, incidents: Incidents, reports: Reports };
  const PageComponent = pageMap[page] || Dashboard;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-logo">Pulse<span>Lock</span> AI</div>
        {PAGES.map((p) => (
          <div key={p.id} className={`nav-item ${page === p.id ? "active" : ""}`} onClick={() => setPage(p.id)}>
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
