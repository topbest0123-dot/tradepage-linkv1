// app/head.jsx
export default function Head() {
  return (
    <>
      <link rel="preload" as="video" href="/tradepage-demo.mp4" type="video/mp4" />
      {/* poster & screenshot are already tiny; no need to preload those */}
      <meta name="theme-color" content="#0a0f14" />
    </>
  );
}
