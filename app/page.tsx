import HomePageClient from "./home-page-client";

type PageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstString(
  sp: Record<string, string | string[] | undefined>,
  key: string
): string | null {
  const v = sp[key];
  if (v === undefined) return null;
  if (Array.isArray(v)) return v[0] ?? null;
  return v;
}

/**
 * Server entry: read URL search params here so the client tree does not depend on
 * `useSearchParams()` + Suspense (avoids a stuck or long “Loading…” shell on first paint).
 */
export default async function Page({ searchParams }: PageProps) {
  const sp = searchParams != null ? await searchParams : {};
  return (
    <HomePageClient
      tierParam={firstString(sp, "tier")}
      nameParam={firstString(sp, "name")}
      tokenParam={firstString(sp, "token")}
    />
  );
}
