export default function Impact() {
  const crisisStats = [
    { number: "40M+", label: "Patient records exposed per year", sub: "IBM Cost of a Data Breach 2024" },
    { number: "$10.9M", label: "Average cost of a healthcare breach", sub: "Highest of any industry — IBM Security" },
    { number: "1 in 3", label: "Healthcare orgs breached annually", sub: "HIPAA Journal / HHS Reports" },
  ];

  const sdgTargets = [
    {
      id: "3.8",
      title: "Universal Health Coverage",
      text: "Protect health information systems so coverage data stays accurate and trusted by both providers and patients.",
    },
    {
      id: "3.d",
      title: "Health Security Capacity",
      text: "Strengthen the ability of healthcare systems to detect, prevent, and respond to cyber threats that compromise patient safety.",
    },
    {
      id: "16.6",
      title: "Accountable Institutions",
      text: "Ensure hospitals and health NGOs maintain transparent, auditable data practices — a prerequisite for public trust.",
    },
  ];

  const flowSteps = [
    { icon: "🏥", label: "Healthcare Action", desc: "Doctor, AI agent, or system requests patient data access" },
    { icon: "🛡️", label: "PulseLock Intercepts", desc: "Every request passes through the autonomous AI security gate" },
    { icon: "🧠", label: "Multi-Agent Analysis", desc: "PHI Detector + Intent Analyzer + Threat Detector run in parallel" },
    { icon: "⚡", label: "Instant Decision", desc: "ALLOW / BLOCK / REDACT / QUARANTINE — in under 300ms" },
    { icon: "📋", label: "Audit & Learn", desc: "Every decision logged, system learns from new attack patterns" },
  ];

  const scale = [
    { icon: "🌍", label: "Deployable globally", desc: "Cloud-native, runs on any server — from IIT Indore to a rural clinic in Kenya" },
    { icon: "🔌", label: "Integrates with any EHR", desc: "FHIR-compatible: works with Epic, ABDM, OpenMRS, WHO systems" },
    { icon: "🤖", label: "AI-first architecture", desc: "Protects human doctors AND AI agents operating in healthcare pipelines" },
    { icon: "💸", label: "Open-source potential", desc: "Can be offered free to under-resourced hospitals and NGO health programs" },
  ];

  return (
    <>
      {/* SDG 3 Hero */}
      <div style={{
        background: "linear-gradient(135deg, rgba(0,200,100,0.12) 0%, rgba(0,200,255,0.08) 100%)",
        border: "1px solid rgba(0,200,100,0.3)",
        borderRadius: 16,
        padding: "36px 32px",
        marginBottom: 28,
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: 16, right: 24,
          fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.1em",
          color: "#00e676", background: "rgba(0,230,118,0.12)",
          border: "1px solid rgba(0,230,118,0.3)",
          padding: "4px 12px", borderRadius: 99,
        }}>UN SDG 3 · GOOD HEALTH & WELL-BEING</div>

        <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--text)", marginBottom: 10, maxWidth: 600, lineHeight: 1.3 }}>
          PulseLock defends the systems<br />that defend lives.
        </div>
        <div style={{ fontSize: "0.95rem", color: "var(--text2)", maxWidth: 560, lineHeight: 1.7 }}>
          Every second, patient data powers life-critical decisions. A single breach can expose thousands of records,
          destroy trust in healthcare institutions, and directly harm vulnerable people.
          PulseLock is an autonomous AI security layer that ensures that data stays protected, private, and trusted — in real time.
        </div>
      </div>

      {/* Crisis Stats */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-title" style={{ color: "var(--danger)", marginBottom: 12 }}>The Global Healthcare Data Crisis</div>
      </div>
      <div className="grid grid-3" style={{ marginBottom: 28 }}>
        {crisisStats.map((s) => (
          <div key={s.number} style={{
            background: "rgba(255,64,96,0.06)",
            border: "1px solid rgba(255,64,96,0.2)",
            borderRadius: 12,
            padding: "24px 20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: "2.2rem", fontWeight: 800, color: "var(--danger)", marginBottom: 6 }}>{s.number}</div>
            <div style={{ fontSize: "0.88rem", color: "var(--text)", fontWeight: 600, marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: "0.72rem", color: "var(--text2)" }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* How PulseLock Protects */}
      <div className="card" style={{ marginBottom: 28 }}>
        <div className="section-title">How PulseLock Protects Healthcare Systems</div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 0, overflowX: "auto", paddingBottom: 4 }}>
          {flowSteps.map((step, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start" }}>
              <div style={{ textAlign: "center", minWidth: 130, padding: "0 8px" }}>
                <div style={{
                  width: 52, height: 52, borderRadius: "50%",
                  background: "rgba(0,200,255,0.1)",
                  border: "1px solid var(--border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.4rem", margin: "0 auto 10px",
                }}>{step.icon}</div>
                <div style={{ fontWeight: 700, fontSize: "0.8rem", color: "var(--accent)", marginBottom: 4 }}>{step.label}</div>
                <div style={{ fontSize: "0.72rem", color: "var(--text2)", lineHeight: 1.5 }}>{step.desc}</div>
              </div>
              {i < flowSteps.length - 1 && (
                <div style={{ color: "var(--border)", fontSize: "1.4rem", marginTop: 12, flexShrink: 0 }}>→</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SDG Alignment */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-title" style={{ color: "#00e676", marginBottom: 12 }}>SDG 3 Target Alignment</div>
      </div>
      <div className="grid grid-3" style={{ marginBottom: 28 }}>
        {sdgTargets.map((t) => (
          <div key={t.id} style={{
            background: "rgba(0,230,118,0.05)",
            border: "1px solid rgba(0,230,118,0.2)",
            borderRadius: 12,
            padding: "20px",
          }}>
            <div style={{
              display: "inline-block", fontSize: "0.72rem", fontWeight: 700,
              color: "#00e676", background: "rgba(0,230,118,0.12)",
              padding: "3px 10px", borderRadius: 99, marginBottom: 10,
            }}>TARGET {t.id}</div>
            <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 8, fontSize: "0.9rem" }}>{t.title}</div>
            <div style={{ fontSize: "0.82rem", color: "var(--text2)", lineHeight: 1.6 }}>{t.text}</div>
          </div>
        ))}
      </div>

      {/* Feasibility & Scale */}
      <div style={{ marginBottom: 8 }}>
        <div className="section-title" style={{ marginBottom: 12 }}>Feasibility & Global Scale</div>
      </div>
      <div className="grid grid-4" style={{ marginBottom: 28 }}>
        {scale.map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: "2rem", marginBottom: 10 }}>{s.icon}</div>
            <div style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--accent)", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: "0.78rem", color: "var(--text2)", lineHeight: 1.5 }}>{s.desc}</div>
          </div>
        ))}
      </div>

      {/* Tech Foundation */}
      <div className="card">
        <div className="section-title">Built on Real, Production-Grade Technology</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            ["FastAPI", "High-performance backend"],
            ["Google Gemini AI", "Multi-agent intelligence"],
            ["A2A Protocol", "AI-to-AI security standard"],
            ["FHIR Compatible", "EHR integration ready"],
            ["SQLite / PostgreSQL", "Audit trail storage"],
            ["Zero Trust Mode", "HIPAA-aligned enforcement"],
            ["Self-Learning Engine", "Evolves with new threats"],
            ["WebSocket Alerts", "Real-time incident feed"],
          ].map(([name, desc]) => (
            <div key={name} style={{
              padding: "8px 14px", borderRadius: 8,
              background: "rgba(0,200,255,0.07)",
              border: "1px solid var(--border)",
              fontSize: "0.8rem",
            }}>
              <span style={{ color: "var(--accent)", fontWeight: 600 }}>{name}</span>
              <span style={{ color: "var(--text2)", marginLeft: 6 }}>{desc}</span>
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 20, padding: "14px 18px", borderRadius: 10,
          background: "rgba(0,200,255,0.04)", border: "1px solid var(--border)",
          fontSize: "0.85rem", color: "var(--text2)", lineHeight: 1.7,
        }}>
          <strong style={{ color: "var(--text)" }}>Deployment reality:</strong> PulseLock runs fully free on Render.com (backend + AI agent) and GitHub Pages (dashboard). No cloud billing required. A rural hospital with internet access can deploy this today.
        </div>
      </div>
    </>
  );
}
