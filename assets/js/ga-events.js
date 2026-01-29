/* JuryLink – GA4 events (mailto/tel) */
(function () {
    const CONSENT_KEY = "jl_consent_v1";
    const CONSENT_GRANTED = "granted";
  
    function hasConsent() {
      try { return localStorage.getItem(CONSENT_KEY) === CONSENT_GRANTED; }
      catch (e) { return false; }
    }
  
    function placement(a) {
      if (a.closest(".header-cta")) return "header_cta";
      if (a.closest("#kontakt") || a.closest(".contact-grid")) return "contact_section";
      if (a.closest(".site-footer")) return "footer";
      return "other";
    }
  
    function fire(name, params) {
      if (!hasConsent()) return;
      if (typeof window.gtag !== "function") return;
      window.gtag("event", name, params);
    }
  
    document.addEventListener("click", function (e) {
      const a = e.target.closest('a[href]');
      if (!a) return;
  
      const href = (a.getAttribute("href") || "").trim();
      const text = (a.textContent || "").trim().slice(0, 120);
  
      if (href.startsWith("mailto:")) {
        fire("contact_email_click", {
          placement: placement(a),
          link_url: href,
          link_text: text
        });
      } else if (href.startsWith("tel:")) {
        fire("contact_phone_click", {
          placement: placement(a),
          link_url: href,
          link_text: text
        });
      }
    }, true);
  })();
  