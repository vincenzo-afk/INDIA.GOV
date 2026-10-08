/* Bharat Portal: application logic (vanilla JavaScript, no dependencies).
   Modules: Theme, MobileMenu, Directory (search and filter), LiveNews,
   Guides, BackToTop. Data comes from sites.js (GOV_SITES, NEWS_FEEDS). */
(function () {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const el = (tag, attrs = {}, text) => {
    const n = document.createElement(tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    if (text !== undefined) n.textContent = text;
    return n;
  };

  /* ---------- Theme (persisted, follows system by default) ---------- */
  const Theme = (function () {
    const KEY = "bharatPortal.theme";
    const btn = $("#themeToggle");
    function apply(t) {
      document.documentElement.setAttribute("data-theme", t);
      btn.setAttribute("aria-pressed", String(t === "dark"));
    }
    function init() {
      let saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) { /* storage blocked */ }
      const sysDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      apply(saved || (sysDark ? "dark" : "light"));
      btn.addEventListener("click", () => {
        const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      });
    }
    return { init };
  })();

  /* ---------- Mobile menu ---------- */
  const MobileMenu = (function () {
    const btn = $("#menuBtn");
    const panel = $("#mobileNav");
    function set(open) {
      panel.classList.toggle("open", open);
      panel.setAttribute("aria-hidden", String(!open));
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
    function init() {
      btn.addEventListener("click", () => set(!panel.classList.contains("open")));
      panel.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => set(false)));
      document.addEventListener("keydown", (e) => { if (e.key === "Escape") set(false); });
      window.addEventListener("resize", () => { if (window.innerWidth > 960) set(false); });
    }
    return { init };
  })();

  /* ---------- Header shadow on scroll ---------- */
  function initHeaderShadow() {
    const header = $("#siteHeader");
    const update = () => { header.style.boxShadow = window.scrollY > 6 ? "0 2px 12px rgba(11,42,91,0.08)" : "none"; };
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  /* ---------- Directory: search, category filter, render ---------- */
  const Directory = (function () {
    const sites = window.GOV_SITES || [];
    const grid = $("#siteGrid");
    const filtersEl = $("#filters");
    const meta = $("#resultMeta");
    const empty = $("#emptyState");
    const input = $("#q");
    let activeCat = "All";

    function categories() {
      const set = new Set(sites.map((s) => s.cat));
      return ["All"].concat(Array.from(set).sort());
    }

    function matches(site, query) {
      if (!query) return true;
      const hay = (site.name + " " + site.desc + " " + site.kw + " " + site.url + " " + site.cat).toLowerCase();
      return query.toLowerCase().split(/\s+/).filter(Boolean).every((term) => hay.includes(term));
    }

    function renderFilters() {
      filtersEl.innerHTML = "";
      categories().forEach((cat) => {
        const b = el("button", { type: "button", class: "filter", "aria-pressed": String(cat === activeCat) }, cat);
        b.addEventListener("click", () => { activeCat = cat; renderFilters(); render(input.value.trim()); });
        filtersEl.appendChild(b);
      });
    }

    function render(query) {
      const list = sites.filter((s) => (activeCat === "All" || s.cat === activeCat) && matches(s, query));
      grid.innerHTML = "";
      list.forEach((s) => {
        const card = el("a", { class: "site-card", href: s.url, target: "_blank", rel: "noopener noreferrer" });
        card.appendChild(el("span", { class: "site-cat" }, s.cat));
        card.appendChild(el("h3", {}, s.name));
        card.appendChild(el("p", {}, s.desc));
        card.appendChild(el("span", { class: "site-url" }, s.url.replace("https://", "").replace(/\/$/, "") + " ↗"));
        grid.appendChild(card);
      });
      meta.textContent = list.length + " of " + sites.length + " websites" + (query ? " match \u201C" + query + "\u201D" : "");
      empty.hidden = list.length !== 0;
    }

    function init() {
      $("#siteCount").textContent = sites.length;
      renderFilters();
      render("");
    }

    return { init, render, setQuery: (q) => { input.value = q; render(q); } };
  })();

  /* ---------- Hero search: searches directory, then guides ---------- */
  const Search = (function () {
    function run(q) {
      const query = (q || "").trim();
      const dir = $("#directory");
      if (!query) { $("#q").focus(); return; }
      Directory.setQuery(query);
      const guide = Guides.findFor(query);
      if (guide) Guides.show(guide);
      dir.scrollIntoView({ behavior: "smooth" });
    }
    function init() {
      $("#searchForm").addEventListener("submit", (e) => { e.preventDefault(); run($("#q").value); });
      document.querySelectorAll(".chip").forEach((c) => {
        c.addEventListener("click", () => { $("#q").value = c.dataset.q; run(c.dataset.q); });
      });
    }
    return { init, run };
  })();

  /* ---------- Quick guides: static, factual overviews ---------- */
  const Guides = (function () {
    const items = [
      {
        title: "Renew or apply for a passport",
        keys: ["passport", "renew"],
        text: "Register on the Passport Seva portal, complete the online application, pay the fee, and book an appointment at a Passport Seva Kendra or Post Office Passport Seva Kendra. Bring your original documents to the appointment.",
        links: [["Passport Seva", "https://www.passportindia.gov.in"]]
      },
      {
        title: "Apply for an Aadhaar card",
        keys: ["aadhaar", "aadhar"],
        text: "Visit a UIDAI-authorised enrolment centre with proof of identity, proof of address and date of birth documents. Biometrics and a photograph are captured on the spot, and you receive an enrolment slip with a tracking number.",
        links: [["UIDAI", "https://uidai.gov.in"]]
      },
      {
        title: "File an income tax return",
        keys: ["income tax", "itr", "tax return"],
        text: "Log in to the Income Tax e-filing portal with your PAN, choose the correct ITR form, verify the pre-filled details, submit, and e-verify within the due date using Aadhaar OTP or net banking.",
        links: [["Income Tax e-Filing", "https://www.incometax.gov.in"]]
      },
      {
        title: "Apply for a scholarship",
        keys: ["scholarship", "student"],
        text: "Central and state scholarships are listed on the National Scholarship Portal. Check eligibility by income, category and course, then apply online before the published deadline.",
        links: [["National Scholarship Portal", "https://scholarships.gov.in"]]
      },
      {
        title: "Register a business under Udyam",
        keys: ["udyam", "msme", "business registration"],
        text: "Registration is free and online. Enter your Aadhaar and PAN, add business and bank details, and submit. A Udyam Registration Number is issued after submission.",
        links: [["Udyam Registration", "https://udyamregistration.gov.in"]]
      },
      {
        title: "Book a train ticket",
        keys: ["train", "railway", "ticket", "pnr"],
        text: "Create an account on IRCTC, search by route and date, select a train and class, enter passenger details and pay online. PNR status and running information are on the same platform.",
        links: [["IRCTC", "https://www.irctc.co.in"]]
      }
    ];

    function findFor(q) {
      const s = q.toLowerCase();
      return items.find((g) => g.keys.some((k) => s.includes(k))) || null;
    }

    function show(g) {
      $("#answerPanel").hidden = false;
      $("#answerQ").textContent = g.title;
      $("#answerText").textContent = g.text;
      const row = $("#answerLinks");
      row.innerHTML = "";
      g.links.forEach(([label, url]) => {
        row.appendChild(el("a", { href: url, target: "_blank", rel: "noopener noreferrer" }, label + " ↗"));
      });
    }

    function init() {
      const grid = $("#guideGrid");
      items.forEach((g) => {
        const card = el("article", { class: "guide-card" });
        card.appendChild(el("h3", {}, g.title));
        card.appendChild(el("p", {}, g.text.split(".")[0] + "."));
        const b = el("button", { type: "button" }, "Read full guide →");
        b.addEventListener("click", () => { show(g); $("#answerPanel").scrollIntoView({ behavior: "smooth", block: "center" }); });
        card.appendChild(b);
        grid.appendChild(card);
      });
    }

    return { init, show, findFor };
  })();

  /* ---------- Live news: try official feeds, fall back to links ---------- */
  const LiveNews = (function () {
    const feeds = window.NEWS_FEEDS || [];
    const status = $("#newsStatus");
    const list = $("#newsList");
    const fallback = $("#newsFallback");
    const fallbackLinks = $("#newsLinks");

    function withTimeout(promise, ms) {
      return Promise.race([
        promise,
        new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))
      ]);
    }

    async function loadFeed(feed) {
      const res = await withTimeout(fetch(feed.url, { mode: "cors" }), 8000);
      if (!res.ok) throw new Error("HTTP " + res.status);
      const xml = new DOMParser().parseFromString(await res.text(), "text/xml");
      if (xml.querySelector("parsererror")) throw new Error("parse");
      return Array.from(xml.querySelectorAll("item")).slice(0, 8).map((item) => ({
        title: (item.querySelector("title") || {}).textContent || "Untitled",
        link: (item.querySelector("link") || {}).textContent || feed.url,
        date: (item.querySelector("pubDate") || {}).textContent || "",
        source: feed.name
      }));
    }

    function showFallback() {
      status.textContent = "Live feeds could not be loaded in this browser.";
      fallback.hidden = false;
      fallbackLinks.innerHTML = "";
      feeds.forEach((f) => fallbackLinks.appendChild(el("a", { href: f.url, target: "_blank", rel: "noopener noreferrer" }, f.name + " ↗")));
      fallbackLinks.appendChild(el("a", { href: "https://pib.gov.in", target: "_blank", rel: "noopener noreferrer" }, "PIB home ↗"));
    }

    async function init() {
      if (!feeds.length || !("fetch" in window)) { showFallback(); return; }
      try {
        const results = await Promise.allSettled(feeds.map(loadFeed));
        const items = results.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);
        if (!items.length) { showFallback(); return; }
        status.textContent = "Showing " + items.length + " latest items from official feeds.";
        items.forEach((it) => {
          const li = el("li");
          const a = el("a", { href: it.link, target: "_blank", rel: "noopener noreferrer" }, it.title);
          li.appendChild(a);
          li.appendChild(el("small", {}, [it.source, it.date].filter(Boolean).join(" · ")));
          list.appendChild(li);
        });
      } catch (e) {
        showFallback();
      }
    }
    return { init };
  })();

  /* ---------- Back to top ---------- */
  function initBackTop() {
    const btn = $("#backTop");
    btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* ---------- Boot ---------- */
  function boot() {
    Theme.init();
    MobileMenu.init();
    initHeaderShadow();
    Directory.init();
    Guides.init();
    Search.init();
    LiveNews.init();
    initBackTop();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
