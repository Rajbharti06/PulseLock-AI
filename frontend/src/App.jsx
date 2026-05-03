import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataShieldMode from "./pages/DataShieldMode";
import PulseLab from "./pages/PulseLab";
import Incidents from "./pages/Incidents";
import Reports from "./pages/Reports";
import EmailScan from "./pages/EmailScan";
import AgentSim from "./pages/AgentSim";
import Impact from "./pages/Impact";
import TopBar from "./components/TopBar";
import NavProvider from "./nav/NavProvider";

const NAV = [
  {
    section: "Overview",
    items: [
      { id: "impact", label: "Mission (SDG 3)", icon: "◎" },
      { id: "dashboard", label: "Security Dashboard", icon: "▦" },
      { id: "datashield", label: "Data Shield Demo", icon: "🛡️" },
    ],
  },
  {
    section: "Protection",
    items: [
      { id: "scan", label: "Threat Analyzer", icon: "⬡" },
      { id: "email", label: "Email Guard", icon: "✉" },
      { id: "agents", label: "AI Security Gate (A2A)", icon: "⟳" },
    ],
  },
  {
    section: "Intelligence",
    items: [
      { id: "incidents", label: "Threat Log", icon: "◈" },
      { id: "reports", label: "Intelligence", icon: "◆" },
    ],
  },
];

const PAGE_TITLES = {
  datashield: "Data Shield Demo",
  impact: "Mission",
  dashboard: "Security Dashboard",
  scan: "Threat Analyzer",
  email: "Email Guard",
  agents: "AI Security Gate",
  incidents: "Threat Log",
  reports: "Intelligence",
};

const PAGE_MAP = {
  datashield: DataShieldMode,
  impact: Impact,
  dashboard: Dashboard,
  scan: PulseLab,
  email: EmailScan,
  agents: AgentSim,
  incidents: Incidents,
  reports: Reports,
};

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
    setPage("datashield");
  }

  if (!token) return <Login onLogin={handleLogin} />;

  const PageComponent = PAGE_MAP[page] || Impact;

  const navValue = { go: setPage, page, titles: PAGE_TITLES };

  return (
    <NavProvider value={navValue}>
    <div className="app" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <TopBar />
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
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
                        background: "rgba(255,59,59,0.18)",
                        color: "#ff6b6b",
                        letterSpacing: "0.06em",
                      }}
                    >
                      DEMO
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

      <main 
        className="main app-main-with-sidebar" 
        style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          overflow: 'auto', 
          position: 'relative',
          marginLeft: '228px',
          paddingTop: '72px',
          paddingLeft: '28px',
          paddingRight: '28px',
          paddingBottom: '28px',
          minWidth: 0,
        }}
      >
        {page !== "datashield" && (
        <div
          className="page-header-bar"
          style={{
            marginBottom: 16,
            paddingBottom: 12,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--text3)', textTransform: 'uppercase' }}>
            Active module
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)' }}>
            {PAGE_TITLES[page] || "PulseLock"}
          </div>
        </div>
        )}
        <div style={{ flex: 1, minHeight: 0 }}>
          <PageComponent />
        </div>
      </main>
      </div>
    </div>
    </NavProvider>
  );
}
