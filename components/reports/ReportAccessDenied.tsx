import Link from "next/link";
import { ReportAccessRemint } from "@/components/reports/ReportAccessRemint";

type Props = {
  reportId?: string;
  /** Absolute path to return to after sign-in, e.g. `/results?reportId=…` */
  returnTo: string;
  /** When true, offer email remint via ensure-access-session (unlocked Snapshot returns). */
  allowSessionRemint?: boolean;
  title?: string;
  message?: string;
};

/**
 * Shown when a report page requires a verified-email session (or share token)
 * and the visitor is not authorized.
 */
export function ReportAccessDenied({
  reportId,
  returnTo,
  allowSessionRemint = false,
  title = "Sign in to view this report",
  message = "This report is private. Sign in with the email used for this brand, or open the link from your results email.",
}: Props) {
  const accessHref = `/access?next=${encodeURIComponent(returnTo)}`;

  return (
    <main className="min-h-screen bg-[#F7F9FC] font-brand flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-[32rem] rounded-[5px] border border-[#D6DFE8] bg-white p-8 shadow-[0_8px_32px_rgba(2,24,89,0.06)] text-center">
        <h1 className="m-0 mb-3 text-[1.5rem] font-bold tracking-[-0.02em] text-[#021859]">{title}</h1>
        <p className="m-0 mb-6 text-[15px] leading-relaxed text-[#5A6B7E]">{message}</p>
        <Link
          href={accessHref}
          className="inline-flex h-12 items-center justify-center rounded-[5px] bg-[#07B0F2] px-6 text-[14px] font-bold text-white no-underline hover:bg-[#0699d4]"
        >
          Email me a sign-in link
        </Link>
        {allowSessionRemint && reportId ? (
          <div className="mt-8 border-t border-[#E6EAF2] pt-6 text-left">
            <ReportAccessRemint reportId={reportId} returnTo={returnTo} />
          </div>
        ) : null}
      </div>
    </main>
  );
}
