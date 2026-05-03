export default function WhyItMatters() {
  return (
    <div
      style={{
        borderRadius: 14,
        padding: "28px 32px",
        background:
          "linear-gradient(135deg, rgba(0,200,100,0.08) 0%, rgba(0,212,255,0.05) 100%)",
        border: "1px solid rgba(0,200,100,0.2)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle glow effect */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.12em",
            color: "#00e676",
            background: "rgba(0,230,118,0.12)",
            border: "1px solid rgba(0,230,118,0.3)",
            padding: "4px 12px",
            borderRadius: 99,
          }}
        >
          WHY IT MATTERS
        </div>
      </div>

      <div
        style={{
          fontSize: "1.15rem",
          fontWeight: 700,
          color: "var(--text)",
          lineHeight: 1.5,
          marginBottom: 14,
          maxWidth: 560,
        }}
      >
        Healthcare data breaches affect{" "}
        <span style={{ color: "#FF3B3B" }}>millions</span> annually.
        <br />
        PulseLock prevents them{" "}
        <span style={{ color: "#00FF9C" }}>before they happen</span>.
      </div>

      <div
        style={{
          fontSize: "0.88rem",
          color: "var(--text2)",
          lineHeight: 1.7,
          maxWidth: 520,
          marginBottom: 20,
        }}
      >
        Every second, patient data powers life-critical decisions. A single
        breach can expose thousands of records, destroy trust in healthcare
        institutions, and directly harm vulnerable people.
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
        }}
      >
        {[
          {
            stat: "40M+",
            desc: "Patient records at risk yearly",
            color: "#FF3B3B",
          },
          {
            stat: "$10.9M",
            desc: "Average breach cost",
            color: "#ffaa00",
          },
          {
            stat: "1 in 3",
            desc: "Healthcare orgs breached/year",
            color: "#FF6400",
          },
        ].map(({ stat, desc, color }) => (
          <div key={stat}>
            <div
              style={{ fontSize: "1.5rem", fontWeight: 800, color }}
            >
              {stat}
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: "var(--text2)",
                marginTop: 2,
              }}
            >
              {desc}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 20,
          padding: "12px 18px",
          borderRadius: 10,
          background: "rgba(0,212,255,0.06)",
          border: "1px solid rgba(0,212,255,0.15)",
          fontSize: "0.85rem",
          color: "#00D4FF",
          fontWeight: 600,
          textAlign: "center",
        }}
      >
        🛡️ PulseLock acts as a real-time AI firewall for healthcare systems.
      </div>
    </div>
  );
}
