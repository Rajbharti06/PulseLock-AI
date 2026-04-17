import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Scan from "./pages/Scan";
import Incidents from "./pages/Incidents";
import Reports from "./pages/Reports";
import EmailScan from "./pages/EmailScan";
import AgentSim from "./pages/AgentSim";
import Impact from "./pages/Impact";

const NAV = [
  {
    section: "Overview",
    items: [
      { id: "impact",     label: "Mission",           icon: "◎" },
      { id: "dashboard",  label: "Dashboard",         icon: "▦" },
    ],
  },
  {
    section: "Protection",
    items: [
      { id: "scan",       label: "Data Shield",       icon: "⬡" },
      { id: "email",      label: "Email Guard",       icon: "✉" },
      { id: "agents",     label: "AI Security Gate",  icon: "⟳" },
    ],
  },
  {
    section: "Intelligence",
    items: [
      { id: "incidents",  label: "Threat Log",        icon: "◈" },
      { id: "reports",    label: "Intelligence",      icon: "◆" },
    ],
  },
];

const PAGE_TITLES = {
  impact: "Mission",
  dashboard: "Security Dashboard",
  scan: "Data Shield",
  email: "Email Guard",
  agents: "AI Security Gate",
  incidents: "Threat Log",
  reports: "Intelligence",
};

const PAGE_MAP = { impact: Impact, dashboard: Dashboard, scan: Scan, email: EmailScan, agents: AgentSim, incidents: Incidents, reports: Reports };

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

  const PageComponent = PAGE_MAP[page] || Impact;

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span style={{ fontSize: "1.1rem" }}>⬡</span>
            Pulse<span>Lock</span>
          </div>
          <div className="sidebar-badge">UN SDG 3 · HEALTHCARE AI</div>
        </div>

        <nav className="sidebar-nav">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="nav-section-label">{group.section}</div>
              {group.items.map((p) => (
                <div
                  key={p.id}
                  className={`nav-item ${page === p.id ? "active" : ""}`}
                  onClick={() => setPage(p.id)}
                >
                  <span className="nav-icon">{p.icon}</span>
                  {p.label}
                </div>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-status">
            <div className="pulse-dot" />
            <span>System Online</span>
          </div>
          <div className="nav-item" onClick={handleLogout} style={{ color: "var(--text3)" }}>
            <span className="nav-icon">↩</span> Sign Out
          </div>
        </div>
      </aside>

      <div className="topbar">
        <span style={{ color: "var(--text2)", fontSize: "0.78rem" }}>PulseLock</span>
        <div className="topbar-sep" />
        <span className="topbar-title">{PAGE_TITLES[page]}</span>
        <div style={{ flex: 1 }} />
        <div className="chip chip-green" style={{ fontSize: "0.65rem" }}>
          <div className="pulse-dot" style={{ width: 6, height: 6 }} />
          PROTECTED
        </div>
      </div>

      <main className="main">
        <PageComponent />
      </main>
    </div>
  );
}
