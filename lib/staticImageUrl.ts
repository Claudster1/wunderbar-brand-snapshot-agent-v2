import type { StaticImageData } from "next/image";

/** Normalize Next/static file imports whether typed as `string` or `StaticImageData`. */
export function staticImageUrl(imported: string | StaticImageData): string {
  return typeof imported === "string" ? imported : imported.src;
}
