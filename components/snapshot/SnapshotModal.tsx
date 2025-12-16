\"use client\";

import { useCallback, useEffect, useMemo, useState } from \"react\";

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
  iframeSrc = \"https://wunderbar-brand-snapshot-agent-v2-8.vercel.app/\",
  resultsPathBase = \"/brand-snapshot/results\",
}: SnapshotModalProps) {
  const [iframeHeight, setIframeHeight] = useState(\"700px\");

  const iframeOrigin = useMemo(() => {
    try {
      return new URL(iframeSrc).origin;
    } catch {
      return null;
    }
  }, [iframeSrc]);

  const closeModal = useCallback(() => {
    document.body.style.overflow = \"auto\";
    onClose();
  }, [onClose]);

  // Lock scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = \"hidden\";
    return () => {
      document.body.style.overflow = \"auto\";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === \"Escape\") closeModal();
    };
    window.addEventListener(\"keydown\", onKeyDown);
    return () => window.removeEventListener(\"keydown\", onKeyDown);
  }, [isOpen, closeModal]);

  // Listen for messages from the Agent
  useEffect(() => {
    if (!isOpen) return;

    function handleMessage(event: MessageEvent) {
      if (!event.data) return;
      if (iframeOrigin && event.origin !== iframeOrigin) return;

      const msg: any = event.data;

      // Completion (support multiple payload shapes)
      if (msg.type === \"BRAND_SNAPSHOT_COMPLETE\") {
        const reportId =
          msg.reportId ||
          msg.report_id ||
          msg.data?.reportId ||
          msg.data?.report_id;

        const redirectUrl = msg.redirectUrl || msg.data?.redirectUrl;

        closeModal();

        if (typeof redirectUrl === \"string\" && redirectUrl.length > 0) {
          window.location.href = redirectUrl;
          return;
        }

        if (typeof reportId === \"string\" && reportId.length > 0) {
          window.location.href = `${resultsPathBase}/${reportId}`;
        }
        return;
      }

      // Auto-resize (support multiple message types used across the repo)
      if (
        msg.type === \"IFRAME_HEIGHT\" ||
        msg.type === \"BS_IFRAME_HEIGHT\" ||
        msg.type === \"RESIZE_IFRAME\" ||
        msg.type === \"AGENT_RESIZE\"
      ) {
        const heightVal = msg.height ?? msg.payload?.height;
        if (typeof heightVal === \"number\" && Number.isFinite(heightVal)) {
          setIframeHeight(`${Math.max(300, heightVal)}px`);
        } else if (typeof heightVal === \"string\" && heightVal.length > 0) {
          setIframeHeight(heightVal.includes(\"px\") ? heightVal : `${heightVal}px`);
        }
      }
    }

    window.addEventListener(\"message\", handleMessage);
    return () => window.removeEventListener(\"message\", handleMessage);
  }, [isOpen, closeModal, iframeOrigin, resultsPathBase]);

  if (!isOpen) return null;

  return (
    <div
      className=\"fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300\"
      aria-modal=\"true\"
      role=\"dialog\"
    >
      <div className=\"relative w-full max-w-4xl bg-white rounded-lg shadow-xl overflow-hidden animate-fadeInUp\">
        <button
          className=\"absolute top-4 right-4 text-slate-600 hover:text-slate-800 transition\"
          onClick={closeModal}
          aria-label=\"Close\"
        >
          ✕
        </button>

        <iframe
          src={iframeSrc}
          title=\"Brand Snapshot™ Agent\"
          style={{ width: \"100%\", height: iframeHeight }}
          className=\"border-0 w-full\"
          allow=\"clipboard-write; fullscreen\"
        />
      </div>
    </div>
  );
}


