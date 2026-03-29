import { useEffect, useState } from "react";

/**
 * SwUpdateBanner
 * Listens for the custom 'sw-update-available' event dispatched by index.html
 * when the service worker activates a new version.
 */
export function SwUpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener("sw-update-available", handler);
    return () => window.removeEventListener("sw-update-available", handler);
  }, []);

  if (!show) return null;

  return (
    <output className="sw-update-banner" aria-live="polite">
      <span>Nouvelle version disponible</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="bg-white text-blue-800 font-semibold text-sm px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
      >
        Actualiser
      </button>
      <button
        type="button"
        onClick={() => setShow(false)}
        aria-label="Fermer"
        className="text-white/70 hover:text-white text-lg leading-none"
      >
        ✕
      </button>
    </output>
  );
}
