"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import ModalShell from "@/components/ui/ModalShell";
import ScoreRevealModal from "@/components/ui/ScoreRevealModal";

export type SnapshotModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Agent app URL */
  iframeSrc?: string;
  /** Redirect base path for results */
  resultsPathBase?: string;
};

export default function SnapshotModal({
  isOpen,
  onClose,
  iframeSrc = "https://wunderbar-brand-snapshot-agent-v2-8.vercel.app/",
  resultsPathBase = "/brand-snapshot/results",
}: SnapshotModalProps) {
  const [iframeHeight, setIframeHeight] = useState("700px");
  const [showScoreReveal, setShowScoreReveal] = useState(false);
  const [finalScore, setFinalScore] = useState<number>(0);
  const [pillarScores, setPillarScores] = useState({
    positioning: 0,
    messaging: 0,
    visibility: 0,
    credibility: 0,
    conversion: 0,
  });
  const [pendingRedirectUrl, setPendingRedirectUrl] = useState<string | null>(null);
  const [pendingReportId, setPendingReportId] = useState<string | null>(null);

  const iframeOrigin = useMemo(() => {
    try {
      return new URL(iframeSrc).origin;
    } catch {
      return null;
    }
  }, [iframeSrc]);

  const closeModal = useCallback(() => {
    setShowScoreReveal(false);
    setPendingRedirectUrl(null);
    setPendingReportId(null);
    onClose();
  }, [onClose]);

  const continueToResults = useCallback(() => {
    const redirectUrl = pendingRedirectUrl;
    const reportId = pendingReportId;

    setShowScoreReveal(false);

    if (typeof redirectUrl === "string" && redirectUrl.length > 0) {
      window.location.href = redirectUrl;
      return;
    }

    if (typeof reportId === "string" && reportId.length > 0) {
      window.location.href = `${resultsPathBase}/${reportId}`;
      return;
    }

    closeModal();
  }, [pendingRedirectUrl, pendingReportId, resultsPathBase, closeModal]);

  // Listen for messages from the Agent
  useEffect(() => {
    if (!isOpen) return;

    function handleMessage(event: MessageEvent) {
      if (!event.data) return;
      if (iframeOrigin && event.origin !== iframeOrigin) return;

      const msg: any = event.data;

      // Completion (support multiple payload shapes)
      if (msg.type === "BRAND_SNAPSHOT_COMPLETE") {
        const reportId =
          msg.reportId ||
          msg.report_id ||
          msg.data?.reportId ||
          msg.data?.report_id;

        const redirectUrl = msg.redirectUrl || msg.data?.redirectUrl;
        const score =
          msg.finalScore ||
          msg.brandAlignmentScore ||
          msg.data?.finalScore ||
          msg.data?.brandAlignmentScore ||
          msg.data?.data?.brandAlignmentScore ||
          0;

        const pillars =
          msg.pillars ||
          msg.pillarScores ||
          msg.data?.pillars ||
          msg.data?.pillarScores ||
          msg.data?.data?.pillarScores ||
          {};

        setPendingRedirectUrl(typeof redirectUrl === "string" ? redirectUrl : null);
        setPendingReportId(typeof reportId === "string" ? reportId : null);
        setFinalScore(typeof score === "number" ? score : Number(score) || 0);
        setPillarScores({
          positioning: Number(pillars.positioning) || 0,
          messaging: Number(pillars.messaging) || 0,
          visibility: Number(pillars.visibility) || 0,
          credibility: Number(pillars.credibility) || 0,
          conversion: Number(pillars.conversion) || 0,
        });
        setShowScoreReveal(true);
        return;
      }

      // Auto-resize (support multiple message types used across the repo)
      if (
        msg.type === "IFRAME_HEIGHT" ||
        msg.type === "BS_IFRAME_HEIGHT" ||
        msg.type === "RESIZE_IFRAME" ||
        msg.type === "AGENT_RESIZE"
      ) {
        const heightVal = msg.height ?? msg.payload?.height;
        if (typeof heightVal === "number" && Number.isFinite(heightVal)) {
          setIframeHeight(`${Math.max(300, heightVal)}px`);
        } else if (typeof heightVal === "string" && heightVal.length > 0) {
          setIframeHeight(heightVal.includes("px") ? heightVal : `${heightVal}px`);
        }
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [isOpen, closeModal, iframeOrigin, resultsPathBase]);

  if (!isOpen) return null;

  return (
    <>
      <ModalShell isOpen={isOpen && !showScoreReveal} onClose={closeModal} width="max-w-4xl">
        <div className="relative">
          <button
            className="absolute top-0 right-0 text-slate-600 hover:text-slate-800 transition"
            onClick={closeModal}
            aria-label="Close"
          >
            ✕
          </button>

          <div className="mt-6">
            <iframe
              src={iframeSrc}
              title="Brand Snapshot™ Agent"
              style={{ width: "100%", height: iframeHeight }}
              className="border-0 w-full"
              allow="clipboard-write; fullscreen"
            />
          </div>
        </div>
      </ModalShell>

      <ScoreRevealModal
        isOpen={isOpen && showScoreReveal}
        onClose={continueToResults}
        finalScore={finalScore}
        pillars={pillarScores}
      />
    </>
  );
}


