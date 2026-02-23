import "./style.css";

const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}
window.scrollTo(0, 0);

function setYear() {
  const el = document.getElementById("year");
  if (!el) return;
  el.textContent = new Date().getFullYear();
}

/* =========================
   LOADER (morphs to hero)
   ========================= */
function setupLoader() {
  const loader = document.getElementById("loader");
  if (!loader) return;

  const card = loader.querySelector(".loader2__card");
  const heroFrame = document.getElementById("heroFrame");

  const MIN_SHOW_MS = 1000;
  const MAX_SHOW_MS = 2200;

  const start = performance.now();

  const sub = loader.querySelector(".loader2__sub");
  const lines = ["Booting portfolio…", "Loading projects…", "Warming UI…"];
  let li = 0;

  const subTimer = setInterval(() => {
    if (!sub) return;
    li = (li + 1) % lines.length;
    sub.textContent = lines[li];
  }, 520);

  const removeLoader = () => {
    clearInterval(subTimer);
    if (loader && loader.parentNode) loader.remove();
  };

  const fadeOut = () => {
    loader.classList.add("out");
    setTimeout(removeLoader, 420);
  };

  const morphToHero = () => {
    if (!card || !heroFrame) {
      fadeOut();
      return;
    }

    const cardRect = card.getBoundingClientRect();
    const heroRect = heroFrame.getBoundingClientRect();

    // fixed positioning for morph
    card.style.position = "fixed";
    card.style.left = `${cardRect.left}px`;
    card.style.top = `${cardRect.top}px`;
    card.style.width = `${cardRect.width}px`;
    card.style.height = `${cardRect.height}px`;
    card.style.margin = "0";
    card.style.zIndex = "10000";

    // hide pins/dots during morph
    const pins = loader.querySelectorAll(".loader2__pin");
    const dots = loader.querySelector(".loader2__dots");
    pins.forEach((p) => (p.style.opacity = "0"));
    if (dots) dots.style.opacity = "0";

    // reflow
    card.getBoundingClientRect();

    card.style.transition =
      "left .55s cubic-bezier(.2,.9,.2,1), top .55s cubic-bezier(.2,.9,.2,1), width .55s cubic-bezier(.2,.9,.2,1), height .55s cubic-bezier(.2,.9,.2,1), transform .55s cubic-bezier(.2,.9,.2,1), opacity .3s ease";

    requestAnimationFrame(() => {
      card.style.left = `${heroRect.left}px`;
      card.style.top = `${heroRect.top}px`;
      card.style.width = `${heroRect.width}px`;
      card.style.height = `${heroRect.height}px`;
      card.style.transform = "rotate(0deg)";
    });

    setTimeout(() => {
      loader.style.opacity = "0";
      setTimeout(removeLoader, 260);
    }, 580);
  };

  const finish = () => {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, MIN_SHOW_MS - elapsed);
    setTimeout(morphToHero, wait);
  };

  const hardTimeout = setTimeout(() => finish(), MAX_SHOW_MS);

  window.addEventListener("load", () => {
    clearTimeout(hardTimeout);
    finish();
  });
}

function fitFooterClock() {
  const el = document.getElementById("clockOfClocks");
  if (!el) return;

  // reset
  el.style.transform = "scale(1)";

  // parent is the clock card
  const parent = el.parentElement;
  if (!parent) return;

  const available = parent.clientWidth - 24; // padding buffer
  const needed = el.scrollWidth;

  if (needed > available) {
    const s = Math.max(0.72, available / needed); // don’t shrink too much
    el.style.transform = `scale(${s})`;
  }
}

window.addEventListener("resize", fitFooterClock);

// call this after each time update (every second)
fitFooterClock();

/* =========================
   RIGHT DOCK NAV HIGHLIGHT
   ========================= */
