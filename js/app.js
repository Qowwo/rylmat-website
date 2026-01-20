const supportedLangs = ["pl", "en", "de"];
const translationsCache = {};
let currentLang = "pl";

const categories = [
  { id: "automatyka", path: "categories/automatyka.html" },
  { id: "serwis", path: "categories/serwis.html" },
  { id: "czesci", path: "categories/czesci.html" },
  { id: "szkolenia", path: "categories/szkolenia.html" },
  { id: "konsulting", path: "categories/konsulting.html" },
];

const pageId = document.body.dataset.page || "home";
const categoryId = document.body.dataset.category || null;
const basePath = window.location.pathname.includes("/categories/") ? ".." : ".";

async function fetchTranslations(lang) {
  if (translationsCache[lang]) return translationsCache[lang];
  const response = await fetch(`${basePath}/i18n/${lang}.json`);
  if (!response.ok)
    throw new Error(`Nie udało się wczytać tłumaczeń dla ${lang}`);
  const data = await response.json();
  translationsCache[lang] = data;
  return data;
}

function detectInitialLang() {
  const saved = localStorage.getItem("rylmat-lang");
  if (saved && supportedLangs.includes(saved)) return saved;
  const browser = (navigator.language || "pl").slice(0, 2).toLowerCase();
  return supportedLangs.includes(browser) ? browser : "pl";
}

async function setLanguage(lang) {
  if (!supportedLangs.includes(lang)) lang = "pl";
  currentLang = lang;
  localStorage.setItem("rylmat-lang", lang);
  const langData = await fetchTranslations(lang);
  document.documentElement.lang = lang;
  renderShell(langData);
  renderPage(langData);
  attachGlobalHandlers();
}

function renderShell(t) {
  const header = document.getElementById("site-header");
  const footer = document.getElementById("site-footer");

  const navbarLinks = `
    <div class="navbar__group">
      <a class="navbar__link ${pageId === "home" ? "navbar__link--active" : ""}" href="${basePath}/index.html" data-nav="home">${t.nav.home}</a>
      <div class="navbar__dropdown" data-dropdown="categories">
        <button class="navbar__dropdown-toggle" aria-haspopup="true" aria-expanded="false">${t.nav.categories}</button>
        <div class="dropdown-menu">
          ${categories
            .map(
              (cat) => `
                <a class="dropdown-item" href="${basePath}/${cat.path}">
                  ${t.categories.items.find((i) => i.id === cat.id)?.name || cat.id}
                </a>`,
            )
            .join("")}
        </div>
      </div>
      <a class="navbar__link ${pageId === "help" ? "navbar__link--active" : ""}" href="${basePath}/help.html">${t.nav.help}</a>
      <a class="navbar__link ${pageId === "info" ? "navbar__link--active" : ""}" href="${basePath}/info.html">${t.nav.info}</a>
      <a class="navbar__link ${pageId === "terms" ? "navbar__link--active" : ""}" href="${basePath}/terms.html">${t.nav.terms}</a>
      <a class="navbar__link ${pageId === "cookies" ? "navbar__link--active" : ""}" href="${basePath}/cookies.html">${t.nav.cookies}</a>
      <a class="navbar__link ${pageId === "login" ? "navbar__link--active" : ""}" href="${basePath}/login.html">${t.auth.login}</a>
    </div>`;

  header.innerHTML = `
    <nav class="navbar">
      <a class="navbar__brand" href="${basePath}/index.html">
        <img src="${basePath}/assets/2.webp" alt="Rylmat" class="navbar__logo" loading="lazy" decoding="async" />
      </a>
      <button class="hamburger" aria-label="Menu" data-action="toggle-nav">☰</button>
      <div class="navbar__links">${navbarLinks}</div>
      <div class="navbar__actions">
        <select class="lang-select" data-role="lang-select">
          ${supportedLangs
            .map(
              (code) =>
                `<option value="${code}" ${code === currentLang ? "selected" : ""}>${t.langs[code]}</option>`,
            )
            .join("")}
        </select>
        <a class="btn" href="mailto:rylmatkontakt@gmail.com">${t.nav.contact}</a>
      </div>
    </nav>`;

  footer.innerHTML = `
    <div class="footer">
      <div class="footer__grid">
        <div>
          <div class="navbar__brand" style="padding:0;">
            <span style="font-weight:700;">Rylmat</span>
          </div>
          <p class="tagline">${t.footer.tagline}</p>
        </div>
        <div>
          <h4 class="footer__title">${t.footer.links}</h4>
          <ul class="footer__links">
            <li><a href="${basePath}/index.html">${t.nav.home}</a></li>
            <li><a href="${basePath}/help.html">${t.nav.help}</a></li>
            <li><a href="${basePath}/info.html">${t.nav.info}</a></li>
            <li><a href="${basePath}/terms.html">${t.nav.terms}</a></li>
            <li><a href="${basePath}/cookies.html">${t.nav.cookies}</a></li>
          </ul>
        </div>
        <div>
          <h4 class="footer__title">${t.footer.contact}</h4>
          <ul class="footer__links">
            <li>rylmatkontakt@gmail.com</li>
            <li>${t.footer.phone}</li>
            <li>${t.footer.address}</li>
          </ul>
        </div>
      </div>
    </div>`;
}

