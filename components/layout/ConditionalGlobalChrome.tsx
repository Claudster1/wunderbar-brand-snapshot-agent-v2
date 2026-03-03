"use client";

import { usePathname } from "next/navigation";
import { WunderbarHeader } from "@/components/layout/WunderbarHeader";
import { WunderbarFooter } from "@/components/layout/WunderbarFooter";

function useIsBackendRoute(): boolean {
  const pathname = usePathname();
  if (!pathname) return true;

  return (
    pathname === "/admin-login" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/backend")
  );
}

export function ConditionalGlobalHeader() {
  const isBackendRoute = useIsBackendRoute();

  if (isBackendRoute) return null;

  return <WunderbarHeader />;
}

export function ConditionalGlobalFooter() {
  const isBackendRoute = useIsBackendRoute();

  if (isBackendRoute) return null;

  return <WunderbarFooter />;
}