function setupDockHighlight() {
  const links = [...document.querySelectorAll(".dock__item")];
  if (!links.length) return;

  const sections = links
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (!sections.length) return;

  const setActive = (id) => {
    links.forEach((a) =>
      a.classList.toggle("is-active", a.getAttribute("href") === id),
    );
  };

  const getClosestSectionId = () => {
    const probe = window.scrollY + window.innerHeight * 0.42;
    let bestId = links[0]?.getAttribute("href") || "#home";
    let bestDist = Infinity;

    for (const sec of sections) {
      const top = sec.offsetTop;
      const height = Math.max(sec.offsetHeight, 1);
      const center = top + height * 0.5;
      const dist = Math.abs(center - probe);

      if (dist < bestDist) {
        bestDist = dist;
        bestId = `#${sec.id}`;
      }
    }
    return bestId;
  };

  const update = () => setActive(getClosestSectionId());

  links.forEach((a) => {
    a.addEventListener("click", () => {
      const id = a.getAttribute("href");
      setActive(id);
    });
  });

  update();

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        update();
        ticking = false;
      });
    },
    { passive: true },
  );

  window.addEventListener("resize", update);
}

/* =========================
   STAMPS
   ========================= */
function setupStamps() {
  const items = $$(".stamp");
  if (!items.length) return;

  const obs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          obs.unobserve(e.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" },
  );

  items.forEach((el) => obs.observe(el));
}

/* =========================
   TEXTURE TOGGLE
   ========================= */
function setupTextureToggle() {
  const btn = $("#textureBtn");
  if (!btn) return;

  const key = "px_texture";
  const saved = localStorage.getItem(key);

  const isOff = saved === "off";
  document.body.classList.toggle("texture-off", isOff);

  const sync = () => {
    const off = document.body.classList.contains("texture-off");
    btn.textContent = off ? "Texture: OFF" : "Texture: ON";
    btn.setAttribute("aria-pressed", off ? "false" : "true");
  };

  sync();

  btn.addEventListener("click", () => {
    document.body.classList.toggle("texture-off");
    const off = document.body.classList.contains("texture-off");
    localStorage.setItem(key, off ? "off" : "on");
    sync();
  });
}

/* =========================
   CONTACT FORM (DEMO)
   ========================= */
function setupContactForm() {
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = new FormData(form).get("name")?.toString().trim() || "Someone";
    alert(`Got it, ${name}!\nI’ll reply soon. (Demo form)`);
    form.reset();
  });
}

/* =========================
   COPY EMAIL BUTTON
   ========================= */
function setupCopyEmail() {
  const btn = document.getElementById("copyEmailBtn");
  const hint = document.getElementById("copyHint");
  const email = "hello@pixxivo.com";

  if (!btn) return;

  const show = (msg) => {
    if (!hint) return;
    hint.textContent = msg;
    setTimeout(() => {
      if (hint.textContent === msg) hint.textContent = "";
    }, 1600);
  };

  btn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(email);
      show("Copied: hello@pixxivo.com");
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = email;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
      show("Copied: hello@pixxivo.com");
    }
  });
}

/* =========================
   FOOTER "NOW" SHUFFLE
   ========================= */
function setupFooterNowShuffle() {
  const btn = document.getElementById("shuffleNowBtn");
  const box = document.getElementById("nowStatus");
  if (!btn || !box) return;

  const statuses = [
    "Building Pixxivo X1 flows",
    "Polishing UI + animations",
    "Working on KrishiRakshak",
    "Learning + shipping daily",
    "Designing clean interfaces",
    "Making hardware UX calmer",
  ];

  btn.addEventListener("click", () => {
    box.textContent = statuses[Math.floor(Math.random() * statuses.length)];
  });
}

