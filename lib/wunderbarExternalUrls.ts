/**
 * Outbound links to wunderbardigital.com from the WunderBrand app.
 * UTMs use `utm_source=wunderbrand_app` plus medium / campaign / content for attribution.
 *
 * ## Named link slots (confirm path + UTMs if marketing changes)
 *
 * | Constant | In-app use | Current path |
 * |----------|------------|--------------|
 * | `WUNDERBAR_IMPLEMENTATION_OPTIONS_URL` | Results tab — compact “Implementation options →” | `/services` |
 * | `WUNDERBAR_IMPLEMENTATION_PATHS_URL` | Results tab — “Explore implementation paths” | `/services` |
 * | `WUNDERBAR_SUITE_COMPARE_URL` | SuiteCTA, BrandSnapshotResults — “Explore … Suite™” | `/wunderbrand-suite` |
 * | `WUNDERBAR_BLUEPRINT_GUIDED_IMPLEMENTATION_URL` | Blueprint — Guided implementation card | `/services` |
 * | `WUNDERBAR_BLUEPRINT_DFY_IMPLEMENTATION_URL` | Blueprint — Done-for-you card | `/services` |
 * | `WUNDERBAR_IMPLEMENTATION_PATHS_PDF_URL` | Snapshot+ PDF — “View implementation paths” | `/services` |
 * | `WUNDERBAR_SUITE_FROM_DIAGNOSTIC_URL` | Locked signal cards — “See what’s included” | `/wunderbrand-suite` |
 * | `WUNDERBAR_SUITE_LOCKED_TAB_URL` | Locked tab modal — suite comparison | `/wunderbrand-suite` |
 *
 * Other outbound URLs (header/footer, Wundy prompts, Calendly, etc.) live outside this module.
 */

function utm(medium: string, campaign: string, content: string) {
  return new URLSearchParams({
    utm_source: "wunderbrand_app",
    utm_medium: medium,
    utm_campaign: campaign,
    utm_content: content,
  }).toString();
}

const ORIGIN = "https://wunderbardigital.com";

const SERVICES = `${ORIGIN}/services`;

/** Results tab — compact “Implementation options →” (Blueprint+ / suite results context). */
export const WUNDERBAR_IMPLEMENTATION_OPTIONS_URL = `${SERVICES}?${utm(
  "implementation_cta",
  "blueprint_plus_services",
  "implementation_options",
)}`;

/** Results tab — full band “Explore implementation paths”. */
export const WUNDERBAR_IMPLEMENTATION_PATHS_URL = `${SERVICES}?${utm(
  "implementation_cta",
  "blueprint_plus_services",
  "implementation_paths",
)}`;

/** Product comparison / suite overview. */
export const WUNDERBAR_SUITE_COMPARE_URL = `${ORIGIN}/wunderbrand-suite?${utm(
  "app_cta",
  "product_comparison",
  "suite_explore",
)}`;

/** Blueprint activation — guided implementation interest. */
export const WUNDERBAR_BLUEPRINT_GUIDED_IMPLEMENTATION_URL = `${SERVICES}?${utm(
  "blueprint_cta",
  "blueprint_plus_services",
  "guided_implementation",
)}`;

/** Blueprint activation — done-for-you interest. */
export const WUNDERBAR_BLUEPRINT_DFY_IMPLEMENTATION_URL = `${SERVICES}?${utm(
  "blueprint_cta",
  "blueprint_plus_services",
  "dfy_implementation",
)}`;

/** Snapshot+ PDF — implementation paths link. */
export const WUNDERBAR_IMPLEMENTATION_PATHS_PDF_URL = `${SERVICES}?${utm(
  "pdf_footer",
  "report_delivery",
  "implementation_paths_pdf",
)}`;

/** Locked diagnostic signals → suite comparison. */
export const WUNDERBAR_SUITE_FROM_DIAGNOSTIC_URL = `${ORIGIN}/wunderbrand-suite?${utm(
  "diagnostic_cta",
  "product_comparison",
  "locked_signal_upgrade",
)}`;

/** Locked-tab modal — “See what’s included”. */
export const WUNDERBAR_SUITE_LOCKED_TAB_URL = `${ORIGIN}/wunderbrand-suite?${utm(
  "locked_tab_modal",
  "product_comparison",
  "see_whats_included",
)}`;
