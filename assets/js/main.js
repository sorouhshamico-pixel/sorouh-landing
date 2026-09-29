/* ==========================================================================
   Sorouh Alshami — Interaction layer
   Vanilla JS, no dependencies, ~0 render-blocking cost (deferred).

   Modules
   01  Environment helpers
   02  Header scroll state
   03  Mobile drawer
   04  Scroll reveal
   05  3D card tilt + pointer glow
   06  Hero parallax
   07  Animated counters + meters
   08  FAQ accordion
   09  Active nav highlighting
    10  Floating buttons (WhatsApp / to top)
    11  Reading progress bar
    12  Magnetic buttons
    13  Hero line reveal
    14  Article rhythm + active table of contents
   15  Gold rule draw-in
   ========================================================================== */

(function () {
  "use strict";

  /* ======================================================================
     01  ENVIRONMENT HELPERS
     ====================================================================== */
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)");

  const $ = (selector, scope) => (scope || document).querySelector(selector);
  const $$ = (selector, scope) =>
    Array.prototype.slice.call((scope || document).querySelectorAll(selector));

  /* rAF-throttled callback: guarantees one execution per frame */
  function rafThrottle(fn) {
    let queued = false;
    let lastArgs = null;

    return function () {
      lastArgs = arguments;
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(function () {
        queued = false;
        fn.apply(null, lastArgs);
      });
    };
  }

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

  /* ======================================================================
     02  HEADER SCROLL STATE
     ====================================================================== */
  function initHeader() {
    const header = $(".site-header");
    if (!header) return;

    const toTop = $(".to-top");
    const fab = $(".fab");

    const onScroll = rafThrottle(function () {
      const y = window.scrollY;
      header.classList.toggle("is-scrolled", y > 24);

      if (toTop) toTop.classList.toggle("is-visible", y > 700);
      if (fab) fab.classList.toggle("is-visible", y > 520);
    });

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ======================================================================
     03  MOBILE DRAWER
     ====================================================================== */
  function initDrawer() {
    const burger = $(".burger");
    const drawer = $(".drawer");
    if (!burger || !drawer) return;

    const FOCUSABLE =
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

    /* The button announces its own action, so the label has to follow the
       state — otherwise a screen reader still says "open" while it is open. */
    const labelClosed = burger.getAttribute("aria-label") || "";
    const labelOpen = "إغلاق قائمة التنقل";

    function open() {
      drawer.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", labelOpen);
      drawer.removeAttribute("aria-hidden");
      document.documentElement.classList.add("is-locked");
      const first = $(FOCUSABLE, drawer);
      if (first) first.focus();
    }

    function close(returnFocus) {
      drawer.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", labelClosed);
      drawer.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("is-locked");
      if (returnFocus) burger.focus();
    }

    burger.addEventListener("click", function () {
      const isOpen = burger.getAttribute("aria-expanded") === "true";
      if (isOpen) {
        close(false);
      } else {
        open();
      }
    });

    /* Any navigation inside the drawer closes it */
    $$("a, .btn", drawer).forEach(function (link) {
      link.addEventListener("click", function () {
        close(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (burger.getAttribute("aria-expanded") !== "true") return;

      if (event.key === "Escape") {
        close(true);
        return;
      }

      /* Keep Tab focus inside the open drawer */
      if (event.key === "Tab") {
        const items = $$(FOCUSABLE, drawer);
        if (!items.length) return;

        const first = items[0];
        const last = items[items.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });

    /* Close automatically if the viewport grows past the mobile breakpoint */
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onChange = function (event) {
      if (event.matches) close(false);
    };
    if (desktop.addEventListener) {
      desktop.addEventListener("change", onChange);
    } else if (desktop.addListener) {
      desktop.addListener(onChange);
    }
  }

  /* ======================================================================
     04  SCROLL REVEAL
     ====================================================================== */
  function initReveal() {
    const items = $$("[data-reveal]");
    if (!items.length) return;

    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-revealed");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ======================================================================
     05  3D CARD TILT + POINTER GLOW
     Reads pointer position, writes CSS custom properties.
     All visual response is handled by CSS transforms (GPU accelerated).
     ====================================================================== */
  function initTilt() {
    const cards = $$("[data-tilt]");

    if (!hasFinePointer.matches || prefersReducedMotion.matches) {
      /* Touch / reduced-motion: reveal the gold glow on focus only */
      return;
    }

    const MAX_TILT = 7; /* degrees */

    cards.forEach(function (lift) {
      const card = $(".lift__card", lift) || lift;
      const glow = $(".card__glow", lift);

      const onMove = rafThrottle(function (event) {
        const rect = lift.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        /* Normalised pointer position: 0 → 1 on both axes */
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;

        /* Tilt away from centre, clamped */
        const ry = clamp((px - 0.5) * MAX_TILT * 2, -MAX_TILT, MAX_TILT);
        const rx = clamp((0.5 - py) * MAX_TILT * 2, -MAX_TILT, MAX_TILT);

        card.style.setProperty("--rx", rx.toFixed(2) + "deg");
        card.style.setProperty("--ry", ry.toFixed(2) + "deg");

        if (glow) {
          glow.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
          glow.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        }
      });

      lift.addEventListener("pointermove", onMove);
      lift.addEventListener("pointerenter", function () {
        lift.classList.add("is-tilting");
      });

      lift.addEventListener("pointerleave", function () {
        lift.classList.remove("is-tilting");
        card.style.setProperty("--rx", "0deg");
        card.style.setProperty("--ry", "0deg");
        if (glow) {
          glow.style.setProperty("--mx", "50%");
          glow.style.setProperty("--my", "0%");
        }
      });
    });
  }

  /* ======================================================================
     06  HERO PARALLAX
     Vertical only — keeps the effect identical in both LTR and RTL.
     ====================================================================== */
  function initParallax() {
    const stage = $("[data-parallax]");
    if (!stage || prefersReducedMotion.matches) return;

    let heroVisible = true;

    const update = rafThrottle(function () {
      if (!heroVisible) return;
      const rect = stage.getBoundingClientRect();
      const progress = (rect.top + rect.height / 2) / window.innerHeight;
      const offset = clamp((0.5 - progress) * 90, -45, 45);
      stage.style.setProperty("--py", offset.toFixed(1) + "px");
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
      }).observe(stage);
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ======================================================================
     07  ANIMATED COUNTERS + METERS
     ====================================================================== */
  function initCounters() {
    const counters = $$("[data-count]");
    if (!counters.length) return;

    const run = function (el) {
      const target = parseFloat(el.getAttribute("data-count"));
      const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      const duration = parseInt(el.getAttribute("data-duration") || "1600", 10);
      const prefix = el.getAttribute("data-prefix") || "";
      const suffix = el.getAttribute("data-suffix") || "";

      const render = function (value) {
        el.textContent = prefix + value.toFixed(decimals) + suffix;
      };

      if (prefersReducedMotion.matches) {
        render(target);
        return;
      }

      const start = performance.now();

      const step = function (now) {
        const t = clamp((now - start) / duration, 0, 1);
        render(target * easeOutExpo(t));
        if (t < 1) window.requestAnimationFrame(step);
        else render(target);
      };

      window.requestAnimationFrame(step);
    };

    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* Meters share the same trigger as the counters */
  function initMeters() {
    const meters = $$("[data-meter]");
    if (!meters.length) return;

    const fill = function (meter) {
      const value = meter.getAttribute("data-meter");
      const bar = $("i", meter);
      if (bar) {
        /* Next frame so the transition actually runs */
        window.requestAnimationFrame(function () {
          bar.style.setProperty("--fill", value + "%");
        });
      }
    };

    if (!("IntersectionObserver" in window)) {
      meters.forEach(fill);
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          fill(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );

    meters.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ======================================================================
     08  FAQ ACCORDION
     Single-open behaviour, fully keyboard operable.
     ====================================================================== */
  function initAccordion() {
    const groups = $$("[data-accordion]");
    if (!groups.length) return;

    groups.forEach(function (group) {
      const items = $$(".accordion__item", group);

      items.forEach(function (item) {
        const trigger = $(".accordion__trigger", item);
        const panel = $(".accordion__panel", item);
        if (!trigger || !panel) return;

        trigger.addEventListener("click", function () {
          const isOpen = item.classList.contains("is-open");

          /* Close siblings */
          items.forEach(function (other) {
            other.classList.remove("is-open");
            const otherTrigger = $(".accordion__trigger", other);
            if (otherTrigger) otherTrigger.setAttribute("aria-expanded", "false");
          });

          /* Toggle current */
          item.classList.toggle("is-open", !isOpen);
          trigger.setAttribute("aria-expanded", String(!isOpen));
        });
      });
    });
  }

  /* ======================================================================
     09  ACTIVE NAV HIGHLIGHTING
     ====================================================================== */
  function initScrollSpy() {
    const links = $$("[data-spy]");
    if (!links.length || !("IntersectionObserver" in window)) return;

    const map = {};
    links.forEach(function (link) {
      map[link.getAttribute("href")] = link;
    });

    const sections = $$("section[id]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          const link = map["#" + entry.target.id];
          if (!link) return;

          if (entry.isIntersecting) {
            links.forEach(function (l) {
              l.removeAttribute("aria-current");
            });
            link.setAttribute("aria-current", "true");
          }
        });
      },
      /* A band near the top of the viewport marks the "current" section */
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ======================================================================
     10  FLOATING BUTTONS
     ====================================================================== */
  function initFloatingButtons() {
    const toTop = $(".to-top");
    if (!toTop) return;

    toTop.addEventListener("click", function () {
      window.scrollTo({
        top: 0,
        behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      });
    });

    /* Send a prefilled WhatsApp message from any [data-wa] element */
    $$("[data-wa]").forEach(function (el) {
      el.addEventListener("click", function (event) {
        const number = el.getAttribute("data-wa");
        const message =
          el.getAttribute("data-wa-msg") ||
          "مرحباً، أرغب في الاستفسار عن خدمات خرسانة جاهزة ومقاولات عامة في الرياض.";

        if (!number) return; /* no number configured yet — let the link behave normally */

        event.preventDefault();
        const url =
          "https://wa.me/" +
          number.replace(/\D/g, "") +
          "?text=" +
          encodeURIComponent(message);

        window.open(url, "_blank", "noopener,noreferrer");
      });
    });
  }

/* Modules 11-14: reading progress, magnetic buttons, hero line reveal,
   article rhythm + active table of contents.
   Appended to main.js before the boot() call. No Arabic strings, so the
   file stays pure ASCII apart from the pre-existing WhatsApp message. */

  /* ======================================================================
     11  READING PROGRESS
     The bar is created here rather than in the HTML because it cannot work
     without JS — no dead markup, and no cost when scripting is off.
     ====================================================================== */
  function initReadProgress() {
    const bar = document.createElement("div");
    bar.className = "read-progress";
    bar.setAttribute("aria-hidden", "true");
    document.body.appendChild(bar);

    const onScroll = rafThrottle(function () {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? clamp(window.scrollY / max, 0, 1) : 0;
      bar.style.setProperty("--p", p.toFixed(4));
    });

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  /* ======================================================================
     12  MAGNETIC BUTTONS
     Writes --magx/--magy, which .btn turns into the independent `translate`
     property so the existing hover transform keeps working.
     ====================================================================== */
  function initMagnetic() {
    if (!hasFinePointer.matches || prefersReducedMotion.matches) return;

    const PULL = 7; /* px */
    const RANGE = 1.35; /* how far outside the button the pull still acts */

    $$(".btn").forEach(function (btn) {
      const onMove = rafThrottle(function (event) {
        const rect = btn.getBoundingClientRect();
        if (!rect.width || !rect.height) return;

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        /* Distance outside the button, normalised against its own size */
        const dx = clamp((event.clientX - cx) / (rect.width * RANGE), -1, 1);
        const dy = clamp((event.clientY - cy) / (rect.height * RANGE), -1, 1);

        btn.style.setProperty("--magx", (dx * PULL).toFixed(2) + "px");
        btn.style.setProperty("--magy", (dy * PULL * 0.6).toFixed(2) + "px");
      });

      btn.addEventListener("pointermove", onMove);
      btn.addEventListener("pointerleave", function () {
        btn.style.setProperty("--magx", "0px");
        btn.style.setProperty("--magy", "0px");
      });
      btn.addEventListener("blur", function () {
        btn.style.setProperty("--magx", "0px");
        btn.style.setProperty("--magy", "0px");
      });
    });
  }

  /* ======================================================================
     13  HERO LINE REVEAL
     Wraps each headline line in .hero__line so the CSS mask has something
     to move, then staggers the lines. The h1 must not also carry
     data-reveal, or the two motions would fight.
     ====================================================================== */
  function initLineReveal() {
    const title = $(".hero__title");
    if (!title) return;

    const lines = $$(":scope > span", title);
    if (!lines.length) return;

    title.removeAttribute("data-reveal");

    if (prefersReducedMotion.matches) return;

    lines.forEach(function (line) {
      const inner = document.createElement("span");
      inner.className = "hero__line";
      while (line.firstChild) inner.appendChild(line.firstChild);
      line.appendChild(inner);
    });

    title.classList.add("is-line-anim");

    /* Two frames: one to commit the hidden state, one to release it */
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        title.classList.add("is-lines-in");
      });
    });
  }

  /* ======================================================================
     14  ARTICLE RHYTHM + ACTIVE TABLE OF CONTENTS
     The article pages ship with no data-reveal attributes, so nothing on
     them used to move. Rather than editing six HTML files, JS marks the
     structural pieces itself and reuses the existing reveal observer.
     ====================================================================== */
  const ARTICLE_BEATS = [
    ".prose > h2",
    ".prose > .figure",
    ".prose > .callout",
    ".prose > .takeaways",
    ".prose > blockquote",
    ".prose > .table-scroll",
    ".author",
    ".related",
    ".article-cta",
  ].join(", ");

  function initArticleMotion() {
    const beats = $$(ARTICLE_BEATS);
    if (!beats.length) return;

    const show = function (el) {
      el.classList.add("is-revealed");
    };

    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      beats.forEach(show);
    } else {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            show(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
      );

      beats.forEach(function (el) {
        el.setAttribute("data-reveal", "");
        observer.observe(el);
      });
    }

    initTocSpy();
  }

  /* Highlights the table-of-contents entry for the section being read */
  function initTocSpy() {
    const links = $$(".rail ol a");
    if (!links.length || !("IntersectionObserver" in window)) return;

    const map = {};
    links.forEach(function (link) {
      const id = (link.getAttribute("href") || "").slice(1);
      if (id) map[id] = link;
    });

    const heads = $$(".prose h2[id]").filter(function (h) {
      return map[h.id];
    });
    if (!heads.length) return;

    const setCurrent = function (id) {
      links.forEach(function (link) {
        link.classList.toggle("is-current", link.getAttribute("href") === "#" + id);
      });
    };

    const observer = new IntersectionObserver(
      function (entries) {
        /* Pick the topmost heading currently inside the reading band */
        const visible = entries
          .filter(function (e) {
            return e.isIntersecting;
          })
          .sort(function (a, b) {
            return a.target.offsetTop - b.target.offsetTop;
          });
        if (visible.length) setCurrent(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    heads.forEach(function (head) {
      observer.observe(head);
    });

    setCurrent(heads[0].id);
  }

  /* ======================================================================
     15  GOLD RULE DRAW-IN
     The eight .rule dividers scale in from their inline-start edge as their
     section arrives. .is-drawn is always added, including under
     prefers-reduced-motion — the CSS transition is what gets shortened, not
     the class, so the rule is never left at scaleX(0).
     ====================================================================== */
  function initRuleDraw() {
    const rules = $$(".rule");
    if (!rules.length) return;

    if (!("IntersectionObserver" in window)) {
      rules.forEach(function (rule) {
        rule.classList.add("is-drawn");
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-drawn");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.6 }
    );

    rules.forEach(function (rule) {
      observer.observe(rule);
    });
  }

  /* ======================================================================
     BOOT
     ====================================================================== */
  function boot() {
    initHeader();
    initDrawer();
    initReveal();
    initTilt();
    initParallax();
    initCounters();
    initMeters();
    initAccordion();
    initScrollSpy();
    initFloatingButtons();
    initReadProgress();
    initMagnetic();
    initLineReveal();
    initArticleMotion();
    initRuleDraw();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
