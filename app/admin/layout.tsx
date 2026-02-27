import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/adminSession";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdminPage();
  return <>{children}</>;
}
