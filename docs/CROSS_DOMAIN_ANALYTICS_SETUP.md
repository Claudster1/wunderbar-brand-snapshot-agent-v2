# Cross-Domain Analytics + Cookie Banner Setup

Use this on `wunderbardigital.com` so marketing-site activity appears in the same unified dashboard as app activity.

For consent + connect-form payload requirements, see:

- `docs/CONSENT_COMPLIANCE.md`

## 1) Cross-domain event tracking

Send events to:

- `https://app.wunderbrand.ai/api/analytics`

Allowed origins are already configured for:

- `https://wunderbardigital.com`
- `https://www.wunderbardigital.com`
- `https://app.wunderbrand.ai`

Paste this into your global layout (before `</body>`):

```html
<script>
  function trackWunderEvent(eventName, meta) {
    fetch("https://app.wunderbrand.ai/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: eventName,
        meta: {
          ...(meta || {}),
          pagePath: window.location.pathname,
          pageUrl: window.location.href,
          siteHost: window.location.hostname.toLowerCase(),
        },
      }),
    }).catch(function () {});
  }

  // Optional default pageview signal:
  // trackWunderEvent("RESULTS_VIEWED");
</script>
```

## 2) Updated cookie banner (marketing site)

This version matches the latest app treatment:

- bright blue bitten-cookie icon
- no icon background
- 5px button border radius
- `Decline All` + `Accept All` + `Manage Preferences`

Add this near the end of `<body>`:

```html
<div id="wb-cookie-root"></div>

<script>
  (function () {
    var CONSENT_KEY = "wb_cookie_consent_v1";
    var root = document.getElementById("wb-cookie-root");
    if (!root) return;

    function getConsent() {
      try {
        var raw = localStorage.getItem(CONSENT_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    }

    function setConsent(next) {
      localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({
          essential: true,
          analytics: !!next.analytics,
          marketing: !!next.marketing,
          updatedAt: new Date().toISOString(),
        })
      );
    }

    function injectAnalyticsIfNeeded(consent) {
      if (!consent || !consent.analytics) return;
      // Optional hook: track consent acceptance
      if (typeof window.trackWunderEvent === "function") {
        window.trackWunderEvent("RESULTS_VIEWED", { consentSource: "cookie_banner" });
      }
    }

    function closeBanner() {
      root.innerHTML = "";
    }

    function openPreferences() {
      var modal = document.getElementById("wb-cookie-modal");
      if (modal) modal.style.display = "flex";
    }

    function closePreferences() {
      var modal = document.getElementById("wb-cookie-modal");
      if (modal) modal.style.display = "none";
    }

    function render() {
      var existing = getConsent();
      if (existing) {
        injectAnalyticsIfNeeded(existing);
        return;
      }

      root.innerHTML =
        '<div class="wb-cookie-banner">' +
        '  <div class="wb-cookie-inner">' +
        '    <div class="wb-cookie-copy">' +
        '      <span class="wb-cookie-icon" aria-hidden="true">' +
        '        <svg width="22" height="22" viewBox="0 0 24 24">' +
        '          <path fill="#07B0F2" fill-rule="evenodd" d="M12 2.6a9.4 9.4 0 1 0 9.27 10.95 2.9 2.9 0 0 1-2.63-2.88 2.9 2.9 0 0 1 2.72-2.9A9.4 9.4 0 0 0 12 2.6Zm-2.8 4.2a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1Zm4.4 1.1a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-3 4.1a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3Zm4.5 2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z" clip-rule="evenodd"></path>' +
        "        </svg>" +
        "      </span>" +
        '      <div><strong>We value your privacy</strong><br>We use cookies to improve your experience and understand site usage. <a href="/privacy-policy#pp-cookies">Learn more</a> · <button type="button" id="wb-manage-btn" class="wb-link-btn">Manage Preferences</button></div>' +
        "    </div>" +
        '    <div class="wb-cookie-actions">' +
        '      <button type="button" id="wb-decline-btn" class="wb-btn wb-btn-outline">Decline All</button>' +
        '      <button type="button" id="wb-accept-btn" class="wb-btn wb-btn-primary">Accept All</button>' +
        "    </div>" +
        "  </div>" +
        "</div>" +
        '<div class="wb-cookie-modal" id="wb-cookie-modal" style="display:none">' +
        '  <div class="wb-cookie-modal-card">' +
        "    <h3>Cookie Preferences</h3>" +
        '    <p class="wb-cookie-modal-copy">Choose which cookies you are comfortable with.</p>' +
        '    <label><input type="checkbox" checked disabled> Essential (always on)</label>' +
        '    <label><input id="wb-pref-analytics" type="checkbox" checked> Analytics</label>' +
        '    <label><input id="wb-pref-marketing" type="checkbox"> Marketing</label>' +
        '    <div class="wb-cookie-actions wb-cookie-actions-modal">' +
        '      <button type="button" id="wb-save-prefs" class="wb-btn wb-btn-primary">Save Preferences</button>' +
        '      <button type="button" id="wb-close-prefs" class="wb-btn wb-btn-outline">Close</button>' +
        "    </div>" +
        "  </div>" +
        "</div>";

      document.getElementById("wb-decline-btn").addEventListener("click", function () {
        setConsent({ analytics: false, marketing: false });
        closeBanner();
      });

      document.getElementById("wb-accept-btn").addEventListener("click", function () {
        var consent = { analytics: true, marketing: true };
        setConsent(consent);
        injectAnalyticsIfNeeded(consent);
        closeBanner();
      });

      document.getElementById("wb-manage-btn").addEventListener("click", openPreferences);
      document.getElementById("wb-close-prefs").addEventListener("click", closePreferences);

      document.getElementById("wb-save-prefs").addEventListener("click", function () {
        var analytics = !!document.getElementById("wb-pref-analytics").checked;
        var marketing = !!document.getElementById("wb-pref-marketing").checked;
        var consent = { analytics: analytics, marketing: marketing };
        setConsent(consent);
        injectAnalyticsIfNeeded(consent);
        closePreferences();
        closeBanner();
      });
    }

    render();
  })();
</script>
```