/* =========================
   Scroll Velocity Marquee (NO GAPS)
   - Auto clones chunks until it fully covers (infinite)
   - Speed reacts to scroll velocity
   - Two rows go opposite directions using data-dir
========================= */
function setupScrollVelocityMarquee() {
  const rows = [...document.querySelectorAll(".scrollMarquee__row")];
  if (!rows.length) return;

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // Build perfect infinite tracks
  function fillTrack(track) {
    const base = track.querySelector(".scrollMarquee__chunk");
    if (!base) return;

    // remove old clones (if resize reruns)
    [
      ...track.querySelectorAll(".scrollMarquee__chunk[data-clone='1']"),
    ].forEach((n) => n.remove());

    const parentWidth = track.parentElement.getBoundingClientRect().width;

    // Ensure at least 2x coverage to avoid any gap during wrap
    let safety = 0;
    while (track.scrollWidth < parentWidth * 2.2 && safety < 50) {
      const clone = base.cloneNode(true);
      clone.setAttribute("data-clone", "1");
      track.appendChild(clone);
      safety++;
    }
  }

  // Initial fill + on resize
  const tracks = rows
    .map((r) => r.querySelector("[data-marquee]"))
    .filter(Boolean);
  tracks.forEach(fillTrack);

  let resizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => tracks.forEach(fillTrack), 120);
  });

  // Animation state
  const state = rows
    .map((row) => ({
      row,
      track: row.querySelector("[data-marquee]"),
      dir: Number(row.getAttribute("data-dir") || "1"),
      x: 0,
      baseSpeed: 55, // px/sec baseline
      boost: 0, // added by scroll velocity
    }))
    .filter((s) => s.track);

  if (!state.length) return;

  // scroll velocity detection
  let lastY = window.scrollY;
  let lastT = performance.now();

  function onScroll() {
    const nowY = window.scrollY;
    const nowT = performance.now();

    const dy = nowY - lastY;
    const dt = Math.max(16, nowT - lastT);

    // px per second scroll speed
    const v = (dy / dt) * 1000;

    // boost: stronger = more punchy, clamp to keep stable
    const boost = Math.max(-280, Math.min(280, v)) * 0.35;

    state.forEach((s) => {
      s.boost = boost;
    });

    lastY = nowY;
    lastT = nowT;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // loop
  let raf = 0;
  let prev = performance.now();

  function tick(t) {
    const dt = Math.min(0.05, (t - prev) / 1000);
    prev = t;

    state.forEach((s) => {
      if (!s.track) return;

      // ease boost back to 0 smoothly
      s.boost *= 0.9;

      const speed = prefersReduced ? 25 : s.baseSpeed + s.boost;
      s.x += s.dir * speed * dt;

      // wrap perfectly by the width of ONE chunk (first element)
      const firstChunk = s.track.querySelector(".scrollMarquee__chunk");
      const chunkW = firstChunk
        ? firstChunk.getBoundingClientRect().width
        : 600;

      // Keep x in [-chunkW, 0] range to avoid float drift
      if (s.x <= -chunkW) s.x += chunkW;
      if (s.x >= 0) s.x -= chunkW;

      s.track.style.transform = `translate3d(${s.x}px,0,0)`;
    });

    raf = requestAnimationFrame(tick);
  }

  raf = requestAnimationFrame(tick);
}

