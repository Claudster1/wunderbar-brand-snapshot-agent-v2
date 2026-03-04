"use client";

import { useEffect, useState } from "react";
import { snapshotPlusCopy } from "@/src/content/snapshotPlus.copy";
import { trackEvent } from "@/lib/activeCampaignTracking";

export default function SnapshotPlusPage() {
  const [showBlueprintPromo] = useState(() => {
    if (typeof window === "undefined") return false;
    const views = Number(window.localStorage.getItem("snapshot_plus_views") || "0");
    const hasBlueprint = window.localStorage.getItem("has_blueprint") === "true";
    return views >= 2 && !hasBlueprint;
  });

  useEffect(() => {
    const count = Number(
      localStorage.getItem("snapshot_plus_views") || "0"
    );
    localStorage.setItem(
      "snapshot_plus_views",
      String(count + 1)
    );

    if (count + 1 === 2) {
      trackEvent("snapshot_plus_viewed_twice", {});
    }

  }, []);

  return (
    <main>
      <h1>{snapshotPlusCopy.hero.title}</h1>
      <p>{snapshotPlusCopy.hero.subtitle}</p>
      <p>{snapshotPlusCopy.hero.intro}</p>

      <ul>
        {snapshotPlusCopy.value.map(v => (
          <li key={v}>{v}</li>
        ))}
      </ul>

      <section>
        <h2>{snapshotPlusCopy.aeo.headline}</h2>
        <p>{snapshotPlusCopy.aeo.description}</p>
      </section>

      <button>{snapshotPlusCopy.cta.primary}</button>

      {showBlueprintPromo && (
        <div className="mt-10 rounded-xl border border-brand-border p-6 bg-white">
          <h3 className="text-lg font-semibold text-brand-navy mb-2">
            Ready to turn insight into execution?
          </h3>
          <p className="text-sm mb-4">
            WunderBrand Blueprint™ transforms your Snapshot+™ insights into a complete,
            usable brand system.
          </p>
          <a
            href="/blueprint"
            onClick={() => trackEvent("blueprint_promo_clicked", {})}
            className="btn-primary"
          >
            Explore WunderBrand Blueprint™ →
          </a>
        </div>
      )}
    </main>
  );
}


