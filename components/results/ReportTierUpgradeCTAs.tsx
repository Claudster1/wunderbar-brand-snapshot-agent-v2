import Link from "next/link";
import type { ProductTier } from "@/components/results/tabConfig";

const SUITE_COMPARE = "https://wunderbardigital.com/wunderbrand-suite";

function marketingUrl(path: string, utmSource: string, utmContent: string): string {
  const base = path.startsWith("http") ? path : `https://wunderbardigital.com${path.startsWith("/") ? path : `/${path}`}`;
  const u = new URL(base);
  u.searchParams.set("utm_source", utmSource);
  u.searchParams.set("utm_medium", "report_cta");
  u.searchParams.set("utm_campaign", "tier_upgrade");
  u.searchParams.set("utm_content", utmContent);
  return u.toString();
}

const primaryBtn = "wb-cta wb-cta--solid";
const secondaryBtn = "wb-cta wb-cta--outline";
const ghostBtn = "wb-cta wb-cta--text";

export type ReportTierUpgradeCTAsProps = {
  tier: ProductTier;
  /** e.g. preview_results_tabs, results_page, brand_snapshot_report */
  utmSource: string;
  /** In-app link for downloads tab (preview) or /results?...&tab=downloads (live) */
  downloadsHref?: string;
  /** Live Snapshot results already render ResultsUpgradeCTA — skip duplicate Snapshot+ primary */
  suppressSnapshotPlusPrimary?: boolean;
};

/**
 * Tier-appropriate upgrade CTAs: next product level(s), suite compare, and services at Blueprint+.
 */
export function ReportTierUpgradeCTAs({
  tier,
  utmSource,
  downloadsHref,
  suppressSnapshotPlusPrimary = false,
}: ReportTierUpgradeCTAsProps) {
  const talkExpert = marketingUrl(
    "/talk-to-an-expert",
    utmSource,
    `${tier.replace(/-/g, "_")}_talk_expert`,
  );

  return (
    <div className="space-y-3">
      {downloadsHref ? (
        <div className="flex flex-wrap gap-3">
          <Link href={downloadsHref} className={primaryBtn}>
            Download report assets
          </Link>
        </div>
      ) : null}

      {tier === "blueprint-plus" ? (
        <>
          <p className="bs-body-sm text-brand-muted m-0 max-w-2xl">
            You&apos;re on our highest self-serve tier. When you want execution support, we can help with managed marketing,
            AI consulting, or a quick expert conversation.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href={marketingUrl(
                "/managed-marketing",
                utmSource,
                "blueprint_plus_managed_marketing",
              )}
              className={secondaryBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              Managed Marketing
            </a>
            <a
              href={marketingUrl("/ai-consulting", utmSource, "blueprint_plus_ai_consulting")}
              className={secondaryBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              AI Consulting
            </a>
            <a href={talkExpert} className={secondaryBtn} target="_blank" rel="noopener noreferrer">
              Talk to an expert
            </a>
            <a
              href="https://calendly.com/claudine-wunderbardigital/brand-blueprint-strategy-activation-session?utm_source=wunderbrand_app&utm_medium=report_cta&utm_campaign=strategy_activation&utm_content=blueprint_plus_session"
              className={ghostBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              Book Strategy Activation Session
            </a>
          </div>
        </>
      ) : (
        <>
          <p className="bs-body-sm text-brand-muted m-0 max-w-2xl">
            {tier === "snapshot"
              ? "Go deeper with paid diagnostics and a full brand operating system — or compare everything in one place."
              : tier === "snapshot-plus"
                ? "Move from diagnosis to a complete brand system — Blueprint™ first, or go straight to Blueprint+™ for the full stack."
                : "Unlock the full Blueprint+™ stack for advanced strategy, prompts, and your included activation session."}
          </p>
          <div className="flex flex-wrap gap-3">
            {tier === "snapshot" && !suppressSnapshotPlusPrimary ? (
              <a
                href={marketingUrl("/wunderbrand-snapshot-plus", utmSource, "next_snapshot_plus")}
                className={primaryBtn}
                target="_blank"
                rel="noopener noreferrer"
              >
                Upgrade to Snapshot+™
              </a>
            ) : null}
            {tier === "snapshot" ? (
              <>
                <a
                  href={marketingUrl("/wunderbrand-blueprint", utmSource, "next_blueprint")}
                  className={suppressSnapshotPlusPrimary ? primaryBtn : secondaryBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore Blueprint™
                </a>
                <a
                  href={marketingUrl("/wunderbrand-blueprint-plus", utmSource, "next_blueprint_plus")}
                  className={secondaryBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore Blueprint+™
                </a>
              </>
            ) : null}
            {tier === "snapshot-plus" ? (
              <>
                <a
                  href={marketingUrl("/wunderbrand-blueprint", utmSource, "next_blueprint")}
                  className={primaryBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Upgrade to Blueprint™
                </a>
                <a
                  href={marketingUrl("/wunderbrand-blueprint-plus", utmSource, "next_blueprint_plus")}
                  className={secondaryBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Explore Blueprint+™
                </a>
              </>
            ) : null}
            {tier === "blueprint" ? (
              <>
                <a
                  href={marketingUrl("/wunderbrand-blueprint-plus", utmSource, "next_blueprint_plus")}
                  className={primaryBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Upgrade to Blueprint+™
                </a>
              </>
            ) : null}
            <a
              href={marketingUrl(SUITE_COMPARE, utmSource, "compare_suite")}
              className={tier === "blueprint" ? secondaryBtn : ghostBtn}
              target="_blank"
              rel="noopener noreferrer"
            >
              Compare WunderBrand Suite™
            </a>
            <a href={talkExpert} className={ghostBtn} target="_blank" rel="noopener noreferrer">
              Talk to an expert
            </a>
          </div>
        </>
      )}
    </div>
  );
}