Add this CSS (global stylesheet or `<style>` block):

```css
.wb-cookie-banner {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  background: #fff;
  border-top: 1px solid #e2e8f0;
  box-shadow: 0 -4px 32px rgba(10, 37, 64, 0.1);
}
.wb-cookie-inner {
  max-width: 1120px;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
}
.wb-cookie-copy {
  display: flex;
  gap: 10px;
  color: #0a2540;
  font-size: 13px;
  line-height: 1.5;
}
.wb-cookie-copy a { color: #07b0f2; font-weight: 700; }
.wb-cookie-icon { display: inline-flex; align-items: center; justify-content: center; }
.wb-cookie-actions { display: flex; gap: 10px; flex-wrap: wrap; }
.wb-btn {
  border-radius: 5px;
  padding: 10px 20px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}
.wb-btn-primary { border: 0; color: #fff; background: #07b0f2; }
.wb-btn-outline { border: 1px solid #d6dfe8; color: #5a6b7e; background: transparent; }
.wb-link-btn {
  background: none;
  border: 0;
  color: #07b0f2;
  padding: 0;
  font-weight: 700;
  cursor: pointer;
}
.wb-cookie-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(10, 37, 64, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}
.wb-cookie-modal-card {
  width: 100%;
  max-width: 480px;
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 24px 64px rgba(10, 37, 64, 0.18);
}
.wb-cookie-modal-copy { color: #5a6b7e; font-size: 13px; margin-top: 6px; }
.wb-cookie-modal-card label { display: block; margin-top: 10px; font-size: 14px; color: #0a2540; }
.wb-cookie-actions-modal { margin-top: 16px; }
@media (max-width: 768px) {
  .wb-cookie-inner { padding: 14px; }
}
```

## 3) Recommended event names

Use the same event names where possible to keep unified reporting consistent:

- `RESULTS_VIEWED`
- `UPGRADE_CLICKED`
- `SNAPSHOT_STARTED`
- `SNAPSHOT_COMPLETED`
- `BLUEPRINT_STARTED`
- `BLUEPRINT_COMPLETED`

## 4) Data quality notes

- Include `meta.email` when available to improve identity stitching.
- `siteHost` is stored and propagated to unified events as `metadata.site_host`.

## 5) Connect form SMS opt-in payload

If your marketing-site connect form posts into `https://app.wunderbrand.ai/api/inbound/connect`, include SMS consent fields when the user checks the opt-in box:

```json
{
  "email": "user@example.com",
  "phone": "+16575003620",
  "name": "Jane Doe",
  "companyName": "Example Co",
  "message": "I'd like to talk to an expert.",
  "source": "connect_form",
  "utm_source": "wunderbardigital",
  "utm_medium": "website",
  "utm_campaign": "connect_form",
  "sms_opted_in": true,
  "phone_mobile": "+16575003620"
}
```

Notes:

- `sms_opted_in` should only be `true` when explicit checkbox consent is captured.
- `phone_mobile` should be E.164 format (for example, `+16575551234`).
- When provided with `sms_opted_in: true`, the app tags the contact with `sms:opted-in` and sets `sms_opted_in` in ActiveCampaign.
