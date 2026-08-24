(() => {
  const cfg = window.ALQ_CONFIG || {};
  const header = document.querySelector(".site-header");
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".nav-toggle");
  const year = document.querySelector("#year");
  const form = document.querySelector("#contact-form");
  const formStatus = document.querySelector("#form-status");
  const filterButtons = document.querySelectorAll(".filter-btn");
  const projectCards = document.querySelectorAll(".project-card");
  const filterEmpty = document.querySelector("#filter-empty");
  const lightbox = document.querySelector("#lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  const lightboxCaption = document.querySelector("#lightbox-caption");
  const lightboxMeta = document.querySelector("#lightbox-meta");
  const lightboxClose = document.querySelector(".lightbox-close");
  const counters = document.querySelectorAll("[data-count]");
  const progressBar = document.querySelector("#page-progress");
  const navLinks = document.querySelectorAll("[data-nav]");
  const sections = document.querySelectorAll("main section[id]");
  const cookieBanner = document.querySelector("#cookie-banner");
  const cookieAccept = document.querySelector("#cookie-accept");

  const whatsappUrl = (message) => {
    const text = encodeURIComponent(message || cfg.defaultWhatsAppMessage || "");
    const number = cfg.whatsapp || "";
    return `https://wa.me/${number}?text=${text}`;
  };

  const applyContactLinks = () => {
    document.querySelectorAll("[data-whatsapp-link]").forEach((link) => {
      link.href = whatsappUrl(cfg.defaultWhatsAppMessage);
    });

    const heroWa = document.querySelector("#hero-whatsapp");
    if (heroWa) heroWa.href = whatsappUrl(cfg.defaultWhatsAppMessage);

    document.querySelectorAll("[data-email]").forEach((link) => {
      if (cfg.email) {
        link.href = `mailto:${cfg.email}`;
        if (link.childNodes.length === 1 && link.textContent.includes("@")) {
          link.textContent = cfg.email;
        }
      }
    });

    document.querySelectorAll("[data-phone-link]").forEach((link) => {
      if (cfg.phoneTel) link.href = `tel:${cfg.phoneTel}`;
      if (cfg.phoneDisplay) link.textContent = cfg.phoneDisplay;
    });

    document.querySelectorAll("[data-city]").forEach((el) => {
      if (cfg.city) el.textContent = cfg.city;
    });
  };

  applyContactLinks();

  if (year) year.textContent = String(new Date().getFullYear());

  const onScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);

    if (progressBar) {
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      progressBar.style.width = `${pct}%`;
    }

    let current = "";
    sections.forEach((section) => {
      if (window.scrollY >= section.offsetTop - 140) current = section.id;
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute("href") || "";
      link.classList.toggle("is-active", href === `#${current}`);
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    const setMenuOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      nav.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    };

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      setMenuOpen(open);
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenuOpen(false));
    });

    document.addEventListener("click", (event) => {
      if (!document.body.classList.contains("nav-open")) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (nav.contains(target) || toggle.contains(target)) return;
      setMenuOpen(false);
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 1100) setMenuOpen(false);
    });
  }

  const revealTargets = document.querySelectorAll(
    ".section-intro, .about-copy, .service-item, .project-card, .process-steps li, .contact-copy, .contact-form, .testimonial-slider, .accordion-item, .timeline-item, .edu-card, .lang-block"
  );

  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" }
    );

    revealTargets.forEach((el) => revealObserver.observe(el));

    const statsSection = document.querySelector(".about-stats");
    if (statsSection && counters.length) {
      const countObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            counters.forEach((counter) => animateCount(counter));
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.4 }
      );
      countObserver.observe(statsSection);
    }
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
    counters.forEach((counter) => animateCount(counter));
  }

  function animateCount(el) {
    const target = Number(el.getAttribute("data-count") || 0);
    const duration = 1100;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.getAttribute("data-filter");

      filterButtons.forEach((btn) => btn.classList.remove("is-active"));
      button.classList.add("is-active");

      let visible = 0;
      projectCards.forEach((card) => {
        const category = card.getAttribute("data-category");
        const show = filter === "all" || category === filter;
        card.classList.toggle("is-hidden", !show);
        if (show) visible += 1;
      });

      if (filterEmpty) filterEmpty.hidden = visible > 0;
    });
  });

  const openLightbox = (card) => {
    if (!lightbox || !lightboxImage || !lightboxCaption) return;
    const img = card.querySelector("img");
    const title = card.querySelector("h3");
    const desc = card.querySelector(".project-meta p");
    if (!img) return;

    lightboxImage.src = img.src;
    lightboxImage.alt = img.alt || "";
    lightboxCaption.textContent = title ? title.textContent : "";

    if (lightboxMeta) {
      const location = card.getAttribute("data-location") || "";
      const area = card.getAttribute("data-area") || "";
      const bits = [location, area, desc?.textContent].filter(Boolean);
      lightboxMeta.textContent = bits.join(" · ");
    }

    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
    lightboxClose?.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || !lightboxImage) return;
    lightbox.hidden = true;
    lightboxImage.src = "";
    document.body.style.overflow = "";
  };

  projectCards.forEach((card) => {
    card.addEventListener("click", () => openLightbox(card));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(card);
      }
    });
  });

  lightboxClose?.addEventListener("click", closeLightbox);
  lightbox?.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
  });

  // Testimonials slider
  const slider = document.querySelector("[data-slider]");
  if (slider) {
    const slides = [...slider.querySelectorAll(".testimonial")];
    const dotsWrap = slider.querySelector("[data-dots]");
    const prev = slider.querySelector("[data-prev]");
    const next = slider.querySelector("[data-next]");
    let index = 0;
    let timer;

    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "slider-dot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", `Ir para depoimento ${i + 1}`);
      dot.addEventListener("click", () => goTo(i));
      dotsWrap?.appendChild(dot);
    });

    const dots = () => [...(dotsWrap?.querySelectorAll(".slider-dot") || [])];

    const goTo = (i) => {
      index = (i + slides.length) % slides.length;
      slides.forEach((slide, n) => slide.classList.toggle("is-active", n === index));
      dots().forEach((dot, n) => dot.classList.toggle("is-active", n === index));
      restart();
    };

    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => goTo(index + 1), 6000);
    };

    prev?.addEventListener("click", () => goTo(index - 1));
    next?.addEventListener("click", () => goTo(index + 1));
    slider.addEventListener("mouseenter", () => clearInterval(timer));
    slider.addEventListener("mouseleave", restart);
    restart();
  }

  // Contact form → WhatsApp or email
  let submitChannel = "whatsapp";
  form?.querySelectorAll('button[type="submit"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      submitChannel = btn.value || "whatsapp";
    });
  });

  form?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      if (formStatus) formStatus.textContent = "Preencha os campos obrigatórios.";
      return;
    }

    const data = new FormData(form);
    const nome = String(data.get("nome") || "").trim();
    const email = String(data.get("email") || "").trim();
    const telefone = String(data.get("telefone") || "").trim();
    const tipo = String(data.get("tipo") || "").trim();
    const localizacao = String(data.get("localizacao") || "").trim();
    const mensagem = String(data.get("mensagem") || "").trim();

    const body = [
      `Olá ${cfg.owner || cfg.brand || "Alberto"}!`,
      "",
      `Nome: ${nome}`,
      `Email: ${email}`,
      telefone ? `Telefone: ${telefone}` : null,
      `Tipo de projeto: ${tipo}`,
      localizacao ? `Localização: ${localizacao}` : null,
      "",
      "Mensagem:",
      mensagem,
    ]
      .filter((line) => line !== null)
      .join("\n");

    if (submitChannel === "email") {
      const subject = encodeURIComponent(`Pedido de proposta — ${tipo || "Projeto"}`);
      const mailBody = encodeURIComponent(body);
      window.location.href = `mailto:${cfg.email}?subject=${subject}&body=${mailBody}`;
      if (formStatus) {
        formStatus.textContent = "A abrir o seu cliente de email…";
      }
    } else {
      window.open(whatsappUrl(body), "_blank", "noopener,noreferrer");
      if (formStatus) {
        formStatus.textContent = "A abrir o WhatsApp com a sua mensagem…";
      }
    }

    form.reset();
  });

  // Cookie preference
  const cookieKey = "alq_cookie_ok";
  if (cookieBanner) {
    if (!localStorage.getItem(cookieKey)) {
      cookieBanner.hidden = false;
    }
    cookieAccept?.addEventListener("click", () => {
      localStorage.setItem(cookieKey, "1");
      cookieBanner.hidden = true;
    });
  }
})();