function renderPage(t) {
  const main = document.getElementById("page-content");
  if (!main) return;

  if (pageId === "home") {
    main.innerHTML = renderHome(t);
  } else if (pageId === "help") {
    main.innerHTML = renderHelp(t);
  } else if (pageId === "info") {
    main.innerHTML = renderInfo(t);
  } else if (pageId === "terms") {
    main.innerHTML = renderTerms(t);
  } else if (pageId === "cookies") {
    main.innerHTML = renderCookies(t);
  } else if (pageId === "login") {
    main.innerHTML = renderLogin(t);
  } else if (pageId === "category") {
    main.innerHTML = renderCategoryPage(t, categoryId);
  }

  attachPageHandlers();
}

function renderHome(t) {
  const categoryCards = t.categories.items
    .map(
      (item) => `
        <a class="card" href="${basePath}/${item.href}">
          <div class="pill">${item.name}</div>
          <h3 class="card__title">${item.title}</h3>
          <p class="card__desc">${item.desc}</p>
        </a>`,
    )
    .join("");

  const highlights = t.highlights.items
    .map(
      (h) => `
        <div class="card">
          <div class="pill">${h.label}</div>
          <h3 class="card__title">${h.title}</h3>
          <p class="card__desc">${h.desc}</p>
        </div>`,
    )
    .join("");

  return `
    <section class="hero">
      <div>
        <span class="hero__eyebrow">${t.hero.eyebrow}</span>
        <h1 class="hero__title">${t.hero.title}</h1>
        <p class="hero__subtitle">${t.hero.subtitle}</p>
        <div class="hero__actions">
          <a class="btn" href="#categories">${t.hero.primaryCta}</a>
          <a class="btn btn--secondary" href="mailto:rylmatkontakt@gmail.com">${t.hero.secondaryCta}</a>
        </div>
        <div class="kpi-strip">
          ${t.hero.kpis.map((kpi) => `<div class="kpi"><strong>${kpi.label}</strong><span>${kpi.value}</span></div>`).join("")}
        </div>
      </div>
      <div class="banner">
        <h3 class="card__title">${t.banner.title}</h3>
        <p class="card__desc">${t.banner.desc}</p>
        <ul class="list">
          ${t.banner.points.map((p) => `<li>${p}</li>`).join("")}
        </ul>
      </div>
    </section>

    <section class="section" id="categories">
      <div class="section__header">
        <div>
          <h2 class="section__title">${t.categories.title}</h2>
          <p class="section__subtitle">${t.categories.subtitle}</p>
        </div>
        <a class="btn btn--secondary" href="mailto:rylmatkontakt@gmail.com">${t.categories.cta}</a>
      </div>
      <div class="grid grid--3" style="margin-top:18px;">
        ${categoryCards}
      </div>
    </section>

    <section class="section">
      <div class="section__header">
        <div>
          <h2 class="section__title">${t.highlights.title}</h2>
          <p class="section__subtitle">${t.highlights.subtitle}</p>
        </div>
      </div>
      <div class="grid grid--3" style="margin-top:18px;">
        ${highlights}
      </div>
    </section>
  `;
}

