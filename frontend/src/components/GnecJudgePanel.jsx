/**
 * Aligns Mission page with GNEC Devpost judging rubric (Impact … Presentation).
 */
const CRITERIA = [
  {
    title: "Impact",
    badge: "SDG 3",
    text:
      "Protects health systems that enable care — trust, continuity, and equitable access when clinics & NGOs lack 24×7 SOC teams.",
  },
  {
    title: "Innovation",
    badge: "AI gate",
    text:
      "Intercepts unsafe actions before execution — PHI + threats + intent, with AI-to-AI clearance and explainable decisions.",
  },
  {
    title: "Feasibility · Scale",
    badge: "Shippable",
    text:
      "Live dashboard today; layered stack; FHIR-aligned; deployable without heavy capex — from pilot clinic to networked facilities.",
  },
  {
    title: "Design",
    badge: "UX",
    text:
      "Clear paths for judges: Mission → Analyzer → cinematic Data Shield — built for clinicians and auditors, not only engineers.",
  },
  {
    title: "Presentation",
    badge: "Story",
    text:
      "One-line problem → live proof → README + docs/GNEC-SUBMISSION.md for video cues and ZIP packaging.",
  },
];

export default function GnecJudgePanel() {
  return (
    <div className="gnec-panel card" style={{ marginBottom: 28 }}>
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontSize: "0.62rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "var(--text3)",
            textTransform: "uppercase",
            marginBottom: 6,
          }}
        >
          GNEC judging criteria — how PulseLock answers each lens
        </div>
        <div style={{ fontSize: "0.92rem", fontWeight: 700, color: "var(--text)" }}>
          Built for jurors evaluating Impact, Innovation, Feasibility, Design, and Presentation
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        {CRITERIA.map((c) => (
          <div
            key={c.title}
            style={{
              padding: "14px 16px",
              borderRadius: 10,
              background: "rgba(0,0,0,0.28)",
              border: "1px solid var(--border)",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 800, fontSize: "0.82rem", color: "var(--accent)" }}>{c.title}</span>
              <span className="chip chip-blue" style={{ fontSize: "0.58rem", padding: "2px 8px" }}>
                {c.badge}
              </span>
            </div>
            <p style={{ fontSize: "0.76rem", color: "var(--text2)", lineHeight: 1.55, margin: 0 }}>{c.text}</p>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "12px 14px",
          borderRadius: 10,
          background: "rgba(0,230,118,0.06)",
          border: "1px solid rgba(0,230,118,0.22)",
          fontSize: "0.78rem",
          color: "var(--text2)",
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: "#00e676" }}>Sustainability framing:</strong> Social — patient and community trust. Economic —
        breach costs drain budgets that could fund care. Operational — NGOs and small hospitals gain an always-on policy
        layer without scaling a large security division.
      </div>
    </div>
  );
}
