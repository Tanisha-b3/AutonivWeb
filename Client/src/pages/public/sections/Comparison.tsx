import { COMPARISON } from "./data";
import { Reveal } from "./utils";

export function Comparison() {
  const competitors = [
    { key: "intercom", label: "Intercom" },
    { key: "zendesk", label: "Zendesk" },
    { key: "tidio", label: "Tidio" },
    { key: "freshchat", label: "Freshchat" },
    { key: "botpenguin", label: "BotPenguin" },
  ];

  return (
    <section id="comparison" className="section-box tint">
      <div className="section-pad relative overflow-hidden">
        <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", height: "100%", background: "radial-gradient(circle at center, rgba(34,197,94,0.06), transparent 70%)", pointerEvents: "none" }} />
        <div className="relative" style={{ zIndex: 1 }}>
          <Reveal className="text-center mb-16 space-y-4">
            <span className="tag px-4 py-1.5 rounded-full inline-block" style={{ color: "#ffffff", background: "var(--gg)" }}>Why Autoniv</span>
            <h2 className="font-extrabold tracking-tight mt-4" style={{ fontSize: "clamp(28px,4vw,48px)", color: "#0a0a0a" }}>
              Head-to-head comparison
            </h2>
            <p style={{ color: "#475569", fontSize: 16, maxWidth: 520, margin: "0 auto" }}>We beat every competitor on every dimension. Real costs, real features — we did the math so you don't have to.</p>
          </Reveal>
          <Reveal>
            <div className="overflow-x-auto" style={{ border: "1px solid rgba(34,197,94,0.16)", borderRadius: 20, background: "rgba(255,255,255,0.85)", backdropFilter: "blur(12px)", boxShadow: "0 20px 40px -15px rgba(0,0,0,0.04)" }}>
              <table className="w-full text-left border-collapse" style={{ minWidth: 900 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(34,197,94,0.16)", background: "rgba(34,197,94,0.03)" }}>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#475569]" style={{ width: "18%" }}>Feature</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#15803d]" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.06), rgba(16,185,129,0.06))", width: "14%" }}>Autoniv ✦</th>
                    {competitors.map((c) => (
                      <th key={c.key} className="p-4 text-xs font-bold uppercase tracking-wider text-[#64748b]" style={{ width: "13%" }}>{c.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, index) => (
                    <tr key={index} style={{ borderBottom: index < COMPARISON.length - 1 ? "1px solid rgba(34,197,94,0.08)" : "none" }}>
                      <td className="p-4 text-xs font-semibold" style={{ color: "#0a0a0a" }}>{row.capability}</td>
                      <td className="p-4 text-xs font-medium" style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.04), rgba(16,185,129,0.04))", color: row.autoniv.startsWith("✓") ? "#15803d" : row.autoniv.startsWith("✗") ? "#ef4444" : "#0a0a0a" }}>
                        {row.autoniv}
                      </td>
                      {competitors.map((c) => {
                        const val = row[c.key as keyof typeof row] as string;
                        return (
                          <td key={c.key} className="p-4 text-xs" style={{ color: val.startsWith("✓") ? "#15803d" : val.startsWith("✗") ? "#ef4444" : "#475569" }}>
                            {val}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