/* =========================
   CLOCK OF CLOCKS (DOM)
========================= */
function setupClockOfClocks() {
  const mount = document.getElementById("clockOfClocks");
  if (!mount) return;

  const dateEl = document.getElementById("cocDate");

  // ✅ EXACT ORIENTATION YOU GAVE
  const rotation = {
    " ": [135, 135],
    "┘": [180, 270],
    "└": [0, 270],
    "┐": [90, 180],
    "┌": [0, 90],
    "-": [0, 180],
    "|": [90, 270],
  };

  const digits = {
    0: [
      "┌",
      "-",
      "-",
      "┐",
      "|",
      "┌",
      "┐",
      "|",
      "|",
      "|",
      "|",
      "|",
      "|",
      "|",
      "|",
      "|",
      "|",
      "└",
      "┘",
      "|",
      "└",
      "-",
      "-",
      "┘",
    ],
    1: [
      "┌",
      "-",
      "┐",
      " ",
      "└",
      "┐",
      "|",
      " ",
      " ",
      "|",
      "|",
      " ",
      " ",
      "|",
      "|",
      " ",
      "┌",
      "┘",
      "└",
      "┐",
      "└",
      "-",
      "-",
      "┘",
    ],
    2: [
      "┌",
      "-",
      "-",
      "┐",
      "└",
      "-",
      "┐",
      "|",
      "┌",
      "-",
      "┘",
      "|",
      "|",
      "┌",
      "-",
      "┘",
      "|",
      "└",
      "-",
      "┐",
      "└",
      "-",
      "-",
      "┘",
    ],
    3: [
      "┌",
      "-",
      "-",
      "┐",
      "└",
      "-",
      "┐",
      "|",
      " ",
      "┌",
      "┘",
      "|",
      " ",
      "└",
      "┐",
      "|",
      "┌",
      "-",
      "┘",
      "|",
      "└",
      "-",
      "-",
      "┘",
    ],
    4: [
      "┌",
      "┐",
      "┌",
      "┐",
      "|",
      "|",
      "|",
      "|",
      "|",
      "└",
      "┘",
      "|",
      "└",
      "-",
      "┐",
      "|",
      " ",
      " ",
      "|",
      "|",
      " ",
      " ",
      "└",
      "┘",
    ],
    5: [
      "┌",
      "-",
      "-",
      "┐",
      "|",
      "┌",
      "-",
      "┘",
      "|",
      "└",
      "-",
      "┐",
      "└",
      "-",
      "┐",
      "|",
      "┌",
      "-",
      "┘",
      "|",
      "└",
      "-",
      "-",
      "┘",
    ],
    6: [
      "┌",
      "-",
      "-",
      "┐",
      "|",
      "┌",
      "-",
      "┘",
      "|",
      "└",
      "-",
      "┐",
      "|",
      "┌",
      "┐",
      "|",
      "|",
      "└",
      "┘",
      "|",
      "└",
      "-",
      "-",
      "┘",
    ],
    7: [
      "┌",
      "-",
      "-",
      "┐",
      "└",
      "-",
      "┐",
      "|",
      " ",
      " ",
      "|",
      "|",
      " ",
      " ",
      "|",
      "|",
      " ",
      " ",
      "|",
      "|",
      " ",
      " ",
      "└",
      "┘",
    ],
    8: [
      "┌",
      "-",
      "-",
      "┐",
      "|",
      "┌",
      "┐",
      "|",
      "|",
      "└",
      "┘",
      "|",
      "|",
      "┌",
      "┐",
      "|",
      "|",
      "└",
      "┘",
      "|",
      "└",
      "-",
      "-",
      "┘",
    ],
    9: [
      "┌",
      "-",
      "-",
      "┐",
      "|",
      "┌",
      "┐",
      "|",
      "|",
      "└",
      "┘",
      "|",
      "└",
      "-",
      "┐",
      "|",
      "┌",
      "-",
      "┘",
      "|",
      "└",
      "-",
      "-",
      "┘",
    ],
  };

  function cell(value, index) {
    const digit = digits[value];
    if (digit) {
      const symbol = digit[index];
      const pair = rotation[symbol];
      if (pair) return pair;
    }
    return rotation[" "];
  }

  // ---------- builders ----------
  function makeCell() {
    const cellEl = document.createElement("div");
    cellEl.className = "cocCell isDim";

    const h1 = document.createElement("span");
    h1.className = "cocHand cocHand--a";

    const h2 = document.createElement("span");
    h2.className = "cocHand cocHand--b";

    cellEl.appendChild(h1);
    cellEl.appendChild(h2);

    return { cellEl, h1, h2 };
  }

  function makeDigit() {
    const el = document.createElement("div");
    el.className = "cocDigit";
    const cells = [];
    for (let i = 0; i < 24; i++) {
      const c = makeCell();
      el.appendChild(c.cellEl);
      cells.push(c);
    }
    return { el, cells };
  }

  function makeColon() {
    const el = document.createElement("div");
    el.className = "cocColon";
    const cells = [];
    for (let i = 0; i < 6; i++) {
      const c = makeCell();
      el.appendChild(c.cellEl);
      cells.push(c);
    }
    return { el, cells };
  }

  function setHands(c, a1, a2) {
    c.h1.style.transform = `translate(-1px, -50%) rotate(${a1}deg)`;
    c.h2.style.transform = `translate(-1px, -50%) rotate(${a2}deg)`;
  }

  function paintDigit(digitObj, valueChar) {
    const v = String(valueChar);
    for (let i = 0; i < 24; i++) {
      const [a1, a2] = cell(v, i);
      setHands(digitObj.cells[i], a1, a2);

      const isBlank = a1 === rotation[" "][0] && a2 === rotation[" "][1];
      digitObj.cells[i].cellEl.classList.toggle("isDim", isBlank);
      digitObj.cells[i].cellEl.classList.toggle("isOn", !isBlank);
    }
  }

  function paintColon(colonObj, blinkOn) {
    // dots at rows 1 and 4 (looks best in 6 rows)
    const onRows = new Set([1, 4]);
    colonObj.cells.forEach((c, i) => {
      const isOn = blinkOn && onRows.has(i);
      c.cellEl.classList.toggle("isDim", !isOn);
      c.cellEl.classList.toggle("isOn", isOn);

      // for colon dots we can use "-" to make a tiny bar
      const [a1, a2] = isOn ? rotation["-"] : rotation[" "];
      setHands(c, a1, a2);
    });
  }

  // ---------- build HH:MM:SS ----------
  mount.innerHTML = "";
  const d1 = makeDigit();
  const d2 = makeDigit();
  const c1 = makeColon();
  const d3 = makeDigit();
  const d4 = makeDigit();
  const c2 = makeColon();
  const d5 = makeDigit();
  const d6 = makeDigit();

  mount.append(d1.el, d2.el, c1.el, d3.el, d4.el, c2.el, d5.el, d6.el);

  const pad2 = (n) => String(n).padStart(2, "0");

  function tick() {
    const now = new Date();
    const hh = pad2(now.getHours());
    const mm = pad2(now.getMinutes());
    const ss = pad2(now.getSeconds());

    paintDigit(d1, hh[0]);
    paintDigit(d2, hh[1]);
    paintDigit(d3, mm[0]);
    paintDigit(d4, mm[1]);
    paintDigit(d5, ss[0]);
    paintDigit(d6, ss[1]);

    const blink = now.getSeconds() % 2 === 0;
    paintColon(c1, blink);
    paintColon(c2, blink);

    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString(undefined, {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    }
  }

  tick();
  setInterval(tick, 1000);
}

function setupContact() {
  const toast = document.getElementById("toast");
  const copyBtn = document.getElementById("copyEmailBtn");
  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");

  const showToast = (msg) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("is-show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("is-show"), 1400);
  };

  // Copy email
  if (copyBtn) {
    copyBtn.addEventListener("click", async (e) => {
      e.preventDefault(); // IMPORTANT (if button is inside form)
      e.stopPropagation();

      const email = copyBtn.dataset.email || "prateekshukla@pixxivo.com";

      try {
        // Clipboard API requires secure context (HTTPS/localhost)
        if (!window.isSecureContext) throw new Error("Not HTTPS");
        await navigator.clipboard.writeText(email);
        showToast("Copied: " + email);
      } catch (err) {
        // Strong fallback (better mobile support)
        const ta = document.createElement("textarea");
        ta.value = email;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);

        ta.focus();
        ta.select();
        ta.setSelectionRange(0, ta.value.length);

        const ok = document.execCommand("copy");
        ta.remove();

        showToast(ok ? "Copied: " + email : "Copy failed (try HTTPS)");
      }
    });
  }

  // Form: Formspree if configured, else fallback to mailto
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const action = form.getAttribute("action") || "";
      const isFormspreeReady =
        action.includes("formspree.io/f/") && !action.endsWith("/xaqdlbqg");

      const fd = new FormData(form);
      const name = (fd.get("name") || "").toString().trim();
      const message = (fd.get("message") || "").toString().trim();
      const reply = (fd.get("_replyto") || "").toString().trim();

      if (!name || !message) {
        statusEl.textContent = "Please fill name + message.";
        showToast("Name + message needed");
        return;
      }

      // If Formspree configured -> send AJAX
      if (isFormspreeReady) {
        statusEl.textContent = "Sending…";
        try {
          const res = await fetch(action, {
            method: "POST",
            headers: { Accept: "application/json" },
            body: fd,
          });

          if (res.ok) {
            statusEl.textContent = "Sent ✅";
            showToast("Sent ✅");
            form.reset();
          } else {
            statusEl.textContent = "Couldn’t send. Using email fallback…";
            mailtoFallback(name, message, reply);
          }
        } catch {
          statusEl.textContent = "Offline / blocked. Using email fallback…";
          mailtoFallback(name, message, reply);
        }
      } else {
        // mailto fallback
        mailtoFallback(name, message, reply);
      }
    });
  }

  function mailtoFallback(name, message, reply) {
    const to = "prateekshukla@pixxivo.com";
    const subject = encodeURIComponent(`Website message from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${reply || "(not provided)"}\n\nMessage:\n${message}\n`,
    );
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
    if (statusEl) statusEl.textContent = "Opening your email app…";
    showToast("Opening email…");
  }
}

