// app/not-found.jsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main style={wrap}>
      {/* keep colors in sync with your global theme */}
      <style>{`html,body{background:var(--bg,#0a0f14);color:var(--text,#eaf2ff)}`}</style>

      <section style={card} aria-labelledby="nf-title">
        <div style={iconBox} aria-hidden>
          {/* small broken-link icon using currentColor */}
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.5 13.5l-3 3a3 3 0 1 1-4.2-4.2l3-3" />
            <path d="M13.5 10.5l3-3a3 3 0 1 1 4.2 4.2l-3 3" />
            <path d="M8 16l8-8" />
          </svg>
        </div>

        <h1 id="nf-title" style={title}>ups, we can’t find that link</h1>

        <Link href="/" style={{ ...btnBase, ...btnPrimary }}>Go home</Link>
      </section>
    </main>
  );
}

/* ------- styles (uses your CSS variables with safe fallbacks) ------- */
const wrap = {
  maxWidth: 980,
  margin: "40px auto",
  padding: "0 16px 64px",
  color: "var(--text,#eaf2ff)",
  background: "var(--bg,#0a0f14)",
};

const card = {
  padding: 24,
  borderRadius: 16,
  border: "1px solid var(--border,#183153)",
  background: "linear-gradient(180deg,var(--card-bg-1,#0f213a),var(--card-bg-2,#0b1524))",
  display: "grid",
  gap: 14,
  justifyItems: "center",
  textAlign: "center",
};

const iconBox = {
  width: 72,
  height: 72,
  borderRadius: 16,
  display: "grid",
  placeItems: "center",
  border: "1px solid var(--chip-border,#27406e)",
  background: "var(--chip-bg,#0c1a2e)",
  color: "var(--text,#eaf2ff)",
};

const title = { margin: "2px 0 6px", fontSize: 22, fontWeight: 800 };

const btnBase = {
  padding: "0 14px",
  height: 38,
  borderRadius: 12,
  border: "1px solid var(--border,#183153)",
  fontWeight: 700,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  textDecoration: "none",
  cursor: "pointer",
};

const btnPrimary = {
  background:
    "linear-gradient(135deg,var(--btn-primary-1,#66e0b9),var(--btn-primary-2,#8ab4ff))",
  color: "#08101e",
};
