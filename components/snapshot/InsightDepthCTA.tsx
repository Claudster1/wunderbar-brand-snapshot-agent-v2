// components/snapshot/InsightDepthCTA.tsx

"use client";

import Link from "next/link";
import { rolePhrase } from "@/src/lib/roleLanguage";
import type { UserRoleContext } from "@/src/types/snapshot";

interface InsightDepthCTAProps {
  userRoleContext?: string;
}

export function InsightDepthCTA({ userRoleContext }: InsightDepthCTAProps = {}) {
  return (
    <section className="border rounded-lg p-6 bg-gradient-to-br from-brand-navy to-brand-navy/90 text-white">
      <h3 className="text-xl font-semibold mb-2">
        Want deeper clarity on your WunderBrand Snapshot™?
      </h3>

      <p className="text-sm text-white/90 mb-4">
        Snapshot+™ builds directly on your results, translating them into clear priorities
        {userRoleContext ? (
          <> designed to support you in {rolePhrase(userRoleContext as UserRoleContext)} — not abstract brand theory.</>
        ) : (
          <> designed to support you — not abstract brand theory.</>
        )}
      </p>

      <ul className="text-sm text-white/80 space-y-2 mb-6">
        <li className="flex items-start gap-2">
          <span className="text-brand-blue">✓</span>
          <span>Expanded pillar analysis with strategic context</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-brand-blue">✓</span>
          <span>Prioritized opportunity mapping</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-brand-blue">✓</span>
          <span>Full AEO (Answer Engine Optimization) strategy</span>
        </li>
        <li className="flex items-start gap-2">
          <span className="text-brand-blue">✓</span>
          <span>Actionable recommendations tailored to your brand</span>
        </li>
      </ul>

      <Link
        href="/snapshot-plus"
        className="inline-block px-6 py-3 bg-brand-blue text-white rounded-md font-semibold hover:bg-brand-blueHover transition"
      >
        See how to strengthen what matters most right now →
      </Link>
    </section>
  );
}