// Run AFTER DOM is ready
document.addEventListener("DOMContentLoaded", setupContact);

/* =========================
   CASE STUDY OVERLAY (Projects + About)
========================= */

// Put your long “real” content here:
const CASE_DATA = {
  krishirakshak: {
    kicker: "PROJECT • AGRI",
    title: "KrishiRakshak",
    subtitle:
      "Plant disease detection system built around usability: capture → analyze → result → action.",
    badges: ["Raspberry Pi", "Camera", "Python", "UI"],

    links: [],

    media: [
      {
        type: "image",
        src: "images/krishirakshak-device.webp",
        alt: "KrishiRakshak device",
      },
      {
        type: "image",
        src: "images/krishirakshak-scan.webp",
        alt: "KrishiRakshak scan screen",
      },
    ],

    sections: [
      {
        t: "Why I built it",
        p: "Most plant AI demos stop at prediction. I wanted something that feels usable in real life — fast scan flow, readable result screen, and clear next steps.",
      },
      {
        t: "Core UX thinking",
        list: [
          "Fast capture flow with visual feedback.",
          "Readable result card (big labels, no clutter).",
          "Actionable suggestion output — not just a disease name.",
          "Built like a mini product, not a random demo.",
        ],
      },
      {
        t: "Current direction",
        p: "Improving dataset robustness and making the UI even calmer and faster. The goal is product feel, not just model accuracy.",
      },
    ],
  },

  pixxivo: {
    kicker: "CONCEPT • HEALTH",
    title: "Pixxivo X1",
    subtitle:
      "Non-invasive health scanner concept focused on clarity and trust.",

    badges: ["AS7265X", "ESP32-S3", "Embedded UX", "Data Flow"],

    links: [],

    media: [
      {
        type: "video",
        src: "images/pixxivo-vid.mp4",
        poster: "images/pixxivo-device.webp",
      },
      {
        type: "image",
        src: "images/pixxivo-device.webp",
        alt: "Pixxivo device",
      },
    ],

    sections: [
      {
        t: "Problem I care about",
        p: "Health devices often overwhelm users with numbers. I want results to feel simple: progress → label → explanation → suggestion.",
      },
      {
        t: "Interaction philosophy",
        list: [
          "Clear progress feedback while scanning.",
          "Low / Good / High labels instead of raw confusion.",
          "History + comparison for long-term trends.",
          "Alerts that guide action, not fear.",
        ],
      },
      {
        t: "Status",
        p: "Currently iterating on the UI system and hardware integration. Product feel first, complexity later.",
      },
    ],
  },

  about_me: {
    kicker: "ABOUT",
    title: "Builder mode, not busy mode.",
    subtitle:
      "I build like a founder, not like someone trying to finish tasks.",

    badges: ["Student", "Builder", "Pixxivo"],

    links: [],

    media: [
      {
        type: "image",
        src: "images/prateek-illustration.webp",
        alt: "Prateek illustration",
      },
    ],

    sections: [
      {
        t: "The real version",
        p: "I’m Prateek — a student from Trichy who somehow decided homework wasn’t enough and started building devices instead. I’m the founder of Pixxivo, which basically means I spend more time thinking about UI and sensors than normal teenagers probably should. I like coding because it feels like building with invisible Lego, and I get weirdly excited about making things look clean and work smoothly. When I’m not staring at a screen, I’m either playing football, grinding some video games, or thinking about my next idea mid-match. I don’t build just to say I built something — I build because I genuinely enjoy figuring things out, breaking them, fixing them, and making them feel right.q",
      },
      {
        t: "Rules I follow",
        list: [
          "If it feels slow, optimize it.",
          "If it looks noisy, simplify it.",
          "If it needs explanation, fix the UI.",
          "Ship → improve → repeat.",
        ],
      },
      {
        t: "What excites me",
        p: "Clean UI systems, embedded devices, fast interactions, and projects that feel like real products — not school assignments.",
      },
    ],
  },
};

