/**
 * Cloudflare Turnstile invisible widget integration.
 * Sitekey: 1x00000000000000000000AA (test key - always passes)
 * In production, replace with real sitekey via environment variable.
 */
import { useCallback, useEffect, useRef, useState } from "react";

const TURNSTILE_SITEKEY =
  import.meta.env.VITE_TURNSTILE_SITEKEY ?? "1x00000000000000000000AA";
const TURNSTILE_SCRIPT_URL =
  "https://challenges.cloudflare.com/turnstile/v0/api.js";

let scriptLoaded = false;
let scriptLoading = false;
const scriptCallbacks: (() => void)[] = [];

function loadTurnstileScript(): Promise<void> {
  return new Promise((resolve) => {
    if (scriptLoaded) {
      resolve();
      return;
    }

    scriptCallbacks.push(resolve);

    if (scriptLoading) return;
    scriptLoading = true;

    const script = document.createElement("script");
    script.src = `${TURNSTILE_SCRIPT_URL}?render=explicit`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      for (const cb of scriptCallbacks) cb();
      scriptCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: string | HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          size?: "normal" | "compact" | "invisible";
          appearance?: "always" | "execute" | "interaction-only";
          execution?: "render" | "execute";
        },
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      execute: (widgetId: string) => void;
    };
  }
}

/**
 * React hook to integrate Cloudflare Turnstile invisible widget.
 * @param containerId - The ID of the div element that will host the widget.
 */
export function useTurnstile(containerId: string) {
  const [token, setToken] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const widgetIdRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    setToken(null);
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch {
        // Widget may already be removed
      }
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    async function init() {
      await loadTurnstileScript();
      if (!mounted) return;

      const container = document.getElementById(containerId);
      if (!container || !window.turnstile) return;

      // Clean up existing widget
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore
        }
        widgetIdRef.current = null;
      }

      try {
        widgetIdRef.current = window.turnstile.render(container, {
          sitekey: TURNSTILE_SITEKEY,
          size: "invisible",
          appearance: "interaction-only",
          execution: "render",
          callback: (t: string) => {
            if (mounted) setToken(t);
          },
          "expired-callback": () => {
            if (mounted) setToken(null);
          },
          "error-callback": () => {
            // On error, allow submission (graceful degradation)
            if (mounted) setToken("error-bypass");
          },
        });
        if (mounted) setIsReady(true);
      } catch {
        // Graceful degradation: mark ready even if widget fails
        if (mounted) {
          setIsReady(true);
          setToken("init-bypass");
        }
      }
    }

    init();

    return () => {
      mounted = false;
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // Ignore
        }
      }
    };
  }, [containerId]);

  return { token, reset, isReady };
}
