"use client";

// components/security/TurnstileWidget.tsx
// Invisible Cloudflare Turnstile widget.
// Renders nothing visible — silently obtains a token in the background.
// Parent reads the token via the callback or the ref.

import { useEffect, useRef, useCallback } from "react";

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
    // If no site key configured, skip (dev mode)
    if (!SITE_KEY) return;

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

  // Don't render anything if no site key (dev mode)
  if (!SITE_KEY) return null;

  return (
    <div
      ref={containerRef}
      style={{ position: "absolute", left: "-9999px", width: 0, height: 0 }}
      aria-hidden="true"
    />
  );
}
