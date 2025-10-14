// head.jsx — MUST live in the SAME folder as [slug]/page.jsx
export default function Head({ params }) {
  const base = 'https://www.tradepage.link';
  const url  = `${base}/${params.slug}`;

  return (
    <>
      <title>Trade Page Link</title>
      <meta name="description" content="META-STEP1" />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content="OG-STEP1" />
      <meta property="og:description" content="OG-DESC-STEP1" />
      <meta property="og:image" content={`${base}/og-default.png?step=1`} />
      <meta name="x-proof" content="slug-head-step1" />
    </>
  );
}
