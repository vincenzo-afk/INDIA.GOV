/* Bharat Portal: effects layer (vanilla JavaScript, no dependencies).
   Black-and-white only. Effects:
   - Thin scroll progress line
   - Split-word headline reveal
   - Particle constellation in the hero (reacts to the pointer)
   - 3D Ashoka Chakra on canvas (leans toward the pointer, speeds up on scroll)
   - Hero text drifts and fades as you scroll away
   - Scroll reveals for sections and dynamically rendered cards
   - Card tilt and pointer spotlight; magnetic primary buttons
   - Cursor glow (fine pointers only) and a count-up for the site total
   All motion is disabled under prefers-reduced-motion. */
(function () {
  "use strict";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  /* Colour helpers: read the current theme's text colour so canvases follow dark/light. */
  function inkRGB() {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    return isLight ? "0,0,0" : "255,255,255";
  }

  /* ---------- Scroll progress: thin white line at the very top ---------- */
  function initProgress() {
    const bar = document.createElement("div");
    bar.setAttribute("aria-hidden", "true");
    bar.style.cssText = "position:fixed;top:0;left:0;right:0;height:1px;z-index:60;background:var(--text);transform-origin:left;transform:scaleX(0);pointer-events:none;";
    document.body.appendChild(bar);
    let ticking = false;
    function update() {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0).toFixed(4) + ")";
      ticking = false;
    }
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Split headline into words for a staggered reveal ---------- */
  function splitWords(root) {
    let index = 0;
    const walk = (node) => {
      Array.from(node.childNodes).forEach((child) => {
        if (child.nodeType === 3) {
          const parts = child.textContent.split(/(\s+)/);
          const frag = document.createDocumentFragment();
          parts.forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const span = document.createElement("span");
            span.className = "w";
            span.style.setProperty("--d", (index * 70) + "ms");
            span.textContent = part;
            index++;
            frag.appendChild(span);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(root);
    return index;
  }

  function initHeadline() {
    const h1 = $("#heroTitle");
    if (!h1) return;
    splitWords(h1);
    // Trigger on the next frame so the initial state is painted first.
    requestAnimationFrame(() => requestAnimationFrame(() => h1.classList.add("in")));
  }

  /* ---------- Particle constellation (hero background) ---------- */
  function initParticles() {
    const canvas = $("#heroField");
    if (!canvas || reduce) return;
    const hero = $("#top");
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, pts = [], mouse = { x: -9999, y: -9999 }, raf = 0, running = false;
    const COUNT_BASE = 70;

    function size() {
      const r = canvas.getBoundingClientRect();
      w = r.width; h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      const count = Math.round(Math.min(110, Math.max(36, (w * h) / 16000 * COUNT_BASE / 70)));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.4
      }));
    }

    function frame() {
      if (!running) return;
      const rgb = inkRGB();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        const dx = p.x - mouse.x, dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 22000) { const f = (22000 - d2) / 22000 * 0.6; p.x += dx * f * 0.04; p.y += dy * f * 0.04; }
        if (p.x < -10) p.x = w + 10; if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; if (p.y > h + 10) p.y = -10;
      }
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i];
        for (let j = i + 1; j < pts.length; j++) {
          const b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.strokeStyle = "rgba(" + rgb + "," + ((1 - d / 130) * 0.16).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.fillStyle = "rgba(" + rgb + ",0.75)";
      for (const p of pts) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
      raf = requestAnimationFrame(frame);
    }

    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(raf); }

    hero.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", () => { mouse.x = -9999; mouse.y = -9999; });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => { entries[0].isIntersecting ? start() : stop(); }).observe(hero);
    } else { start(); }
    let resizeTimer = 0;
    window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(size, 150); });
    size();
  }

  /* ---------- 3D Ashoka Chakra (canvas, monochrome) ---------- */
  function initChakra() {
    const host = $("#chakraStage");
    if (!host) return;
    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", "Rotating three-dimensional Ashoka Chakra");
    host.appendChild(canvas);
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const SPOKES = 24, R_OUT = 1.0, R_IN = 0.16, R_RIM = 0.9;
    let size = 0, angle = 0, speed = reduce ? 0 : 0.004;
    let tiltX = 0.55, tiltY = 0, tX = 0.55, tY = 0;
    let running = false, raf = 0, lastScroll = window.scrollY;

    function resize() {
      size = Math.max(200, Math.min(host.getBoundingClientRect().width, 560));
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      canvas.style.width = size + "px";
      canvas.style.height = size + "px";
    }

    // Rotate around Y (spin), tilt around X, lean a little around Z, then apply perspective.
    function project(x, y, z) {
      const cy = Math.cos(angle), sy = Math.sin(angle);
      const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
      const cx = Math.cos(tiltX), sx = Math.sin(tiltX);
      const y1 = y * cx - z1 * sx, z2 = y * sx + z1 * cx;
      const cz = Math.cos(tiltY), sz = Math.sin(tiltY);
      const x2 = x1 * cz - y1 * sz, y2 = x1 * sz + y1 * cz;
      const depth = 3.4, k = depth / (depth - z2);
      return { x: size / 2 + x2 * k * size * 0.36, y: size / 2 - y2 * k * size * 0.36, z: z2, k: k };
    }

    function drawRing(r, alpha, width) {
      ctx.beginPath();
      for (let i = 0; i <= 140; i++) {
        const a = (i / 140) * Math.PI * 2;
        const p = project(Math.cos(a) * r, 0, Math.sin(a) * r);
        if (i === 0) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y);
      }
      ctx.globalAlpha = alpha; ctx.lineWidth = width; ctx.stroke(); ctx.globalAlpha = 1;
    }

    function draw() {
      const rgb = inkRGB();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);
      tiltX += (tX - tiltX) * 0.06;
      tiltY += (tY - tiltY) * 0.06;
      ctx.strokeStyle = "rgb(" + rgb + ")";
      ctx.lineCap = "round";

      drawRing(R_RIM, 0.35, Math.max(1, size * 0.004));

      for (let i = 0; i < SPOKES; i++) {
        const a = (i / SPOKES) * Math.PI * 2;
        const p0 = project(Math.cos(a) * R_IN, 0, Math.sin(a) * R_IN);
        const p1 = project(Math.cos(a) * R_OUT, 0, Math.sin(a) * R_OUT);
        const depthAlpha = 0.35 + 0.65 * Math.max(0, (p1.z + 1) / 2);
        ctx.globalAlpha = depthAlpha;
        ctx.lineWidth = Math.max(1, size * 0.0065 * p1.k);
        ctx.beginPath(); ctx.moveTo(p0.x, p0.y); ctx.lineTo(p1.x, p1.y); ctx.stroke();
      }
      ctx.globalAlpha = 1;

      drawRing(R_OUT, 1, Math.max(1.5, size * 0.011));

      const hub = project(0, 0, 0);
      ctx.beginPath();
      ctx.fillStyle = "rgb(" + rgb + ")";
      ctx.arc(hub.x, hub.y, size * 0.035 * hub.k, 0, Math.PI * 2);
      ctx.fill();
    }

    function frame() {
      if (!running) return;
      angle += speed;
      speed += (0.004 - speed) * 0.04; // ease back to the base spin after scroll bursts
      draw();
      raf = requestAnimationFrame(frame);
    }

    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; cancelAnimationFrame(raf); }

    if (fine) {
      host.addEventListener("pointermove", (e) => {
        const r = host.getBoundingClientRect();
        tY = ((e.clientX - r.left) / r.width - 0.5) * 0.6;
        tX = 0.55 + ((e.clientY - r.top) / r.height - 0.5) * -0.6;
      });
      host.addEventListener("pointerleave", () => { tX = 0.55; tY = 0; });
    }

    // Scroll gives the wheel a short spin burst.
    window.addEventListener("scroll", () => {
      if (reduce) return;
      const dy = Math.abs(window.scrollY - lastScroll);
      lastScroll = window.scrollY;
      speed = Math.min(0.09, speed + dy * 0.00035);
    }, { passive: true });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => { entries[0].isIntersecting ? start() : stop(); }).observe(host);
    } else { start(); }

    let t = 0;
    window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(resize, 150); });
    resize();
    if (reduce) draw();
  }

  /* ---------- Hero text drifts and fades as you scroll away ---------- */
  function initHeroScroll() {
    const inner = $("#heroInner");
    if (!inner || reduce) return;
    let ticking = false;
    function update() {
      const y = window.scrollY, vh = window.innerHeight;
      const p = Math.min(1, y / (vh * 0.8));
      inner.style.transform = "translate3d(0," + (p * 70).toFixed(1) + "px,0)";
      inner.style.opacity = (1 - p * 0.9).toFixed(3);
      ticking = false;
    }
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  /* ---------- Scroll reveals (static blocks and dynamically rendered children) ---------- */
  function initReveal() {
    const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("fx-in"); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }) : null;

    function track(node, delay) {
      if (node.dataset.fx) return;
      node.dataset.fx = "1";
      if (reduce || !io) return;
      node.classList.add("fx-hidden");
      node.style.setProperty("--delay", (delay || 0) + "ms");
      io.observe(node);
    }

    $$(".section-head, .about > *, .answer-panel, .news-status, .news-fallback, .footer-inner").forEach((n) => track(n, 0));

    ["#siteGrid", "#newsList", "#guideGrid", ".filters"].forEach((sel) => {
      const host = $(sel);
      if (!host) return;
      const sync = () => Array.from(host.children).forEach((child, i) => track(child, Math.min(i % 6, 5) * 60));
      new MutationObserver(sync).observe(host, { childList: true });
      sync();
    });
  }

  /* ---------- Card tilt and spotlight (pointer, fine devices only) ---------- */
  function initCardMotion() {
    if (reduce || !fine) return;
    const MAX = 6;
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest && e.target.closest(".site-card, .guide-card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      card.style.setProperty("--ry", ((px - 0.5) * MAX * 2).toFixed(2) + "deg");
      card.style.setProperty("--rx", ((0.5 - py) * MAX * 2).toFixed(2) + "deg");
      card.style.setProperty("--sx", (px * 100).toFixed(1) + "%");
      card.style.setProperty("--sy", (py * 100).toFixed(1) + "%");
      card.style.setProperty("--glow", "1");
    });
    document.addEventListener("pointerout", (e) => {
      const card = e.target.closest && e.target.closest(".site-card, .guide-card");
      if (!card || (e.relatedTarget && card.contains(e.relatedTarget))) return;
      card.style.setProperty("--rx", "0deg");
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--glow", "0");
    });
  }

  /* ---------- Magnetic primary buttons ---------- */
  function initMagnetic() {
    if (reduce || !fine) return;
    $$(".btn-primary").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.2;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
        btn.style.transform = "translate(" + dx.toFixed(1) + "px," + dy.toFixed(1) + "px)";
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
  }

  /* ---------- Cursor glow (fine pointers) ---------- */
  function initCursorGlow() {
    if (reduce || !fine) return;
    const glow = $(".cursor-glow");
    if (!glow) return;
    let raf = 0, x = 0, y = 0;
    window.addEventListener("pointermove", (e) => {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        document.documentElement.style.setProperty("--cx", x + "px");
        document.documentElement.style.setProperty("--cy", y + "px");
        raf = 0;
      });
    }, { passive: true });
  }

  /* ---------- Count-up for the site total ---------- */
  function initCounter() {
    const target = $("#siteCount");
    if (!target) return;
    const end = parseInt(target.textContent, 10) || 0;
    if (reduce || !end) return;
    target.textContent = "0";
    const start = performance.now(), dur = 1500;
    const step = (now) => {
      const t = Math.min((now - start) / dur, 1);
      target.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ---------- Marquee of real programme names, placed under the hero ---------- */
  function initMarquee() {
    const anchor = $("#directory");
    if (!anchor) return;
    const items = [
      "Digital India", "Make in India", "Skill India", "Startup India", "Ayushman Bharat",
      "PM-KISAN", "Swachh Bharat", "Jan Dhan Yojana", "Atmanirbhar Bharat",
      "Beti Bachao Beti Padhao", "UPI", "DigiLocker", "e-Courts", "GeM"
    ];
    const section = document.createElement("section");
    section.className = "marquee";
    section.setAttribute("aria-label", "Government programmes");
    const track = document.createElement("div");
    track.className = "marquee-track";
    for (let pass = 0; pass < 2; pass++) {
      items.forEach((t) => { const s = document.createElement("span"); s.textContent = t; track.appendChild(s); });
    }
    section.appendChild(track);
    anchor.parentNode.insertBefore(section, anchor);
  }

  /* ---------- Thin animated rules between content sections ---------- */
  function initRules() {
    ["#news", "#guides", "#about"].forEach((sel) => {
      const sec = $(sel);
      if (!sec) return;
      const rule = document.createElement("div");
      rule.className = "rule";
      rule.setAttribute("aria-hidden", "true");
      sec.parentNode.insertBefore(rule, sec);
    });
  }

  function boot() {
    initProgress();
    initHeadline();
    initMarquee();
    initRules();
    initParticles();
    initChakra();
    initHeroScroll();
    initReveal();
    initCardMotion();
    initMagnetic();
    initCursorGlow();
    initCounter();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
