"use client";

import { usePathname } from "next/navigation";
import { WunderbarHeader } from "@/components/layout/WunderbarHeader";
import { WunderbarFooter } from "@/components/layout/WunderbarFooter";

export function ConditionalGlobalChrome() {
  const pathname = usePathname();
  if (!pathname) return null;

  const isBackendRoute =
    pathname === "/admin-login" ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/backend");

  if (isBackendRoute) return null;

  return (
    <>
      <WunderbarHeader />
      <WunderbarFooter />
    </>
  );
}

