/* --------- MOBILE CENTERING + NO HORIZONTAL SCROLL --------- */
@media (max-width: 520px){
  /* kill any sideways scroll from decorative glows */
  html, body, .tp-home { overflow-x: hidden; }

  /* center the grid content */
  .hero .container{
    grid-template-columns: 1fr;
    justify-items: center;      /* centers both hero-copy and hero-visual */
  }

  /* keep text comfortably inside the viewport */
  .hero-copy{
    width: min(92vw, 640px);
  }
  .hero h1,
  .lead{
    margin-left: auto;
    margin-right: auto;
  }

  /* center + size the mock phone safely within small viewports */
  .hero-visual{ justify-content: center; }
  .device-ultra{
    width: min(340px, 92vw);
    margin: 0 auto;
  }

  /* optional: remove ambient glows on very small screens to avoid any layout nudge */
  .glow{ display: none; }

  /* a touch more breathing room for the container on tiny screens */
  .container{ padding-left: 16px; padding-right: 16px; }
}

/* ensure sizing is predictable across the page */
*, *::before, *::after{ box-sizing: border-box; }
