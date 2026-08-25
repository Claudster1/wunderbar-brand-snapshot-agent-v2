"use client";

// components/security/TurnstileWidget.tsx
// Invisible Cloudflare Turnstile widget.
// Renders nothing visible — silently obtains a token in the background.
// Parent reads the token via the callback or the ref.

import { useEffect, useRef, useCallback, type CSSProperties } from "react";
import { isTurnstileEnforced } from "@/lib/security/turnstilePolicy";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: Record<string, unknown>
      ) => string;
      reset: (widgetId: string) => void;
      getResponse: (widgetId: string) => string | undefined;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

interface TurnstileWidgetProps {
  onToken: (token: string) => void;
  onError?: () => void;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
const SHOULD_ENABLE_TURNSTILE = isTurnstileEnforced() && Boolean(SITE_KEY);

/** Keep Cloudflare’s iframe completely off-screen — avoids a brief “code/widget” flash. */
const HIDDEN_HOST_STYLE: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: 1,
  height: 1,
  margin: 0,
  padding: 0,
  overflow: "hidden",
  clipPath: "inset(50%)",
  border: 0,
  opacity: 0,
  pointerEvents: "none",
  zIndex: -1,
};

export function TurnstileWidget({ onToken, onError }: TurnstileWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const scriptLoadedRef = useRef(false);

  const renderWidget = useCallback(() => {
    if (!window.turnstile || !containerRef.current || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: (token: string) => {
        onToken(token);
      },
      "error-callback": () => {
        onError?.();
      },
      size: "invisible",
      appearance: "interaction-only",
      retry: "auto",
      "retry-interval": 5000,
    });
  }, [onToken, onError]);

  useEffect(() => {
    if (!SHOULD_ENABLE_TURNSTILE) return;

    // If Turnstile script is already loaded, render immediately
    if (window.turnstile) {
      renderWidget();
      return;
    }

    // Load the Turnstile script once
    if (!scriptLoadedRef.current) {
      scriptLoadedRef.current = true;

      window.onTurnstileLoad = () => {
        renderWidget();
      };

      const script = document.createElement("script");
      script.src =
        "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    return () => {
      // Clean up widget on unmount
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [renderWidget]);

  // Keep Turnstile disabled outside production by default
  // to avoid local Cloudflare challenge failures.
  if (!SHOULD_ENABLE_TURNSTILE) return null;

  return (
    <div ref={containerRef} style={HIDDEN_HOST_STYLE} aria-hidden="true" />
  );
}