function renderHelp(t) {
  return `
    <section class="section">
      <h1 class="section__title">${t.help.title}</h1>
      <div class="banner" style="margin-top:18px;">
        <p class="card__desc">${t.help.contact}</p>
        <div class="hero__actions" style="margin-top:10px;">
          <a class="btn" href="mailto:rylmatkontakt@gmail.com">${t.nav.contact}</a>
          <a class="btn btn--secondary" href="tel:+48573400262">${t.help.phoneCta}</a>
        </div>
      </div>
      <div class="section" style="margin-top:24px;">
        <h2 class="section__title">${t.help.faqTitle}</h2>
        <div class="faq">
          ${t.help.faq
            .map(
              (item, idx) => `
                <div class="faq__item" data-faq-index="${idx}">
                  <button class="faq__question">${item.q}</button>
                  <div class="faq__answer">${item.a}</div>
                </div>`,
            )
            .join("")}
        </div>
      </div>
    </section>
  `;
}

function renderInfo(t) {
  return `
    <section class="section">
      <h1 class="section__title">${t.info.title}</h1>
      <p class="section__subtitle">${t.info.desc}</p>
      <div class="grid grid--3" style="margin-top:18px;">
        ${t.info.blocks
          .map(
            (b) => `
              <div class="card">
                <div class="pill">${b.label}</div>
                <h3 class="card__title">${b.title}</h3>
                <p class="card__desc">${b.body}</p>
              </div>`,
          )
          .join("")}
      </div>
      <div class="banner" style="margin-top:24px;">
        <h3 class="card__title">${t.info.ctaTitle}</h3>
        <p class="card__desc">${t.info.ctaBody}</p>
        <div class="hero__actions" style="margin-top:10px;">
          <a class="btn" href="mailto:rylmatkontakt@gmail.com">${t.info.ctaPrimary}</a>
          <a class="btn btn--secondary" href="${basePath}/help.html">${t.info.ctaSecondary}</a>
        </div>
      </div>
    </section>
  `;
}