function setupCaseOverlay() {
  const overlay = document.getElementById("caseOverlay");
  if (!overlay) return;

  const ovKicker = document.getElementById("ovKicker");
  const ovTitle = document.getElementById("ovTitle");
  const ovSub = document.getElementById("ovSub");
  const ovBadges = document.getElementById("ovBadges");
  const ovMediaMain = document.getElementById("ovMediaMain");
  const ovThumbs = document.getElementById("ovThumbs");
  const ovLinks = document.getElementById("ovLinks");
  const ovContent = document.getElementById("ovContent");

  let lastFocus = null;

  function setMainMedia(item) {
    ovMediaMain.innerHTML = "";

    if (!item) return;

    if (item.type === "video") {
      const v = document.createElement("video");
      v.src = item.src;
      v.controls = true;
      v.playsInline = true;
      v.preload = "metadata";
      if (item.poster) v.poster = item.poster;
      ovMediaMain.appendChild(v);
      return;
    }

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt || "";
    ovMediaMain.appendChild(img);
  }

  function openCase(key) {
    const data = CASE_DATA[key];
    if (!data) return;

    lastFocus = document.activeElement;

    ovKicker.textContent = data.kicker || "DETAILS";
    ovTitle.textContent = data.title || "";
    ovSub.textContent = data.subtitle || "";

    // badges
    ovBadges.innerHTML = "";
    (data.badges || []).forEach((b) => {
      const s = document.createElement("span");
      s.className = "overlay__badge";
      s.textContent = b;
      ovBadges.appendChild(s);
    });

    // links
    ovLinks.innerHTML = "";
    (data.links || []).forEach((l) => {
      const a = document.createElement("a");
      a.className = l.variant || "btn btn--sm";
      a.textContent = l.label;
      a.href = l.href;
      if (l.href?.startsWith("http")) {
        a.target = "_blank";
        a.rel = "noreferrer";
      }
      ovLinks.appendChild(a);
    });

    // media
    const media = data.media || [];
    ovThumbs.innerHTML = "";
    setMainMedia(media[0]);

    media.forEach((m, idx) => {
      const t = document.createElement("button");
      t.type = "button";
      t.className = "ovThumb" + (idx === 0 ? " is-active" : "");
      t.setAttribute("aria-label", `Open media ${idx + 1}`);

      if (m.type === "video") {
        const img = document.createElement("img");
        img.src = m.poster || "assets/video-thumb.jpg";
        img.alt = "Video thumbnail";
        t.appendChild(img);
      } else {
        const img = document.createElement("img");
        img.src = m.src;
        img.alt = m.alt || "";
        t.appendChild(img);
      }

      t.addEventListener("click", () => {
        [...ovThumbs.querySelectorAll(".ovThumb")].forEach((x) =>
          x.classList.remove("is-active"),
        );
        t.classList.add("is-active");
        setMainMedia(m);
      });

      ovThumbs.appendChild(t);
    });

    // content sections
    ovContent.innerHTML = "";
    (data.sections || []).forEach((sec) => {
      const card = document.createElement("div");
      card.className = "ovSection";

      const h = document.createElement("div");
      h.className = "ovSection__t";
      h.textContent = sec.t || "Section";

      card.appendChild(h);

      if (sec.p) {
        const p = document.createElement("p");
        p.className = "ovP";
        p.textContent = sec.p;
        card.appendChild(p);
      }

      if (sec.list && Array.isArray(sec.list)) {
        const ul = document.createElement("ul");
        ul.className = "ovList";
        sec.list.forEach((li) => {
          const x = document.createElement("li");
          x.textContent = li;
          ul.appendChild(x);
        });
        card.appendChild(ul);
      }

      ovContent.appendChild(card);
    });

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeCase() {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  // close actions
  overlay.addEventListener("click", (e) => {
    const t = e.target;
    if (t && t.matches("[data-close]")) closeCase();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("is-open"))
      closeCase();
  });

  // expose open function
  window.openCaseStudy = openCase;
}

setupCaseOverlay();

/* =========================
   HOW TO TRIGGER IT
   Add buttons with data-case="krishirakshak" etc
========================= */
document.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-case]");
  if (!btn) return;
  e.preventDefault();
  window.openCaseStudy(btn.getAttribute("data-case"));
});

/* =========================
   INIT (safe)
   ========================= */
function init() {
  try {
    setYear();
  } catch {}
  try {
    setupLoader();
  } catch {}
  try {
    setupDockHighlight();
  } catch {}
  try {
    setupStamps();
  } catch {}
  try {
    setupTextureToggle();
  } catch {}
  try {
    setupContactForm();
  } catch {}
  try {
    setupCopyEmail();
  } catch {}
  try {
    setupFooterNowShuffle();
  } catch {}
  try {
    setupScrollVelocityMarquee();
  } catch {}
}

init();

document.addEventListener("DOMContentLoaded", () => {
  setupClockOfClocks();
});
