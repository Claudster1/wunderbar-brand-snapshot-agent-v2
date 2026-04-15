"use client";

import Link from "next/link";
import type { TabSectionMenuItem } from "@/components/results/TabSectionMenu";
import {
  SUITE_ACCENT_BRIGHT,
  SUITE_BORDER,
  SUITE_NAV_ITEM_MUTED,
  SUITE_NAVY,
  SUITE_RADIUS_LG,
  SUITE_SECTION_ACTIVE_BG,
  SUITE_SHADOW_CARD,
} from "@/components/results/suiteBrandTokens";

export type FoundationSuiteSidebarGroup = {
  label: string;
  items: TabSectionMenuItem[];
};

type Props = {
  groups: FoundationSuiteSidebarGroup[];
  activeSectionId: string | null;
};

function scrollToSectionId(id: string) {
  const target = document.getElementById(id);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Left column section nav — matches `FoundationBlueprintContent` (sticky group cards, blue headers, scroll spy). */
export default function FoundationStyleSuiteSidebar({ groups, activeSectionId }: Props) {
  const visibleGroups = groups.filter((g) => g.items.length > 0);
  if (visibleGroups.length === 0) return null;

  return (
    <aside className="hidden min-h-0 w-full shrink-0 lg:block lg:w-[256px] lg:max-w-[256px]">
      <div
        className="sticky z-10 space-y-5 overflow-y-auto overscroll-contain pr-1"
        style={{
          top: "120px",
          maxHeight: "calc(100dvh - 9rem)",
        }}
      >
        {visibleGroups.map((group) => (
          <div
            key={group.label}
            style={{
              borderRadius: SUITE_RADIUS_LG,
              background: "#FFFFFF",
              padding: 12,
              boxShadow: SUITE_SHADOW_CARD,
              border: `1px solid ${SUITE_BORDER}`,
            }}
          >
            <p
              className="px-2 pb-2 text-xs sm:text-sm font-semibold tracking-[0.1em]"
              style={{ color: SUITE_ACCENT_BRIGHT }}
            >
              {group.label}
            </p>
            <div className="space-y-1.5">
              {group.items.map((link) => {
                const active = activeSectionId !== null && link.id === activeSectionId;
                const className =
                  "w-full rounded-md px-2.5 py-2.5 text-left text-sm sm:text-[15px] leading-snug transition";
                const style = {
                  backgroundColor: active ? SUITE_SECTION_ACTIVE_BG : "transparent",
                  color: active ? SUITE_NAVY : SUITE_NAV_ITEM_MUTED,
                  fontWeight: active ? 700 : 500,
                } as const;

                if (link.href) {
                  return (
                    <Link
                      key={link.id}
                      href={link.href}
                      prefetch={false}
                      className={`${className} block no-underline`}
                      style={style}
                      aria-current={active ? "page" : undefined}
                    >
                      {link.label}
                    </Link>
                  );
                }

                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => scrollToSectionId(link.id)}
                    className={className}
                    style={style}
                    aria-current={active ? "true" : undefined}
                  >
                    {link.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
