import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/adminSession";
import AdminShell from "./AdminShell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const identity = await requireAdminPage();
  return <AdminShell adminEmail={identity.email}>{children}</AdminShell>;
}
