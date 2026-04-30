/**
 * Root route loading fallback. Must exist so Next keeps a Suspense boundary around
 * `layout.tsx` children (required for hooks like useSearchParams on some pages).
 * Returning null avoids a full-screen spinner + RSC "hidden shell" swap that can leave
 * client-heavy routes (e.g. /preview/results-tabs) appearing blank if hydration stalls.
 */
export default function RootLoading() {
  return null;
}
