import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/adminSession";
import AdminShell from "./AdminShell";

/** Admin auth reads Supabase from env; skip static prerender so CI/Vercel builds succeed before env is wired. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const identity = await requireAdminPage();
  return <AdminShell adminEmail={identity.email}>{children}</AdminShell>;
}
