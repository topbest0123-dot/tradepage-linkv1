// app/not-found.jsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main style={wrap}>
      {/* Use the lighter card gradient sitewide on this page */}
      <style>{`
        html,body{
          background: linear-gradient(180deg,var(--card-bg-1,#0f213a),var(--card-bg-2,#0b1524));
          color: var(--text,#eaf2ff);
        }
        @keyframes headTilt { 0%,100%{ transform: rotate(0deg) } 50%{ transform: rotate(-6deg) } }
        @keyframes scratch { 0%,100%{ transform: rotate(12deg) } 50%{ transform: rotate(-8deg) } }
        .hero { display:grid; gap:14px; justify-items:center; text-align:center }
        .figure { width:110px; height:110px; border-radius:24px;
          display:grid; place-items:center;
          border:1px solid var(--chip-border,#27406e);
          background: var(--chip-bg,#0c1a2e); color: var(--text,#eaf2ff);
          box-shadow: 0 8px 20px rgba(0,0,0,.25);
        }
        .face { transform-origin: 50% 60%; animation: headTilt 2.6s ease-in-out infinite }
        .hand { transform-origin: 72px 75px; animation: scratch 1.8s ease-in-out infinite }
      `}</style>

      <section style={card} className="hero" aria-labelledby="nf-title">
        {/* little “scratching head” SVG */}
        <div className="figure" aria-hidden>
          <svg viewBox="0 0 120 120" width="64" height="64" fill="none" stroke="currentColor" strokeWidth="2">
            {/* head */}
            <g className="face">
              <circle cx="60" cy="54" r="22" fill="currentColor" opacity=".12" />
              <circle cx="60" cy="54" r="22" />
              <circle cx="54" cy="50" r="2.5" fill="currentColor" />
              <circle cx="66" cy="50" r="2.5" fill="currentColor" />
              <path d="M52 60c5 5 11 5 16 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </g>
            {/* raised hand scratching */}
            <g className="hand">
              <path d="M79 76c6-6 8-15 4-20" />
              <path d="M83 55l6-6" />
              <circle cx="91" cy="48" r="3.5" fill="currentColor" />
            </g>
            {/* shoulders */}
            <path d="M38 92c7-9 37-9 44 0" />
          </svg>
        </div>

        <h1 id="nf-title" style={title}>oops… we can’t find that link</h1>

        <Link href="/" style={{ ...btn, ...btnPrimary }}>Go home</Link>
      </section>
    </main>
  );
}

/* ---------- styles (same tokens as homepage) ---------- */
const wrap = {
  maxWidth: 980,
  margin: "40px auto",
  padding: "0 16px 64px",
  color: "var(--text,#eaf2ff)",
};

const card = {
  padding: 28,
  borderRadius: 16,
  border: "1px solid var(--border,#183153)",
  background: "linear-gradient(180deg,var(--card-bg-1,#0f213a),var(--card-bg-2,#0b1524))",
  minWidth: 0,
};

const title = { margin: "6px 0 2px", fontSize: 22, fontWeight: 800, textWrap: "balance" };

const btn = {
  padding: "0 16px",
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
  background: "linear-gradient(135deg,var(--btn-primary-1,#66e0b9),var(--btn-primary-2,#8ab4ff))",
  color: "#08101e",
};
