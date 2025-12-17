"use client";

import { useEffect, useRef } from "react";

interface ModalShellProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: string; // Tailwind max-width class (e.g. "max-w-2xl")
}

export default function ModalShell({
  isOpen,
  onClose,
  children,
  width = "max-w-xl",
}: ModalShellProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        ref={backdropRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-[12px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-xl shadow-2xl border border-[#E0E3EA] p-8 w-[min(92vw,900px)] ${width}`}
        role="dialog"
        aria-modal="true"
      >
        {children}
      </div>
    </div>
  );
}


