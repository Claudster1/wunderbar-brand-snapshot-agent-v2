import { notFound } from "next/navigation";

/** Only reached via middleware rewrite when `/preview/*` is disabled on production. */
export default function PreviewUnavailable() {
  notFound();
}
