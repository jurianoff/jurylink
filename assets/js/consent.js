/* JuryLink – Consent (GA4) */
(function () {
  const GA_ID = window.GA_MEASUREMENT_ID; // ustawione w <head>
  const KEY = "jl_consent_v1";
  const VALUES = { GRANTED: "granted", DENIED: "denied" };

  // Bez ID nie robimy nic (bezpiecznie)
  if (!GA_ID) return;

  // --- GA loader (ładuje dopiero po zgodzie) ---
  function loadGAOnce() {
    if (window.__jl_ga_loaded) return;
    window.__jl_ga_loaded = true;

    const s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA_ID);
    document.head.appendChild(s);

    s.addEventListener("load", () => {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

      gtag("js", new Date());
      gtag("config", GA_ID);
    });
  }

  function setStored(value) {
    localStorage.setItem(KEY, value);
  }

  function getStored() {
    return localStorage.getItem(KEY);
  }

  function applyConsent(value) {
    // gtag stub na wszelki wypadek (gdyby ktoś usunął z <head>)
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };

    if (value === VALUES.GRANTED) {
      gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
      loadGAOnce();
    } else {
      gtag("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied"
      });
    }
  }

  // --- UI ---
  function ensureUI() {
    if (document.getElementById("jl-consent")) return;

    const wrap = document.createElement("div");
    wrap.id = "jl-consent";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-modal", "true");
    wrap.setAttribute("aria-hidden", "true");

    wrap.innerHTML = `
      <div class="jl-consent-card">
        <div class="jl-consent-row">
          <div class="jl-consent-text">
            <p class="jl-consent-title">Cookies analityczne</p>
            <p class="jl-consent-desc">
              Używamy cookies analitycznych (GA4), aby rozumieć ruch na stronie i poprawiać jej działanie.
              Możesz zaakceptować analitykę albo kontynuować bez niej.
            </p>
          </div>

          <div class="jl-consent-actions">
            <button type="button" class="jl-consent-btn jl-consent-btn-quiet" data-action="reject">
              Odrzuć
            </button>
            <button type="button" class="jl-consent-btn jl-consent-btn-primary" data-action="accept">
              Akceptuję
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(wrap);

    const mini = document.createElement("div");
    mini.className = "jl-consent-mini";
    mini.innerHTML = `<button type="button" aria-label="Zmień ustawienia cookies"></button>`;
    document.body.appendChild(mini);

    mini.querySelector("button").addEventListener("click", () => openBanner());

    wrap.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;

      const action = btn.getAttribute("data-action");

      if (action === "accept") {
        setStored(VALUES.GRANTED);
        applyConsent(VALUES.GRANTED);
        closeBanner(true);
      }

      if (action === "reject") {
        setStored(VALUES.DENIED);
        applyConsent(VALUES.DENIED);
        closeBanner(true);
      }
    });

    // ESC zamyka baner (UX)
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const stored = getStored();
        if (stored) closeBanner(true);
      }
    });
  }

  function openBanner() {
    ensureUI();
    const el = document.getElementById("jl-consent");
    const mini = document.querySelector(".jl-consent-mini");

    el.setAttribute("aria-hidden", "false");
    if (mini) mini.style.display = "none";

    const acceptBtn = el.querySelector('button[data-action="accept"]');
    if (acceptBtn) acceptBtn.focus();
  }

  function closeBanner(showMini) {
    ensureUI();
    const el = document.getElementById("jl-consent");
    const mini = document.querySelector(".jl-consent-mini");

    if (el) el.setAttribute("aria-hidden", "true");
    if (mini) mini.style.display = showMini ? "block" : "none";
  }

  // --- START ---
  const stored = getStored();

  if (stored === VALUES.GRANTED) {
    applyConsent(VALUES.GRANTED);
    closeBanner(true);
  } else if (stored === VALUES.DENIED) {
    applyConsent(VALUES.DENIED);
    closeBanner(true);
  } else {
    // brak decyzji -> pokaż baner (GA się nie ładuje)
    applyConsent(VALUES.DENIED);
    openBanner();
  }
})();
