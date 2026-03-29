// Validate postal code + city + country using Nominatim OSM API
// Returns { valid: boolean, suggestion?: string, error?: string }
// Falls back to per-country regex if API is unreachable

const POSTAL_REGEX: Record<string, RegExp> = {
  FR: /^\d{5}$/,
  BE: /^\d{4}$/,
  GB: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
  DE: /^\d{5}$/,
  ES: /^\d{5}$/,
  IE: /^[A-Z]\d{2} ?[A-Z0-9]{4}$/i,
  LU: /^(L-?)?\d{4}$/i,
  NL: /^\d{4} ?[A-Z]{2}$/i,
  IT: /^\d{5}$/,
  PT: /^\d{4}-\d{3}$/,
  GR: /^\d{5}$/,
  CH: /^\d{4}$/,
};

export interface AddressValidationResult {
  valid: boolean;
  suggestion?: string;
  error?: string;
}

export async function validateAddress(params: {
  postalCode: string;
  city: string;
  countryCode: string;
}): Promise<AddressValidationResult> {
  const { postalCode, city, countryCode } = params;

  if (!postalCode || postalCode.trim().length < 2) {
    return { valid: false, error: "postalCodeEmpty" };
  }

  // Try Nominatim API first
  try {
    const query = encodeURIComponent(`${postalCode} ${city} ${countryCode}`);
    const url = `https://nominatim.openstreetmap.org/search?q=${query}&countrycodes=${countryCode.toLowerCase()}&postalcode=${encodeURIComponent(postalCode)}&format=json&limit=3&addressdetails=1`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "Accept-Language": "fr,en;q=0.9",
        "User-Agent": "TaskVoila/1.0",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) throw new Error("Nominatim API error");

    const data = (await response.json()) as Array<{
      display_name: string;
      address?: {
        postcode?: string;
        city?: string;
        town?: string;
        village?: string;
        country_code?: string;
      };
    }>;

    if (data.length > 0) {
      const firstResult = data[0];
      const suggestion =
        firstResult.address?.city ??
        firstResult.address?.town ??
        firstResult.address?.village;
      return {
        valid: true,
        suggestion: suggestion ?? undefined,
      };
    }

    // No results from Nominatim — fall back to regex
    return fallbackRegexValidation(postalCode, countryCode);
  } catch {
    // API unreachable or aborted — fall back to regex
    return fallbackRegexValidation(postalCode, countryCode);
  }
}

function fallbackRegexValidation(
  postalCode: string,
  countryCode: string,
): AddressValidationResult {
  const regex = POSTAL_REGEX[countryCode];
  if (!regex) {
    // Unknown country — accept if non-empty
    return { valid: postalCode.trim().length > 0 };
  }

  if (regex.test(postalCode.trim())) {
    return { valid: true };
  }

  return { valid: false, error: "postalCodeInvalid" };
}
