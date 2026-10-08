/* ==========================================================================
   Bharat Portal: behaviour (vanilla JavaScript, no dependencies)
   Modules: Theme, Language, MobileNav, Header, SmoothScroll, RevealOnScroll,
   TypewriterRotator, AnswerEngine, SphereRenderer, TabSwitcher,
   CounterAnimator, Ticker, BackToTop.
   ========================================================================== */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  /* ------------------------------------------------------------------
     Shared data
     ------------------------------------------------------------------ */

  // Example questions used by the typewriter placeholder.
  const EXAMPLE_QUESTIONS = [
    "How do I renew my passport?",
    "How do I apply for an Aadhaar card?",
    "What scholarships can students get?",
    "How do I register my business under Udyam?",
    "How do I check my ration card status?"
  ];

  // Official sources (domains only, used as chips and links).
  const SOURCES = {
    passport: [
      { name: "passportindia.gov.in", url: "https://www.passportindia.gov.in" },
      { name: "mea.gov.in", url: "https://www.mea.gov.in" },
      { name: "india.gov.in", url: "https://www.india.gov.in" }
    ],
    aadhaar: [
      { name: "uidai.gov.in", url: "https://uidai.gov.in" },
      { name: "myaadhaar.uidai.gov.in", url: "https://myaadhaar.uidai.gov.in" },
      { name: "india.gov.in", url: "https://www.india.gov.in" }
    ],
    pan: [
      { name: "incometax.gov.in", url: "https://www.incometax.gov.in" },
      { name: "tin.tin.nsdl.com", url: "https://www.tin.tin.nsdl.com" },
      { name: "india.gov.in", url: "https://www.india.gov.in" }
    ],
    scholarship: [
      { name: "scholarships.gov.in", url: "https://www.scholarships.gov.in" },
      { name: "nsp.gov.in", url: "https://scholarships.gov.in" },
      { name: "india.gov.in", url: "https://www.india.gov.in" }
    ],
    ration: [
      { name: "nfsa.gov.in", url: "https://nfsa.gov.in" },
      { name: "epds.nic.in", url: "https://nfsa.gov.in" },
      { name: "india.gov.in", url: "https://www.india.gov.in" }
    ],
    visa: [
      { name: "indianvisaonline.gov.in", url: "https://indianvisaonline.gov.in" },
      { name: "mea.gov.in", url: "https://www.mea.gov.in" },
      { name: "india.gov.in", url: "https://www.india.gov.in" }
    ],
    tax: [
      { name: "incometax.gov.in", url: "https://www.incometax.gov.in" },
      { name: "cbdt.gov.in", url: "https://www.incometax.gov.in" },
      { name: "india.gov.in", url: "https://www.india.gov.in" }
    ],
    business: [
      { name: "udyamregistration.gov.in", url: "https://udyamregistration.gov.in" },
      { name: "mca.gov.in", url: "https://www.mca.gov.in" },
      { name: "india.gov.in", url: "https://www.india.gov.in" }
    ],
    railway: [
      { name: "irctc.co.in", url: "https://www.irctc.co.in" },
      { name: "indianrailways.gov.in", url: "https://indianrailways.gov.in" },
      { name: "india.gov.in", url: "https://www.india.gov.in" }
    ],
    generic: [
      { name: "india.gov.in", url: "https://www.india.gov.in" },
      { name: "mygov.in", url: "https://www.mygov.in" },
      { name: "digitalindia.gov.in", url: "https://www.digitalindia.gov.in" }
    ]
  };

  // Pre-written answers. Each entry has keywords, an answer, and a source key.
  const ANSWERS = [
    {
      keys: ["passport"], source: "passport",
      text: "To renew an Indian passport, register on the Passport Seva portal, fill in the renewal application, pay the fee online, and book an appointment at your nearest Passport Seva Kendra (PSK) or Post Office Passport Seva Kendra (POPSK). Carry your old passport and the original supporting documents to the appointment. Track the status any time with your file number."
    },
    {
      keys: ["aadhaar", "aadhar", "uidai"], source: "aadhaar",
      text: "To apply for an Aadhaar card, visit a UIDAI-authorised enrolment centre or book one through the official portal. Bring proof of identity, proof of address, and date of birth documents. Biometrics and a photograph are captured on the spot, and you receive an enrolment slip with a tracking number to check your status."
    },
    {
      keys: ["pan"], source: "pan",
      text: "To get a PAN card, apply online through the NSDL or UTIITSL portal, or use the Income Tax e-filing site. Submit identity, address, and date of birth proof, and pay the fee online. A PAN is issued electronically in most cases, and a physical card can be requested for a small additional fee."
    },
    {
      keys: ["scholarship", "scholarships", "student", "students"], source: "scholarship",
      text: "Indian students can access central and state scholarships through the National Scholarship Portal. Common categories include merit-based, need-based, and schemes for SC, ST, OBC, minority, and girl students. Check eligibility by income, category, and course level, then apply online before the published deadline."
    },
    {
      keys: ["ration", "rice", "food card"], source: "ration",
      text: "To check your ration card status, use your state's food and civil supplies portal or the National Food Security portal. Enter your ration card number or application reference. You can also apply for a new card or update family members through the same state portal or your local supply office."
    },
    {
      keys: ["visa", "e-visa", "evisa"], source: "visa",
      text: "Foreign nationals can apply for an e-Visa for India through the official Indian Visa Online portal. Choose the visa category, upload a recent photograph and passport scan, pay the fee online, and track your application. Processing times vary, so apply well ahead of travel."
    },
    {
      keys: ["tax", "itr", "income", "return"], source: "tax",
      text: "To file an income tax return, log in to the Income Tax e-filing portal with your PAN, choose the correct ITR form for your income type, fill in the details or import pre-filled data, verify the return, and e-verify it with Aadhaar OTP or net banking within the due date."
    },
    {
      keys: ["business", "udyam", "msme", "register"], source: "business",
      text: "To register your business under Udyam, visit the Udyam Registration portal, enter your Aadhaar and PAN, provide business and bank details, and submit. Registration is free and issues a Udyam Registration Number instantly. Classification as micro, small, or medium depends on investment and turnover."
    },
    {
      keys: ["train", "railway", "irctc", "ticket"], source: "railway",
      text: "To book a train ticket, create an account on the IRCTC website or app, log in, search by route and date, select a class and train, enter passenger details, and pay online. You can also check PNR status and train running information on the same platform."
    }
  ];

  const FALLBACK_ANSWER = {
    source: "generic",
    text: "Thank you for your question. Bharat Portal is still learning, and this demonstration does not yet have an official answer for that topic. Try rephrasing with a service name such as passport, Aadhaar, PAN, scholarship, ration card, income tax, or Udyam. You can also browse the official sources below to find the right service."
  };

  // Sphere previews: names of government websites shown on the sphere.
  const SITE_NAMES = [
    "Ministry of Health", "UIDAI", "MEA", "CBDT", "IRCTC", "MCA",
    "Passport Seva", "DigiLocker", "UMANG", "PM-KISAN", "CoWIN", "Udyam",
    "NFSA", "MyGov", "Digital India", "Data.gov.in", "NSP", "Railways",
    "Ministry of Finance", "EPFO", "ESIC", "MeitY", "ICMR", "ISRO",
    "Election Commission", "Ministry of Education", "Ministry of Agriculture",
    "Indian Visa", "Ministry of Labour", "Ministry of Commerce"
  ];

  // Latest announcements (mock content).
  const ANNOUNCEMENTS = [
    { date: "02 Oct 2026", text: "New Udyam portal features launched" },
    { date: "28 Sep 2026", text: "Passport Seva 2.0 rolling out in phases" },
    { date: "21 Sep 2026", text: "DigiLocker expands document categories" },
    { date: "15 Sep 2026", text: "Scholarship application window extended" },
    { date: "08 Sep 2026", text: "Income tax e-filing reminders now available" },
    { date: "01 Sep 2026", text: "Ayushman Bharat eligibility check updated" }
  ];

  // Audience tab content.
  const AUDIENCE = {
    citizens: [
      ["Passport Seva", "https://www.passportindia.gov.in"],
      ["Aadhaar services", "https://uidai.gov.in"],
      ["Ration card", "https://nfsa.gov.in"],
      ["Voter services", "https://voters.eci.gov.in"],
      ["Health schemes", "https://www.mohfw.gov.in"],
      ["DigiLocker", "https://www.digilocker.gov.in"]
    ],
    business: [
      ["Udyam registration", "https://udyamregistration.gov.in"],
      ["Company registration", "https://www.mca.gov.in"],
      ["GST services", "https://www.gst.gov.in"],
      ["Startup India", "https://www.startupindia.gov.in"],
      ["Export promotion", "https://www.commerce.gov.in"],
      ["Trade licences", "https://www.india.gov.in"]
    ],
    overseas: [
      ["Indian visa online", "https://indianvisaonline.gov.in"],
      ["Overseas citizenship", "https://www.mea.gov.in"],
      ["Passport abroad", "https://www.passportindia.gov.in"],
      ["NRI services", "https://www.mea.gov.in"],
      ["Emigration check", "https://emigrate.gov.in"],
      ["Consular help", "https://www.mea.gov.in"]
    ],
    employees: [
      ["Service rules", "https://www.india.gov.in"],
      ["Pension portal", "https://www.pensionindia.gov.in"],
      ["Training and capacity building", "https://www.igotkarmayogi.gov.in"],
      ["Payroll and HR", "https://www.india.gov.in"],
      ["Circulars", "https://www.india.gov.in"],
      ["Government e-Marketplace", "https://gem.gov.in"]
    ],
    students: [
      ["National Scholarship Portal", "https://scholarships.gov.in"],
      ["Entrance exams", "https://nta.ac.in"],
      ["Skill development", "https://www.skillindia.gov.in"],
      ["Higher education", "https://www.education.gov.in"],
      ["Education loans", "https://www.vidyalakshmi.co.in"],
      ["Study in India", "https://www.studyinindia.gov.in"]
    ]
  };

  // Bilingual UI dictionary (English / Hindi). Keys map to CSS selectors.
  const I18N = {
    en: {
      "#langToggle [data-lang-label]": "English / हिन्दी",
      ".signin-btn": "Sign In",
      ".main-nav a[href='#government']": "Government",
      ".main-nav a[href='#citizens']": "Citizens",
      ".main-nav a[href='#business']": "Business",
      ".main-nav a[href='#sectors']": "Sectors",
      ".main-nav a[href='#services']": "Services",
      ".main-nav a[href='#documents']": "Documents",
      "#searchInput@placeholder": "",
      "#ctaInput@placeholder": "Ask a government question…",
      "#heroTitle": null,
      ".hero-sub": "Bharat Portal brings 6,700+ Indian government websites into one place. Ask in plain language, get a clear answer and the exact next step, in English, Hindi, or your language.",
      ".caption": "6,700+ government websites, one place.",
      "#howTitle": "How it works",
      "#servicesTitle": "Popular services",
      "#audienceTitle": "Government by the people",
      "#newsTitle": "Latest announcements",
      "#ctaTitle": "Stop searching 100 websites. Ask one question.",
      ".brand-text .brand-hi": "| भरत पोर्टल",
      ".answer-label": "Answer",
      ".sources-label": "Official sources",
      ".eyebrow": "🇮🇳 The official front door to the Government of India",
      ".skip-link": "Skip to main content"
    },
    hi: {
      "#langToggle [data-lang-label]": "English / हिन्दी",
      ".signin-btn": "साइन इन",
      ".main-nav a[href='#government']": "सरकार",
      ".main-nav a[href='#citizens']": "नागरिक",
      ".main-nav a[href='#business']": "व्यापार",
      ".main-nav a[href='#sectors']": "क्षेत्र",
      ".main-nav a[href='#services']": "सेवाएँ",
      ".main-nav a[href='#documents']": "दस्तावेज़",
      "#searchInput@placeholder": "",
      "#ctaInput@placeholder": "सरकारी प्रश्न पूछें…",
      ".hero-sub": "भरत पोर्टल 6,700+ भारतीय सरकारी वेबसाइटों को एक जगह लाता है। सरल भाषा में पूछें और स्पष्ट उत्तर तथा अगला कदम पाएँ, अंग्रेज़ी, हिन्दी या अपनी भाषा में।",
      ".caption": "6,700+ सरकारी वेबसाइटें, एक जगह।",
      "#howTitle": "यह कैसे काम करता है",
      "#servicesTitle": "लोकप्रिय सेवाएँ",
      "#audienceTitle": "जनता के लिए सरकार",
      "#newsTitle": "ताज़ा घोषणाएँ",
      "#ctaTitle": "100 वेबसाइटें खोजना बंद करें। एक प्रश्न पूछें।",
      ".answer-label": "उत्तर",
      ".sources-label": "आधिकारिक स्रोत",
      ".eyebrow": "🇮🇳 भारत सरकार का आधिकारिक प्रवेश द्वार",
      ".skip-link": "मुख्य सामग्री पर जाएँ"
    }
  };

  /* ------------------------------------------------------------------
     1. ThemeToggle: dark mode with localStorage and prefers-color-scheme
     ------------------------------------------------------------------ */
  const ThemeToggle = (function () {
    const KEY = "bharatPortal.theme";
    const btn = $("#themeToggle");
    const root = document.documentElement;

    function apply(theme) {
      root.setAttribute("data-theme", theme);
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    }

    function init() {
      let saved = null;
      try { saved = localStorage.getItem(KEY); } catch (e) { /* storage unavailable */ }
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      apply(saved || (prefersDark ? "dark" : "light"));

      btn.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        apply(next);
        try { localStorage.setItem(KEY, next); } catch (e) { /* ignore */ }
      });
    }
    return { init };
  })();

  /* ------------------------------------------------------------------
     2. LanguageToggle: swaps UI strings from the I18N dictionary
     ------------------------------------------------------------------ */
  const LanguageToggle = (function () {
    let current = "en";

    function setText(selector, value) {
      const [sel, attr] = selector.split("@");
      $$(sel).forEach((el) => {
        if (attr) el.setAttribute(attr, value);
        else el.textContent = value;
      });
    }

    function apply(lang) {
      const dict = I18N[lang];
      if (!dict) return;
      current = lang;
      document.documentElement.lang = lang === "hi" ? "hi" : "en";
      Object.keys(dict).forEach((sel) => {
        const value = dict[sel];
        if (value === null || value === undefined) return;
        setText(sel, value);
      });
      // The toggle pill always shows both options, so keep its label stable.
      const label = $("#langToggle [data-lang-label]");
      if (label) label.textContent = "English / हिन्दी";
    }

    function init() {
      const toggle = $("#langToggle");
      toggle.addEventListener("click", () => apply(current === "en" ? "hi" : "en"));
      $$("[data-set-lang]").forEach((a) => {
        a.addEventListener("click", (e) => {
          e.preventDefault();
          const code = a.getAttribute("data-set-lang");
          apply(code === "hi" ? "hi" : "en");
        });
      });
    }
    return { init, apply };
  })();

  /* ------------------------------------------------------------------
     3. MobileNav: full-screen overlay, closes on link click or ESC
     ------------------------------------------------------------------ */
  const MobileNav = (function () {
    const burger = $("#hamburger");
    const panel = $("#mobileNav");

    function setOpen(open) {
      panel.classList.toggle("open", open);
      panel.setAttribute("aria-hidden", open ? "false" : "true");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      document.body.style.overflow = open ? "hidden" : "";
      if (open) {
        const first = panel.querySelector("a");
        if (first) first.focus();
      } else {
        burger.focus();
      }
    }

    function init() {
      burger.addEventListener("click", () => setOpen(!panel.classList.contains("open")));
      $$("a", panel).forEach((a) => a.addEventListener("click", () => setOpen(false)));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && panel.classList.contains("open")) setOpen(false);
      });
      window.addEventListener("resize", () => {
        if (window.innerWidth > 1100 && panel.classList.contains("open")) setOpen(false);
      });
    }
    return { init, setOpen };
  })();

  /* ------------------------------------------------------------------
     4. Header: blur and shadow appear once the page scrolls
     ------------------------------------------------------------------ */
  const Header = (function () {
    const header = $("#siteHeader");
    function update() { header.classList.toggle("scrolled", window.scrollY > 8); }
    function init() {
      update();
      window.addEventListener("scroll", update, { passive: true });
    }
    return { init };
  })();

  /* ------------------------------------------------------------------
     5. SmoothScroll: internal anchors scroll smoothly and close the menu
     ------------------------------------------------------------------ */
  const SmoothScroll = (function () {
    function init() {
      document.addEventListener("click", (e) => {
        const a = e.target.closest('a[href^="#"]');
        if (!a || a.getAttribute("href") === "#") return;
        const target = document.querySelector(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        MobileNav.setOpen(false);
        target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      });
    }
    return { init };
  })();

  /* ------------------------------------------------------------------
     6. RevealOnScroll: adds .visible to .reveal elements as they enter
     ------------------------------------------------------------------ */
  const RevealOnScroll = (function () {
    function init() {
      const items = $$(".reveal");
      if (reduceMotion || !("IntersectionObserver" in window)) {
        items.forEach((el) => el.classList.add("visible"));
        return;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
      items.forEach((el) => io.observe(el));
    }
    return { init };
  })();

  /* ------------------------------------------------------------------
     7. TypewriterRotator: types and deletes example questions in the
        search placeholder with a blinking caret.
     ------------------------------------------------------------------ */
  const TypewriterRotator = (function () {
    const input = $("#searchInput");
    const caret = $(".caret");
    let qIndex = 0;
    let charIndex = 0;
    let deleting = false;
    let timer = null;
    let stopped = false;

    function tick() {
      if (stopped) return;
      const text = EXAMPLE_QUESTIONS[qIndex];
      if (!deleting) {
        charIndex++;
        input.setAttribute("placeholder", text.slice(0, charIndex));
        if (charIndex === text.length) {
          deleting = true;
          timer = setTimeout(tick, 1800);
          return;
        }
        timer = setTimeout(tick, 55);
      } else {
        charIndex--;
        input.setAttribute("placeholder", text.slice(0, charIndex));
        if (charIndex === 0) {
          deleting = false;
          qIndex = (qIndex + 1) % EXAMPLE_QUESTIONS.length;
          timer = setTimeout(tick, 400);
          return;
        }
        timer = setTimeout(tick, 28);
      }
    }

    function stop() {
      stopped = true;
      clearTimeout(timer);
      input.setAttribute("placeholder", "Ask a government question…");
    }

    function init() {
      // Show the static caret only while the user is typing.
      input.addEventListener("input", () => {
        if (input.value.length) { stopped = true; clearTimeout(timer); }
        caret.classList.toggle("visible", input.value.length > 0);
      });
      input.addEventListener("focus", () => { if (!input.value) stop(); });
      if (reduceMotion) {
        input.setAttribute("placeholder", EXAMPLE_QUESTIONS[0]);
        return;
      }
      tick();
    }
    return { init, stop };
  })();

  /* ------------------------------------------------------------------
     8. AnswerEngine: keyword-matched mock Q&A with typing output,
        thinking dots for 800 ms, and source chips after the text.
     ------------------------------------------------------------------ */
  const AnswerEngine = (function () {
    const panel = $("#answerPanel");
    const qEl = $("#answerQ");
    const textEl = $("#answerText");
    const thinking = $("#thinking");
    const sourcesWrap = $("#sources");
    const chipsWrap = $("#sourceChips");
    let typeTimer = null;
    let thinkTimer = null;
    let runId = 0;

    function match(question) {
      const q = question.toLowerCase();
      for (const entry of ANSWERS) {
        if (entry.keys.some((k) => q.includes(k))) return entry;
      }
      return FALLBACK_ANSWER;
    }

    function clearTimers() {
      clearTimeout(thinkTimer);
      clearInterval(typeTimer);
    }

    function renderSources(key) {
      chipsWrap.innerHTML = "";
      SOURCES[key].forEach((s) => {
        const a = document.createElement("a");
        a.className = "source-chip";
        a.href = s.url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.innerHTML =
          '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M19 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        a.appendChild(document.createTextNode(s.name));
        chipsWrap.appendChild(a);
      });
    }

    function ask(question) {
      const q = (question || "").trim();
      if (!q) return;
      clearTimers();
      const id = ++runId;
      const answer = match(q);

      panel.hidden = false;
      qEl.textContent = "“" + q + "”";
      textEl.textContent = "";
      sourcesWrap.hidden = true;
      chipsWrap.innerHTML = "";
      thinking.hidden = false;

      thinkTimer = setTimeout(() => {
        if (id !== runId) return;
        thinking.hidden = true;
        let i = 0;
        const chars = Array.from(answer.text);
        const speed = reduceMotion ? 0 : 16;
        if (speed === 0) {
          textEl.textContent = answer.text;
          finish(id, answer.source);
          return;
        }
        typeTimer = setInterval(() => {
          if (id !== runId) return clearInterval(typeTimer);
          textEl.textContent += chars[i++];
          if (i >= chars.length) {
            clearInterval(typeTimer);
            finish(id, answer.source);
          }
        }, speed);
      }, 800);

      panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    }

    function finish(id, sourceKey) {
      if (id !== runId) return;
      renderSources(sourceKey);
      sourcesWrap.hidden = false;
    }

    function init() {
      // Other modules may trigger the engine via this custom event.
      document.addEventListener("bharat:ask", (e) => ask(e.detail));
    }
    return { init, ask };
  })();

  /* Search form, CTA form, and quick-topic chips */
  const SearchForms = (function () {
    function init() {
      const form = $("#searchForm");
      const input = $("#searchInput");
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const q = input.value.trim();
        if (!q) { input.focus(); return; }
        TypewriterRotator.stop();
        AnswerEngine.ask(q);
      });

      const ctaForm = $("#ctaForm");
      const ctaInput = $("#ctaInput");
      ctaForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const q = ctaInput.value.trim();
        if (!q) { ctaInput.focus(); return; }
        input.value = q;
        TypewriterRotator.stop();
        AnswerEngine.ask(q);
        document.getElementById("top").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
      });

      $$(".chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          const q = chip.getAttribute("data-q");
          input.value = q;
          input.dispatchEvent(new Event("input"));
          TypewriterRotator.stop();
          AnswerEngine.ask(q);
        });
      });

      // Voice search button: placeholder interaction (no network calls).
      $(".mic-btn").addEventListener("click", () => input.focus());
    }
    return { init };
  })();

  /* ------------------------------------------------------------------
     9. SphereRenderer: builds ~30 site-preview cards on a sphere using
        spherical coordinates, auto-rotates, pauses on hover, and drags.
     ------------------------------------------------------------------ */
  const SphereRenderer = (function () {
    const sphere = $("#sphere");
    const RADIUS = 170;
    let angleY = 0;
    let velocity = 0.25;       // degrees per frame, auto-rotation
    let hovering = false;
    let dragging = false;
    let lastX = 0;
    let rafId = null;
    const cards = [];

    function build() {
      const n = SITE_NAMES.length;
      // Fibonacci sphere distribution gives an even spread of cards.
      const golden = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2;           // -1 .. 1
        const r = Math.sqrt(1 - y * y);
        const theta = golden * i;                  // longitude
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;

        const card = document.createElement("div");
        card.className = "sphere-card";
        card.setAttribute("aria-hidden", "true");
        card.innerHTML =
          '<span class="bar"><i></i><i></i><i></i></span>' +
          '<span class="name"></span>' +
          '<span class="lines"><b></b><b></b><b></b></span>';
        card.querySelector(".name").textContent = SITE_NAMES[i];

        // Place on the sphere surface, rotated so the card faces outward.
        const lon = Math.atan2(x, z) * 180 / Math.PI;
        const lat = Math.asin(y) * 180 / Math.PI;
        card.style.transform =
          "translate3d(" + (x * RADIUS).toFixed(1) + "px," + (-y * RADIUS).toFixed(1) + "px," + (z * RADIUS).toFixed(1) + "px) " +
          "rotateY(" + lon.toFixed(1) + "deg) rotateX(" + (-lat).toFixed(1) + "deg)";
        sphere.appendChild(card);
        cards.push(card);
      }
    }

    function render() {
      sphere.style.transform = "rotateX(-12deg) rotateY(" + angleY.toFixed(2) + "deg)";
    }

    function loop() {
      if (!dragging && !hovering) {
        angleY += velocity;
      }
      render();
      rafId = requestAnimationFrame(loop);
    }

    function bindPointer() {
      sphere.addEventListener("mouseenter", () => { hovering = true; });
      sphere.addEventListener("mouseleave", () => { hovering = false; });

      sphere.addEventListener("pointerdown", (e) => {
        dragging = true;
        lastX = e.clientX;
        sphere.classList.add("dragging");
        sphere.setPointerCapture(e.pointerId);
      });
      sphere.addEventListener("pointermove", (e) => {
        if (!dragging) return;
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        angleY += dx * 0.35;
      });
      const end = (e) => {
        if (!dragging) return;
        dragging = false;
        sphere.classList.remove("dragging");
        try { sphere.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      };
      sphere.addEventListener("pointerup", end);
      sphere.addEventListener("pointercancel", end);
    }

    function init() {
      build();
      bindPointer();
      render();
      if (!reduceMotion) {
        loop();
      }
    }
    return { init };
  })();

  /* ------------------------------------------------------------------
     10. TabSwitcher: audience tabs with a sliding underline and fade.
     ------------------------------------------------------------------ */
  const TabSwitcher = (function () {
    const bar = $("#tabBar");
    const indicator = $("#tabIndicator");
    const tabs = $$(".tab", bar);
    const panel = $("#tabPanel");
    const list = $("#tabLinks");

    function moveIndicator(tab) {
      indicator.style.left = tab.offsetLeft + "px";
      indicator.style.width = tab.offsetWidth + "px";
    }

    function renderPanel(key) {
      list.innerHTML = "";
      AUDIENCE[key].forEach(([label, url]) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = label;
        li.appendChild(a);
        list.appendChild(li);
      });
    }

    function activate(tab, animate) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle("active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.tabIndex = on ? 0 : -1;
      });
      moveIndicator(tab);
      renderPanel(tab.getAttribute("data-tab"));
      if (animate && !reduceMotion) {
        panel.classList.remove("swap");
        void panel.offsetWidth; // restart animation
        panel.classList.add("swap");
      }
    }

    function init() {
      tabs.forEach((tab, i) => {
        tab.addEventListener("click", () => activate(tab, true));
        tab.addEventListener("keydown", (e) => {
          if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
          e.preventDefault();
          const dir = e.key === "ArrowRight" ? 1 : -1;
          const next = tabs[(i + dir + tabs.length) % tabs.length];
          next.focus();
          activate(next, true);
        });
      });
      activate(tabs[0], false);
      window.addEventListener("resize", () => {
        const active = tabs.find((t) => t.classList.contains("active"));
        if (active) moveIndicator(active);
      });
    }
    return { init };
  })();

  /* ------------------------------------------------------------------
     11. CounterAnimator: stats count up when they scroll into view.
     ------------------------------------------------------------------ */
  const CounterAnimator = (function () {
    function format(value, decimals) {
      return value.toLocaleString("en-IN", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      });
    }

    function animate(el) {
      const target = parseFloat(el.getAttribute("data-target"));
      const suffix = el.getAttribute("data-suffix") || "";
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      if (reduceMotion) {
        el.textContent = format(target, decimals) + suffix;
        return;
      }
      const duration = 1600;
      const start = performance.now();
      function step(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = format(target * eased, decimals) + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function init() {
      const nums = $$(".stat-num");
      if (!("IntersectionObserver" in window)) {
        nums.forEach(animate);
        return;
      }
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      nums.forEach((el) => io.observe(el));
    }
    return { init };
  })();

  /* ------------------------------------------------------------------
     12. Ticker: fills the announcement marquee (duplicated for a
         seamless loop; the CSS animation moves it by exactly half).
     ------------------------------------------------------------------ */
  const Ticker = (function () {
    function init() {
      const track = $("#tickerTrack");
      const items = ANNOUNCEMENTS.concat(ANNOUNCEMENTS);
      items.forEach((item) => {
        const li = document.createElement("li");
        const badge = document.createElement("span");
        badge.className = "date-badge";
        badge.textContent = item.date;
        const text = document.createElement("span");
        text.textContent = item.text;
        li.appendChild(badge);
        li.appendChild(text);
        track.appendChild(li);
      });
    }
    return { init };
  })();

  /* ------------------------------------------------------------------
     13. BackToTop: fixed button appears after 600 px of scrolling.
     ------------------------------------------------------------------ */
  const BackToTop = (function () {
    const btn = $("#backToTop");
    function update() { btn.classList.toggle("show", window.scrollY > 600); }
    function init() {
      update();
      window.addEventListener("scroll", update, { passive: true });
      btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      });
    }
    return { init };
  })();

  /* ------------------------------------------------------------------
     Boot: initialise every module once the DOM is ready.
     ------------------------------------------------------------------ */
  function boot() {
    ThemeToggle.init();
    LanguageToggle.init();
    MobileNav.init();
    Header.init();
    SmoothScroll.init();
    RevealOnScroll.init();
    AnswerEngine.init();
    SearchForms.init();
    TypewriterRotator.init();
    SphereRenderer.init();
    TabSwitcher.init();
    CounterAnimator.init();
    Ticker.init();
    BackToTop.init();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
