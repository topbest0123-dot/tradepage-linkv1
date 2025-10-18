// app/not-found.jsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main style={pageWrapStyle}>
      {/* keep it on-brand via your CSS variables; fall back colors included */}
      <style>{`
        html,body{background:var(--bg,#0a0f14);color:var(--text,#eaf2ff)}
        a{text-decoration:none}
      `}</style>

      {/* Header / hero */}
      <section style={heroCardStyle} aria-labelledby="nf-title">
        <div style={logoDotStyle} aria-hidden>★</div>
        <div>
          <div style={badgeStyle}>404</div>
          <h1 id="nf-title" style={h1Style}>Page not found</h1>
          <p style={leadStyle}>
            We couldn’t find the page you were looking for.
          </p>
        </div>
      </section>

      {/* Actions */}
      <div style={actionsRowStyle}>
        <Link href="/" style={{ ...btnBaseStyle, ...btnPrimaryStyle }}>Go home</Link>
        <button
          type="button"
          onClick={() => (typeof window !== "undefined" ? window.history.back() : null)}
          style={{ ...btnBaseStyle, ...btnNeutralStyle }}
        >
          Go back
        </button>
        <Link href="/contact" style={{ ...btnBaseStyle, border:'1px solid var(--social-border,#27406e)', background:'transparent', color:'var(--text,#eaf2ff)'}}>
          Contact us
        </Link>
      </div>

      {/* Helpful links */}
      <section style={cardStyle}>
        <h2 style={h2Style}>Try these</h2>
        <ul style={listResetStyle}>
          <li style={linkItemStyle}>
            <Link href="/" style={linkStyle}>Home</Link>
          </li>
          <li style={linkItemStyle}>
            <Link href="/profiles" style={linkStyle}>Browse trades</Link>
          </li>
          <li style={linkItemStyle}>
            <Link href="/about" style={linkStyle}>About</Link>
          </li>
        </ul>
      </section>
    </main>
  );
}

/* ---------- styles (mirrors PublicPage look) ---------- */
const pageWrapStyle = {
  maxWidth: 980,
  margin: "40px auto",
  padding: "0 16px 64px",
  color: "var(--text,#eaf2ff)",
  background: "var(--bg,#0a0f14)",
};

const cardStyle = {
  padding: 16,
  borderRadius: 16,
  border: "1px solid var(--border,#183153)",
  background: "linear-gradient(180deg,var(--card-bg-1,#0f213a),var(--card-bg-2,#0b1524))",
  minWidth: 0,
  marginTop: 16,
};

const heroCardStyle = {
  ...cardStyle,
  display: "grid",
  gridTemplateColumns: "56px 1fr",
  alignItems: "center",
  gap: 14,
};

const h1Style = { margin: "0 0 6px 0", fontSize: 28, lineHeight: "32px", fontWeight: 800 };
const h2Style = { margin: "0 0 10px 0", fontSize: 18 };
const leadStyle = { margin: 0, opacity: .85 };

const logoDotStyle = {
  width: 48,
  height: 48,
  borderRadius: 14,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "var(--btn-primary-1,#66e0b9)",
  color: "#0a0f1c",
  fontWeight: 800,
  fontSize: 20,
  border: "1px solid var(--border,#183153)",
};

const badgeStyle = {
  display: "inline-block",
  padding: "4px 10px",
  borderRadius: 999,
  border: "1px solid var(--chip-border,#27406e)",
  background: "var(--chip-bg,#0c1a2e)",
  fontWeight: 700,
  marginBottom: 6,
  fontSize: 12
};

const actionsRowStyle = { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 14 };

const btnBaseStyle = {
  padding: "0 14px",
  borderRadius: 12,
  border: "1px solid var(--border,#183153)",
  fontWeight: 700,
  cursor: "pointer",
  height: 36,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "var(--text,#0e141a)",
};

const btnPrimaryStyle = {
  background: "linear-gradient(135deg,var(--btn-primary-1,#66e0b9),var(--btn-primary-2,#8ab4ff))",
  color: "#08101e",
};

const btnNeutralStyle = { background: "var(--btn-neutral-bg,#1f2937)", color: "var(--text,#eaf2ff)" };

const listResetStyle = { margin: 0, padding: 0, listStyle: "none" };
const linkItemStyle = { marginBottom: 8 };
const linkStyle = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid var(--chip-border,#27406e)",
  background: "var(--chip-bg,#0c1a2e)",
  color: "var(--text,#eaf2ff)",
  display: "inline-block",
};