function renderTerms(t) {
  return `
    <section class="section">
      <h1 class="section__title">${t.terms.title}</h1>
      <p class="section__subtitle">${t.terms.desc}</p>
      <div class="grid" style="margin-top:18px; gap:14px;">
        ${t.terms.sections
          .map(
            (s) => `
              <div class="card">
                <h3 class="card__title">${s.title}</h3>
                <p class="card__desc">${s.body}</p>
              </div>`,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderCookies(t) {
  return `
    <section class="section">
      <h1 class="section__title">${t.cookies.title}</h1>
      <p class="section__subtitle">${t.cookies.desc}</p>
      <div class="card" style="margin-top:16px;">
        <p class="card__desc">${t.cookies.body}</p>
        <ul class="list">
          ${t.cookies.list.map((item) => `<li>${item}</li>`).join("")}
        </ul>
      </div>
      <div class="banner" style="margin-top:18px;">
        <h3 class="card__title">${t.cookies.manageTitle}</h3>
        <div class="hero__actions" style="margin-top:8px;">
          <button class="btn" data-action="cookie-accept">${t.cookies.accept}</button>
          <button class="btn btn--secondary" data-action="cookie-reject">${t.cookies.reject}</button>
        </div>
      </div>
    </section>
  `;
}

function renderCategoryPage(t, id) {
  const data = t.categoryPages[id];
  return `
    <section class="section">
      <div class="pill">${t.nav.categories}</div>
      <h1 class="section__title">${data.title}</h1>
      <p class="section__subtitle">${data.subtitle}</p>
      <div class="grid grid--3" style="margin-top:18px;">
        ${data.offers
          .map(
            (offer) => `
              <div class="card">
                <h3 class="card__title">${offer.title}</h3>
                <p class="card__desc">${offer.desc}</p>
              </div>`,
          )
          .join("")}
      </div>
      <div class="banner" style="margin-top:24px;">
        <h3 class="card__title">${data.ctaTitle}</h3>
        <p class="card__desc">${data.ctaDesc}</p>
        <div class="hero__actions" style="margin-top:10px;">
          <a class="btn" href="mailto:rylmatkontakt@gmail.com">${t.nav.contact}</a>
          <a class="btn btn--secondary" href="${basePath}/help.html">${t.helpLink}</a>
        </div>
      </div>
    </section>
  `;
}

function renderLogin(t) {
  const mode =
    new URLSearchParams(window.location.search).get("mode") || "login";

  if (mode === "register") {
    return `
      <section class="section" style="max-width:420px;margin:60px auto;">
        <div class="pill">${t.auth.register}</div>
        <h1 class="section__title">${t.auth.register}</h1>
        <form id="auth-form" class="card" style="margin-top:24px;">
          <input type="email" id="email" placeholder="${t.auth.email}" required style="width:100%;padding:12px;margin-bottom:12px;border:1px solid #ddd;border-radius:6px;">
          <input type="password" id="password" placeholder="${t.auth.password}" required style="width:100%;padding:12px;margin-bottom:12px;border:1px solid #ddd;border-radius:6px;">
          <input type="password" id="confirmPassword" placeholder="${t.auth.confirmPassword}" required style="width:100%;padding:12px;margin-bottom:18px;border:1px solid #ddd;border-radius:6px;">
          <button type="submit" class="btn" style="width:100%;">${t.auth.registerBtn}</button>
          <p style="margin-top:12px;text-align:center;font-size:14px;">${t.auth.hasAccount} <a href="${basePath}/login.html?mode=login" style="color:var(--accent);">${t.auth.loginLink}</a></p>
        </form>
        <div id="auth-message" style="margin-top:12px;text-align:center;"></div>
      </section>`;
  }

  return `
    <section class="section" style="max-width:420px;margin:60px auto;">
      <div class="pill">${t.auth.login}</div>
      <h1 class="section__title">${t.auth.login}</h1>
      <form id="auth-form" class="card" style="margin-top:24px;">
        <input type="email" id="email" placeholder="${t.auth.email}" required style="width:100%;padding:12px;margin-bottom:12px;border:1px solid #ddd;border-radius:6px;">
        <input type="password" id="password" placeholder="${t.auth.password}" required style="width:100%;padding:12px;margin-bottom:18px;border:1px solid #ddd;border-radius:6px;">
        <button type="submit" class="btn" style="width:100%;">${t.auth.loginBtn}</button>
        <p style="margin-top:12px;text-align:center;font-size:14px;">${t.auth.noAccount} <a href="${basePath}/login.html?mode=register" style="color:var(--accent);">${t.auth.registerLink}</a></p>
      </form>
      <div id="auth-message" style="margin-top:12px;text-align:center;"></div>
    </section>`;
}

function attachGlobalHandlers() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  const hamburger = navbar.querySelector('[data-action="toggle-nav"]');
  const langSelect = navbar.querySelector('[data-role="lang-select"]');
  const dropdown = navbar.querySelector('[data-dropdown="categories"]');

  hamburger?.addEventListener("click", () => {
    navbar.classList.toggle("is-open");
  });

  langSelect?.addEventListener("change", (e) => {
    const lang = e.target.value;
    setLanguage(lang);
  });

  dropdown?.addEventListener("mouseenter", () =>
    dropdown.classList.add("is-open"),
  );
  dropdown?.addEventListener("mouseleave", () =>
    dropdown.classList.remove("is-open"),
  );
}

function attachPageHandlers() {
  document.querySelectorAll(".faq__question").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.parentElement.classList.toggle("is-open");
    });
  });

  const authForm = document.getElementById("auth-form");
  if (authForm) {
    authForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const mode =
        new URLSearchParams(window.location.search).get("mode") || "login";
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      const msgEl = document.getElementById("auth-message");

      if (mode === "register") {
        const confirmPassword =
          document.getElementById("confirmPassword").value;
        if (password !== confirmPassword) {
          msgEl.textContent = translations.auth.error;
          msgEl.style.color = "red";
          return;
        }
      }

      try {
        const res = await fetch(`http://localhost:3000/api/${mode}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();

        if (res.ok) {
          if (mode === "login") {
            localStorage.setItem("token", data.token);
            msgEl.textContent = translations.auth.loginSuccess;
            msgEl.style.color = "green";
            setTimeout(
              () => (window.location.href = `${basePath}/index.html`),
              1500,
            );
          } else {
            msgEl.textContent = translations.auth.registerSuccess;
            msgEl.style.color = "green";
            setTimeout(
              () =>
                (window.location.href = `${basePath}/login.html?mode=login`),
              1500,
            );
          }
        } else {
          msgEl.textContent = data.error || translations.auth.error;
          msgEl.style.color = "red";
        }
      } catch (err) {
        msgEl.textContent = translations.auth.error;
        msgEl.style.color = "red";
      }
    });
  }
}

async function bootstrap() {
  const initialLang = detectInitialLang();
  try {
    await setLanguage(initialLang);
  } catch (err) {
    console.error(err);
    if (initialLang !== "pl") {
      await setLanguage("pl");
    }
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);
