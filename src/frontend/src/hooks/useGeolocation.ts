import { useAuthStore } from "@/lib/auth-store";
import { useEffect, useState } from "react";
import { geocodeAddress } from "./useNominatim";

export type GeoPosition = {
  lat: number;
  lon: number;
  source: "gps" | "address" | null;
};

export function useGeolocation(options?: { autoRequest?: boolean }) {
  const { currentUser } = useAuthStore();
  const [position, setPosition] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestLocation() {
    setLoading(true);
    setError(null);

    // 1. Try browser GPS
    if ("geolocation" in navigator) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 8000,
            maximumAge: 60000,
          }),
        );
        setPosition({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          source: "gps",
        });
        setLoading(false);
        return;
      } catch {
        // fall through to address fallback
      }
    }

    // 2. Fallback: geocode profile address
    const addr = [
      currentUser?.address,
      currentUser?.postalCode,
      currentUser?.city,
    ]
      .filter(Boolean)
      .join(", ");

    if (addr) {
      const geo = await geocodeAddress(addr);
      if (geo) {
        setPosition({ ...geo, source: "address" });
        setLoading(false);
        return;
      }
    }

    setError("location_unavailable");
    setLoading(false);
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    if (options?.autoRequest !== false) {
      requestLocation();
    }
  }, []);

  return { position, loading, error, requestLocation };
}
