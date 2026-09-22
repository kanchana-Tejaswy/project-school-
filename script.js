 document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  const $ = (selector, parent = document) =>
    parent.querySelector(selector);

  const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

  const body = document.body;

  const progressBar = $(".reading-progress");

  function updateReadingProgress() {
    if (!progressBar) return;

    const scrollTop = window.scrollY;
    const documentHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const progress =
      documentHeight > 0
        ? (scrollTop / documentHeight) * 100
        : 0;

    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }

  window.addEventListener("scroll", updateReadingProgress, {
    passive: true
  });

  updateReadingProgress();

  const menuToggle = $(".menu-toggle");
  const mobileMenu = $(".mobile-menu");

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.toggle("active");

      menuToggle.classList.toggle("active", isOpen);
      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      body.classList.toggle("menu-open", isOpen);
    });

    $$(".mobile-menu a").forEach(link => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        body.classList.remove("menu-open");
      });
    });
  }

  const themeToggle =
    $(".theme-toggle") ||
    $("[data-theme-toggle]") ||
    $(".dark-toggle");

  const savedTheme = localStorage.getItem("luma-theme");

  if (savedTheme === "dark") {
    body.classList.add("dark-mode");
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      body.classList.toggle("dark-mode");

      const isDark = body.classList.contains("dark-mode");

      localStorage.setItem(
        "luma-theme",
        isDark ? "dark" : "light"
      );

      showToast(
        isDark
          ? "Dark mode enabled"
          : "Light mode enabled"
      );
    });
  }

  const searchModal = $(".search-modal");
  const searchInput = $(".search-input");
  const searchResults = $(".search-results");

  const searchButtons = $$(
    ".search-trigger, [data-search], .search-btn"
  );

  const searchCloseButtons = $$(
    ".search-close, [data-search-close]"
  );

  function openSearch() {
    if (!searchModal) return;

    searchModal.classList.add("active");
    body.classList.add("modal-open");

    setTimeout(() => {
      searchInput?.focus();
    }, 100);
  }

  function closeSearch() {
    if (!searchModal) return;

    searchModal.classList.remove("active");
    body.classList.remove("modal-open");
  }

  searchButtons.forEach(button => {
    button.addEventListener("click", openSearch);
  });

  searchCloseButtons.forEach(button => {
    button.addEventListener("click", closeSearch);
  });

  if (searchModal) {
    searchModal.addEventListener("click", event => {
      if (event.target === searchModal) {
        closeSearch();
      }
    });
  }

  document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
      closeSearch();
    }

    if (
      (event.ctrlKey || event.metaKey) &&
      event.key.toLowerCase() === "k"
    ) {
      event.preventDefault();
      openSearch();
    }
  });

  const articles = [
    {
      title: "The Art of Paying Attention",
      category: "Mind",
      description:
        "Why attention has become one of the most valuable resources of the modern world.",
      tags: ["attention", "mind", "focus"]
    },
    {
      title: "Designing a Slower Internet",
      category: "Culture",
      description:
        "Exploring what digital spaces could feel like when they are designed around people.",
      tags: ["internet", "design", "culture"]
    },
    {
      title: "The Quiet Power of Good Questions",
      category: "Ideas",
      description:
        "Better questions can completely change how we learn, build and understand.",
      tags: ["questions", "learning", "ideas"]
    },
    {
      title: "Notes From a Digital Garden",
      category: "Technology",
      description:
        "A collection of thoughts about creativity, technology and building things slowly.",
      tags: ["technology", "digital", "creativity"]
    },
    {
      title: "Why We Still Need Long-Form Thinking",
      category: "Mind",
      description:
        "In a world optimized for speed, depth has quietly become a superpower.",
      tags: ["thinking", "focus", "mind"]
    },
    {
      title: "The New Shape of Creativity",
      category: "Ideas",
      description:
        "How tools are changing creative work without replacing the human imagination.",
      tags: ["creativity", "ideas", "future"]
    }
  ];

  function performSearch(query) {
    if (!searchResults) return;

    const value = query.trim().toLowerCase();

    if (!value) {
      searchResults.innerHTML = `
        <div class="search-empty">
          <span>⌕</span>
          <p>Search stories, ideas and topics.</p>
        </div>
      `;
      return;
    }

    const results = articles.filter(article => {
      const searchableText = [
        article.title,
        article.category,
        article.description,
        ...article.tags
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(value);
    });

    if (!results.length) {
      searchResults.innerHTML = `
        <div class="search-empty">
          <span>○</span>
          <p>No stories found for “${escapeHTML(value)}”.</p>
        </div>
      `;
      return;
    }

    searchResults.innerHTML = results
      .map(
        article => `
          <article class="search-result">
            <div class="search-result-category">
              ${escapeHTML(article.category)}
            </div>
            <h3>${escapeHTML(article.title)}</h3>
            <p>${escapeHTML(article.description)}</p>
          </article>
        `
      )
      .join("");

    $$(".search-result", searchResults).forEach(result => {
      result.addEventListener("click", () => {
        closeSearch();
        showToast("Opening story…");
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", event => {
      performSearch(event.target.value);
    });
  }

  const filterButtons = $$(".filter-btn, [data-filter]");
  const storyCards = $$(".story-card, [data-category-card]");

  filterButtons.forEach(button => {
    button.addEventListener("click", () => {
      const filter =
        button.dataset.filter ||
        button.textContent.trim().toLowerCase();

      filterButtons.forEach(btn =>
        btn.classList.remove("active")
      );

      button.classList.add("active");

      storyCards.forEach(card => {
        const category = (
          card.dataset.category ||
          $(".story-category", card)?.textContent ||
          ""
        )
          .trim()
          .toLowerCase();

        const show =
          filter === "all" ||
          filter === "*" ||
          category === filter;

        card.style.display = show ? "" : "none";
      });
    });
  });

  const revealElements = $$(
    ".reveal, .fade-up, .story-card, .feature-card, .topic-card"
  );

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -50px 0px"
      }
    );

    revealElements.forEach(element =>
      observer.observe(element)
    );
  } else {
    revealElements.forEach(element =>
      element.classList.add("visible")
    );
  }

  const navLinks = $$(
    'a[href^="#"]:not([href="#"])'
  );

  navLinks.forEach(link => {
    link.addEventListener("click", event => {
      const targetId = link.getAttribute("href");
      const target = $(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  const sections = $$("section[id]");

  if ("IntersectionObserver" in window && sections.length) {
    const sectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;

          navLinks.forEach(link => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") ===
                `#${entry.target.id}`
            );
          });
        });
      },
      {
        rootMargin: "-25% 0px -65% 0px",
        threshold: 0
      }
    );

    sections.forEach(section =>
      sectionObserver.observe(section)
    );
  }

  const heroVisual = $(".hero-visual");

  if (heroVisual) {
    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY;

        if (scrollY < window.innerHeight) {
          heroVisual.style.transform =
            `translate3d(0, ${scrollY * 0.08}px, 0)`;
        }
      },
      {
        passive: true
      }
    );
  }

  const newsletterForms = $$(
    ".newsletter-form, form[data-newsletter]"
  );

  newsletterForms.forEach(form => {
    form.addEventListener("submit", event => {
      event.preventDefault();

      const emailInput = $(
        'input[type="email"]',
        form
      );

      const email = emailInput?.value.trim();

      if (!email) {
        showToast("Please enter your email.");
        return;
      }

      if (!isValidEmail(email)) {
        showToast("Please enter a valid email.");
        return;
      }

      showToast("You're on the list. Welcome to Luma.");

      form.reset();
    });
  });

  const clickableCards = $$(
    ".story-card, .feature-card, .topic-card"
  );

  clickableCards.forEach(card => {
    card.addEventListener("click", event => {
      if (
        event.target.closest("a") ||
        event.target.closest("button")
      ) {
        return;
      }

      card.classList.add("card-clicked");

      setTimeout(() => {
        card.classList.remove("card-clicked");
      }, 300);

      showToast("Story selected");
    });
  });

  const backToTop = $(
    ".back-to-top, [data-back-to-top]"
  );

  if (backToTop) {
    window.addEventListener(
      "scroll",
      () => {
        backToTop.classList.toggle(
          "visible",
          window.scrollY > 600
        );
      },
      {
        passive: true
      }
    );

    backToTop.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  const yearElements = $$("[data-year]");

  yearElements.forEach(element => {
    element.textContent = new Date().getFullYear();
  });

  function showToast(message) {
    let toast = $(".luma-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "luma-toast";

      Object.assign(toast.style, {
        position: "fixed",
        left: "50%",
        bottom: "28px",
        transform: "translate(-50%, 20px)",
        padding: "12px 18px",
        borderRadius: "999px",
        background: "#111",
        color: "#fff",
        fontSize: "13px",
        fontWeight: "600",
        letterSpacing: "0.01em",
        opacity: "0",
        pointerEvents: "none",
        zIndex: "9999",
        transition:
          "opacity .25s ease, transform .25s ease",
        boxShadow:
          "0 12px 40px rgba(0,0,0,.18)"
      });

      body.appendChild(toast);
    }

    toast.textContent = message;

    clearTimeout(toast._timeout);

    requestAnimationFrame(() => {
      toast.style.opacity = "1";
      toast.style.transform =
        "translate(-50%, 0)";
    });

    toast._timeout = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform =
        "translate(-50%, 20px)";
    }, 2400);
  }

  function escapeHTML(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
