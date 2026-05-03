import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataShieldMode from "./pages/DataShieldMode";
import Scan from "./pages/Scan";
import Incidents from "./pages/Incidents";
import Reports from "./pages/Reports";
import EmailScan from "./pages/EmailScan";
import AgentSim from "./pages/AgentSim";
import Impact from "./pages/Impact";
import TopBar from "./components/TopBar";

const NAV = [
  {
    section: "Overview",
    items: [
      { id: "datashield", label: "Data Shield Mode",  icon: "🛡️" },
      { id: "impact",     label: "Mission",           icon: "◎" },
      { id: "dashboard",  label: "Dashboard",         icon: "▦" },
    ],
  },
  {
    section: "Protection",
    items: [
      { id: "scan",       label: "Data Shield (Legacy)",icon: "⬡" },
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
  datashield: "Data Shield Mode",
  impact: "Mission",
  dashboard: "Security Dashboard",
  scan: "Data Shield (Legacy)",
  email: "Email Guard",
  agents: "AI Security Gate",
  incidents: "Threat Log",
  reports: "Intelligence",
};

const PAGE_MAP = {
  datashield: DataShieldMode,
  impact: Impact,
  dashboard: Dashboard,
  scan: Scan,
  email: EmailScan,
  agents: AgentSim,
  incidents: Incidents,
  reports: Reports,
};

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [page, setPage] = useState("datashield");

  function handleLogin(tok) {
    localStorage.setItem("token", tok);
    setToken(tok);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    setPage("datashield");
  }

  if (!token) return <Login onLogin={handleLogin} />;

  const PageComponent = PAGE_MAP[page] || DataShieldMode;

  return (
    <div className="app flex flex-col h-screen">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
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
                  {p.id === "datashield" && (
                    <span
                      style={{
                        marginLeft: "auto",
                        fontSize: "0.58rem",
                        fontWeight: 700,
                        padding: "1px 6px",
                        borderRadius: 99,
                        background: "rgba(0,255,156,0.15)",
                        color: "#00FF9C",
                        letterSpacing: "0.06em",
                      }}
                    >
                      LIVE
                    </span>
                  )}
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
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text2)" }}>
            Real-time AI firewall for healthcare systems
          </span>
          <div className="topbar-sep" />
          <div className="chip chip-green" style={{ fontSize: "0.65rem" }}>
            <div className="pulse-dot" style={{ width: 6, height: 6 }} />
            PROTECTED
          </div>
        </div>
      </div>

      <main className="main flex-1 flex flex-col overflow-hidden relative">
        <PageComponent />
      </main>
      </div>
    </div>
  );
}
