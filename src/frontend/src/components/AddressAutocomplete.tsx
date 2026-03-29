import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface NominatimResult {
  display_name: string;
  address: {
    road?: string;
    house_number?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    country_code?: string;
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (result: NominatimResult) => void;
  placeholder?: string;
  countryCode?: string;
  className?: string;
  id?: string;
  "data-ocid"?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder,
  countryCode,
  className,
  id,
  "data-ocid": dataOcid,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleChange = (val: string) => {
    onChange(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const cc = countryCode?.toLowerCase();
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(val)}${cc ? `&countrycodes=${cc}` : ""}`;
        const res = await fetch(url, {
          headers: { "Accept-Language": cc === "fr" ? "fr" : "en" },
        });
        const data: NominatimResult[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleSelect = (result: NominatimResult) => {
    onChange(result.display_name);
    onSelect?.(result);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          id={id}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`pl-9 ${className ?? ""}`}
          data-ocid={dataOcid}
          autoComplete="off"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-pulse">
            ...
          </span>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-border rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {suggestions.map((s) => (
            <li
              key={s.display_name}
              className="px-4 py-2.5 text-sm cursor-pointer hover:bg-amber-50 border-b last:border-b-0 border-border/40 truncate"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(s);
              }}
              title={s.display_name}
            >
              <span className="text-amber-600 mr-1.5">📍</span>
              {s.display_name.length > 60
                ? `${s.display_name.slice(0, 60)}…`
                : s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
