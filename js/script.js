/**
 * badminton-pro — static landing
 * Modules: theme · navbar scroll · reveal (staggered) · smooth anchor · contact demo
 *          gallery filter · mobile nav · typed text · counter · active nav ·
 *          scroll-progress · lightbox · back-to-top
 */
document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;

  /* ─────────────────────────────────────────
     Inject dynamic UI elements into DOM
  ───────────────────────────────────────── */
  // Scroll progress bar
  const progressBar = document.createElement("div");
  progressBar.className = "scroll-progress";
  progressBar.setAttribute("role", "progressbar");
  progressBar.setAttribute("aria-label", "Tiến trình đọc trang");
  document.body.prepend(progressBar);

  // Back-to-top button
  const backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.setAttribute("aria-label", "Lên đầu trang");
  backToTop.innerHTML = '<i class="fas fa-arrow-up" aria-hidden="true"></i>';
  document.body.appendChild(backToTop);

  /* ─────────────────────────────────────────
     Theme (light / dark + localStorage)
  ───────────────────────────────────────── */
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    const icon = themeToggle.querySelector("i");
    const savedTheme = localStorage.getItem("theme") || "light";
    body.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);

    themeToggle.addEventListener("click", () => {
      const next = body.getAttribute("data-theme") === "light" ? "dark" : "light";
      body.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      updateThemeIcon(next);
    });

    function updateThemeIcon(theme) {
      if (!icon) return;
      icon.classList.toggle("fa-moon", theme !== "dark");
      icon.classList.toggle("fa-sun", theme === "dark");
    }
  }

  /* ─────────────────────────────────────────
     Scroll: progress bar + navbar + back-to-top
  ───────────────────────────────────────── */
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + "%";
    if (navbar) navbar.classList.toggle("scrolled", scrollTop > 50);
    backToTop.classList.toggle("visible", scrollTop > 400);
  }, { passive: true });

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ─────────────────────────────────────────
     Typed text — hero subtitle
  ───────────────────────────────────────── */
  const heroSubtitle = document.querySelector(".hero-subtitle");
  if (heroSubtitle) {
    const phrases = [
      "Professional Badminton Coach",
      "BWF Level 1 Certified",
      "10+ Năm Kinh Nghiệm",
      "200+ Học Viên",
    ];
    let phraseIndex = 0, charIndex = 0, isDeleting = false;

    const cursor = document.createElement("span");
    cursor.className = "typed-cursor";
    heroSubtitle.textContent = "";
    heroSubtitle.appendChild(cursor);

    function type() {
      const current = phrases[phraseIndex];
      const displayed = isDeleting
        ? current.substring(0, charIndex - 1)
        : current.substring(0, charIndex + 1);

      heroSubtitle.textContent = displayed;
      heroSubtitle.appendChild(cursor);

      if (!isDeleting) charIndex++;
      else charIndex--;

      let speed = isDeleting ? 50 : 80;
      if (!isDeleting && charIndex === current.length + 1) {
        speed = 2200; isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        speed = 400;
      }
      setTimeout(type, speed);
    }
    setTimeout(type, 800);
  }

  /* ─────────────────────────────────────────
     Counter animation — about stats
  ───────────────────────────────────────── */
  const statEls = document.querySelectorAll(".stat h3");
  let countersStarted = false;

  function animateCounter(el) {
    const raw = el.textContent.trim();
    const suffix = raw.replace(/\d/g, "");
    const target = parseInt(raw, 10);
    const start = performance.now();
    const duration = 1600;

    (function update(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * p);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(update);
    })(start);
  }

  const statsSection = document.querySelector(".about-stats");
  if (statsSection && statEls.length) {
    new IntersectionObserver((entries, obs) => {
      if (entries[0].isIntersecting && !countersStarted) {
        countersStarted = true;
        statEls.forEach(animateCounter);
        obs.disconnect();
      }
    }, { threshold: 0.4 }).observe(statsSection);
  }

  /* ─────────────────────────────────────────
     Active nav link — tracks current section
  ───────────────────────────────────────── */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`)
        );
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 }).forEach
    ? null
    : void 0;

  (() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) =>
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`)
          );
        }
      });
    }, { rootMargin: "-40% 0px -55% 0px", threshold: 0 });
    sections.forEach((s) => obs.observe(s));
  })();

  /* ─────────────────────────────────────────
     Reveal on scroll — staggered for grids
  ───────────────────────────────────────── */
  const revealElements = document.querySelectorAll(".reveal");

  function getStaggerDelay(el) {
    const parent = el.parentElement;
    if (!parent) return 0;
    const siblings = [...parent.children].filter((c) => c.classList.contains("reveal"));
    const idx = siblings.indexOf(el);
    // Only stagger direct siblings in grid containers
    const isGrid = parent.classList.contains("programs-grid") ||
      parent.classList.contains("testimonials-grid") ||
      parent.classList.contains("about-stats") ||
      parent.classList.contains("achievements-grid");
    return isGrid ? idx * 110 : 0;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = getStaggerDelay(entry.target);
          setTimeout(() => {
            entry.target.style.transitionDelay = delay + "ms";
            entry.target.classList.add("active");
            // Remove delay after animation so hover isn't affected
            setTimeout(() => { entry.target.style.transitionDelay = ""; }, 900 + delay);
          }, 100);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
  );
  revealElements.forEach((el) => revealObserver.observe(el));

  /* ─────────────────────────────────────────
     Lightbox — gallery fullscreen viewer
  ───────────────────────────────────────── */
  const lightbox = document.createElement("div");
  lightbox.className = "lightbox-overlay";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "Xem ảnh phóng to");
  lightbox.innerHTML = `
    <button class="lightbox-close" aria-label="Đóng"><i class="fas fa-times"></i></button>
    <button class="lightbox-prev" aria-label="Ảnh trước"><i class="fas fa-chevron-left"></i></button>
    <div class="lightbox-content">
      <img class="lightbox-img" src="" alt="" />
      <div class="lightbox-caption"></div>
    </div>
    <button class="lightbox-next" aria-label="Ảnh tiếp theo"><i class="fas fa-chevron-right"></i></button>
  `;
  document.body.appendChild(lightbox);

  const lbImg = lightbox.querySelector(".lightbox-img");
  const lbCaption = lightbox.querySelector(".lightbox-caption");
  const lbClose = lightbox.querySelector(".lightbox-close");
  const lbPrev = lightbox.querySelector(".lightbox-prev");
  const lbNext = lightbox.querySelector(".lightbox-next");

  let lbImages = [], lbIndex = 0;

  function buildLbImages() {
    lbImages = [...document.querySelectorAll(".gallery-item:not(.hide)")].map((item) => ({
      src: item.querySelector("img")?.src || "",
      alt: item.querySelector("img")?.alt || "",
      caption: item.querySelector(".gallery-overlay span")?.textContent || "",
    }));
  }

  function showLb(index) {
    const d = lbImages[index];
    if (!d) return;
    lbImg.src = d.src;
    lbImg.alt = d.alt;
    lbCaption.textContent = d.caption;
    lbPrev.style.display = lbImages.length <= 1 ? "none" : "";
    lbNext.style.display = lbImages.length <= 1 ? "none" : "";
  }

  function openLb(index) {
    buildLbImages();
    lbIndex = index;
    showLb(lbIndex);
    lightbox.classList.add("active");
    document.body.style.overflow = "hidden";
    lbClose.focus();
  }

  function closeLb() {
    lightbox.classList.remove("active");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".gallery-item").forEach((item) => {
    item.style.cursor = "pointer";
    item.addEventListener("click", () => {
      buildLbImages();
      const visible = [...document.querySelectorAll(".gallery-item:not(.hide)")];
      const idx = visible.indexOf(item);
      if (idx !== -1) openLb(idx);
    });
  });

  lbClose.addEventListener("click", closeLb);
  lightbox.addEventListener("click", (e) => { if (e.target === lightbox) closeLb(); });
  lbPrev.addEventListener("click", () => { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; showLb(lbIndex); });
  lbNext.addEventListener("click", () => { lbIndex = (lbIndex + 1) % lbImages.length; showLb(lbIndex); });

  document.addEventListener("keydown", (e) => {
    if (!lightbox.classList.contains("active")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") { lbIndex = (lbIndex - 1 + lbImages.length) % lbImages.length; showLb(lbIndex); }
    if (e.key === "ArrowRight") { lbIndex = (lbIndex + 1) % lbImages.length; showLb(lbIndex); }
  });

  /* ─────────────────────────────────────────
     Mobile nav hamburger
  ───────────────────────────────────────── */
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  function setMobileNavOpen(open) {
    if (!navMenu || !hamburger) return;
    navMenu.classList.toggle("active", open);
    hamburger.classList.toggle("active", open);
    hamburger.setAttribute("aria-expanded", open ? "true" : "false");
  }

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
      setMobileNavOpen(!navMenu.classList.contains("active"));
    });
  }

  /* ─────────────────────────────────────────
     Smooth scroll anchor + close mobile nav
  ───────────────────────────────────────── */
  const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll(".nav-link, .btn").forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (!href || href === "#" || !href.startsWith("#")) return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: Math.max(0, top), behavior: prefersReduced() ? "auto" : "smooth" });
      }
      setMobileNavOpen(false);
    });
  });

  /* ─────────────────────────────────────────
     Contact form — demo UX feedback
  ───────────────────────────────────────── */
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector("button[type='submit']");
      if (!btn) return;
      const orig = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Đang gửi...';
      setTimeout(() => {
        btn.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i> Gửi thành công!';
        contactForm.reset();
        setTimeout(() => { btn.disabled = false; btn.innerHTML = orig; }, 3000);
      }, 1500);
    });
  }

  /* ─────────────────────────────────────────
     Gallery filter
  ───────────────────────────────────────── */
  const filterButtons = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      button.classList.add("active");
      const filter = button.getAttribute("data-filter");
      galleryItems.forEach((item) => {
        item.style.opacity = "0";
        item.style.transform = "scale(0.9)";
        setTimeout(() => {
          const show = filter === "all" || item.classList.contains(filter);
          item.classList.toggle("hide", !show);
          if (show) setTimeout(() => { item.style.opacity = "1"; item.style.transform = "scale(1)"; }, 50);
        }, 300);
      });
    });
  });

  /* ─────────────────────────────────────────
     FAQ Accordion
  ───────────────────────────────────────── */
  const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach((item) => {
    const btn = item.querySelector(".faq-question");
    if (!btn) return;

    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("faq-open");

      // Close all
      faqItems.forEach((i) => {
        i.classList.remove("faq-open");
        i.querySelector(".faq-question")?.setAttribute("aria-expanded", "false");
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add("faq-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
});
