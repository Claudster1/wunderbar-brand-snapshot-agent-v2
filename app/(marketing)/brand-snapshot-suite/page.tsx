import { redirect } from "next/navigation";

/** Legacy marketing route → in-app suite (comparison + checkout). */
export default function BrandSnapshotSuitePage() {
  redirect("/brand-suite");
}
