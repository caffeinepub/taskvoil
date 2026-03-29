import { useGeolocation } from "@/hooks/useGeolocation";
import { useNominatim } from "@/hooks/useNominatim";
import { useAuthStore } from "@/lib/auth-store";
import { useCountryStore } from "@/lib/country-store";
import { useTranslation } from "@/lib/i18n";
import { MapPin, Navigation, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const MAP_TEXTS: Record<string, Record<string, string>> = {
  fr: {
    title: "Trouver un pro près de moi",
    searchPlaceholder: "Rechercher une ville, adresse...",
    locateMe: "Me localiser",
    pros: "Professionnels",
    clients: "Clients",
    youAreHere: "Vous êtes ici",
    km: "km",
    noResults: "Aucun résultat",
    locating: "Localisation en cours...",
    locationError: "Position indisponible",
    legend: "Légende",
    permissionTitle: "Activer la localisation",
    permissionBody:
      "TaskVoilà souhaite utiliser votre position pour afficher les professionnels et clients près de vous, et calculer les distances. Votre position reste confidentielle.",
    permissionAllow: "Autoriser",
    permissionLater: "Plus tard",
    mapInfo:
      "Carte interactive — utilisez la barre de recherche ci-dessus pour trouver une zone.",
  },
  en: {
    title: "Find a pro near you",
    searchPlaceholder: "Search city, address...",
    locateMe: "Locate me",
    pros: "Professionals",
    clients: "Clients",
    youAreHere: "You are here",
    km: "km",
    noResults: "No results",
    locating: "Locating...",
    locationError: "Location unavailable",
    legend: "Legend",
    permissionTitle: "Enable location access",
    permissionBody:
      "TaskVoilà would like to use your location to show professionals and clients near you, and calculate distances. Your location stays private.",
    permissionAllow: "Allow",
    permissionLater: "Later",
    mapInfo: "Interactive map — use the search bar above to explore an area.",
  },
  de: {
    title: "Fachkraft in der Nähe finden",
    searchPlaceholder: "Stadt, Adresse suchen...",
    locateMe: "Standort ermitteln",
    pros: "Fachkräfte",
    clients: "Kunden",
    youAreHere: "Sie sind hier",
    km: "km",
    noResults: "Keine Ergebnisse",
    locating: "Standort wird ermittelt...",
    locationError: "Standort nicht verfügbar",
    legend: "Legende",
    permissionTitle: "Standortzugriff aktivieren",
    permissionBody:
      "TaskVoilà möchte Ihren Standort nutzen, um Fachkräfte und Kunden in Ihrer Nähe anzuzeigen.",
    permissionAllow: "Erlauben",
    permissionLater: "Später",
    mapInfo: "Interaktive Karte — nutzen Sie die Suchleiste oben.",
  },
  es: {
    title: "Encuentra un profesional cerca",
    searchPlaceholder: "Buscar ciudad, dirección...",
    locateMe: "Localizarme",
    pros: "Profesionales",
    clients: "Clientes",
    youAreHere: "Estás aquí",
    km: "km",
    noResults: "Sin resultados",
    locating: "Localizando...",
    locationError: "Ubicación no disponible",
    legend: "Leyenda",
    permissionTitle: "Activar acceso a ubicación",
    permissionBody:
      "TaskVoilà desea usar tu ubicación para mostrar profesionales y clientes cercanos.",
    permissionAllow: "Permitir",
    permissionLater: "Más tarde",
    mapInfo: "Mapa interactivo — usa la barra de búsqueda.",
  },
  it: {
    title: "Trova un professionista vicino",
    searchPlaceholder: "Cerca città, indirizzo...",
    locateMe: "Individuami",
    pros: "Professionisti",
    clients: "Clienti",
    youAreHere: "Sei qui",
    km: "km",
    noResults: "Nessun risultato",
    locating: "Localizzazione in corso...",
    locationError: "Posizione non disponibile",
    legend: "Legenda",
    permissionTitle: "Attiva accesso alla posizione",
    permissionBody:
      "TaskVoilà vorrebbe usare la tua posizione per mostrare professionisti e clienti vicini.",
    permissionAllow: "Consenti",
    permissionLater: "Più tardi",
    mapInfo: "Mappa interattiva — usa la barra di ricerca in alto.",
  },
  nl: {
    title: "Vind een professional bij jou in de buurt",
    searchPlaceholder: "Zoek stad, adres...",
    locateMe: "Lokaliseer mij",
    pros: "Professionals",
    clients: "Klanten",
    youAreHere: "U bent hier",
    km: "km",
    noResults: "Geen resultaten",
    locating: "Localiseren...",
    locationError: "Locatie niet beschikbaar",
    legend: "Legenda",
    permissionTitle: "Locatietoegang inschakelen",
    permissionBody:
      "TaskVoilà wil uw locatie gebruiken om professionals en klanten bij u in de buurt te tonen.",
    permissionAllow: "Toestaan",
    permissionLater: "Later",
    mapInfo: "Interactieve kaart — gebruik de zoekbalk hierboven.",
  },
  pt: {
    title: "Encontrar um profissional perto",
    searchPlaceholder: "Pesquisar cidade, endereço...",
    locateMe: "Localizar-me",
    pros: "Profissionais",
    clients: "Clientes",
    youAreHere: "Está aqui",
    km: "km",
    noResults: "Sem resultados",
    locating: "A localizar...",
    locationError: "Localização indisponível",
    legend: "Legenda",
    permissionTitle: "Ativar acesso à localização",
    permissionBody:
      "TaskVoilà gostaria de usar a sua localização para mostrar profissionais e clientes próximos.",
    permissionAllow: "Permitir",
    permissionLater: "Mais tarde",
    mapInfo: "Mapa interativo — use a barra de pesquisa acima.",
  },
  el: {
    title: "Βρες επαγγελματία κοντά σου",
    searchPlaceholder: "Αναζήτηση πόλης, διεύθυνσης...",
    locateMe: "Εντοπισμός",
    pros: "Επαγγελματίες",
    clients: "Πελάτες",
    youAreHere: "Είστε εδώ",
    km: "km",
    noResults: "Χωρίς αποτελέσματα",
    locating: "Εντοπισμός...",
    locationError: "Τοποθεσία μη διαθέσιμη",
    legend: "Υπόμνημα",
    permissionTitle: "Ενεργοποίηση πρόσβασης τοποθεσίας",
    permissionBody:
      "Η TaskVoilà θέλει να χρησιμοποιήσει την τοποθεσία σας για να εμφανίσει επαγγελματίες κοντά σας.",
    permissionAllow: "Αποδοχή",
    permissionLater: "Αργότερα",
    mapInfo: "Διαδραστικός χάρτης — χρησιμοποιήστε την αναζήτηση.",
  },
};

// Default map centers per country
const COUNTRY_CENTER: Record<string, [number, number]> = {
  fr: [47.0, 2.5],
  be: [50.5, 4.5],
  gb: [52.5, -1.5],
  ie: [53.2, -8.0],
  de: [51.0, 10.0],
  ch: [46.8, 8.2],
  es: [40.0, -3.5],
  it: [42.0, 12.5],
  pt: [39.5, -8.0],
  nl: [52.4, 5.3],
  gr: [38.5, 23.0],
};

function GeoPermissionDialog({
  tx,
  onAllow,
  onLater,
}: {
  tx: Record<string, string>;
  onAllow: () => void;
  onLater: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      data-ocid="map.location_dialog"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
          <MapPin className="h-7 w-7 text-amber-500" />
        </div>
        <h2 className="text-lg font-bold text-foreground text-center">
          {tx.permissionTitle}
        </h2>
        <p className="text-sm text-muted-foreground text-center leading-relaxed">
          {tx.permissionBody}
        </p>
        <div className="flex gap-3 w-full mt-1">
          <button
            type="button"
            data-ocid="map.location_dialog.cancel_button"
            onClick={onLater}
            className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            {tx.permissionLater}
          </button>
          <button
            type="button"
            data-ocid="map.location_dialog.confirm_button"
            onClick={onAllow}
            className="flex-1 h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            {tx.permissionAllow}
          </button>
        </div>
      </div>
    </div>
  );
}

export function MapPage() {
  const { lang } = useTranslation();
  const { selectedCountry } = useCountryStore();
  const { currentUser } = useAuthStore();
  const {
    position,
    loading: geoLoading,
    requestLocation,
  } = useGeolocation({ autoRequest: false });
  const { results, loading: searchLoading, search, clear } = useNominatim();
  const [searchInput, setSearchInput] = useState("");
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const [showPermDialog, setShowPermDialog] = useState(
    () => !sessionStorage.getItem("geo_permission_asked"),
  );

  const tx = MAP_TEXTS[lang] ?? MAP_TEXTS.en;

  const defaultCenter: [number, number] = selectedCountry
    ? (COUNTRY_CENTER[selectedCountry.toLowerCase()] ?? [48.8566, 2.3522])
    : [48.8566, 2.3522];

  const center =
    mapCenter ?? (position ? [position.lat, position.lon] : defaultCenter);
  const zoom = mapCenter ? 13 : position ? 13 : selectedCountry ? 6 : 5;

  const osmSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${center[1] - 1 / zoom},${center[0] - 0.7 / zoom},${center[1] + 1 / zoom},${center[0] + 0.7 / zoom}&layer=mapnik${position ? `&marker=${position.lat},${position.lon}` : mapCenter ? `&marker=${mapCenter[0]},${mapCenter[1]}` : ""}`;

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    if (position) {
      setMapCenter([position.lat, position.lon]);
    }
  }, [position]);

  function handleSearchChange(val: string) {
    setSearchInput(val);
    search(val);
    setShowDropdown(true);
  }

  function handleSuggestionClick(lat: string, lon: string, name: string) {
    setMapCenter([Number.parseFloat(lat), Number.parseFloat(lon)]);
    setSearchInput(name.split(",")[0]);
    setShowDropdown(false);
    clear();
  }

  function handlePermAllow() {
    sessionStorage.setItem("geo_permission_asked", "1");
    setShowPermDialog(false);
    requestLocation();
  }

  function handlePermLater() {
    sessionStorage.setItem("geo_permission_asked", "1");
    setShowPermDialog(false);
  }

  return (
    <div
      className="relative flex flex-col"
      style={{ height: "calc(100dvh - 64px)" }}
      data-ocid="map.page"
    >
      {showPermDialog && (
        <GeoPermissionDialog
          tx={tx}
          onAllow={handlePermAllow}
          onLater={handlePermLater}
        />
      )}

      {/* Search bar overlay */}
      <div className="absolute top-3 left-0 right-0 z-[1000] flex justify-center px-3 pointer-events-none">
        <div className="w-full max-w-lg pointer-events-auto" ref={searchRef}>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                data-ocid="map.search_input"
                type="text"
                value={searchInput}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => results.length > 0 && setShowDropdown(true)}
                placeholder={tx.searchPlaceholder}
                className="w-full h-11 pl-9 pr-8 rounded-xl border border-border bg-white/95 backdrop-blur text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    clear();
                    setShowDropdown(false);
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              data-ocid="map.locate_button"
              onClick={() => {
                sessionStorage.setItem("geo_permission_asked", "1");
                requestLocation();
              }}
              className="h-11 px-3 rounded-xl bg-white/95 backdrop-blur border border-border shadow-lg hover:bg-amber-50 transition-colors flex items-center gap-1.5 text-sm font-medium text-amber-700 whitespace-nowrap"
              disabled={geoLoading}
            >
              <Navigation className="h-4 w-4" />
              <span className="hidden sm:inline">
                {geoLoading ? tx.locating : tx.locateMe}
              </span>
            </button>
          </div>

          {/* Suggestions dropdown */}
          {showDropdown && (searchLoading || results.length > 0) && (
            <div
              className="mt-1 bg-white rounded-xl border border-border shadow-xl overflow-hidden"
              data-ocid="map.search_results"
            >
              {searchLoading && (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  <span className="animate-pulse">...</span>
                </div>
              )}
              {!searchLoading && results.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted-foreground">
                  {tx.noResults}
                </div>
              )}
              {results.map((r, i) => (
                <button
                  key={`${r.lat}-${r.lon}-${r.display_name.slice(0, 20)}`}
                  type="button"
                  data-ocid={`map.suggestion.${i + 1}`}
                  onClick={() =>
                    handleSuggestionClick(r.lat, r.lon, r.display_name)
                  }
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-amber-50 transition-colors text-left border-b border-border/30 last:border-0"
                >
                  <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  <span className="text-sm text-foreground line-clamp-1">
                    {r.display_name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-20 md:bottom-6 right-3 z-[1000] bg-white/95 backdrop-blur rounded-xl border border-border shadow-lg p-3 text-xs space-y-2">
        <p className="font-semibold text-foreground/70 uppercase tracking-wide text-[10px]">
          {tx.legend}
        </p>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-amber-400 border-2 border-white shadow flex items-center justify-center text-[9px]">
            ⚒
          </div>
          <span>{tx.pros}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow flex items-center justify-center text-[9px]">
            👤
          </div>
          <span>{tx.clients}</span>
        </div>
        {position && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow ring-2 ring-blue-200" />
            <span>{tx.youAreHere}</span>
          </div>
        )}
      </div>

      {/* OSM Embed Map */}
      <iframe
        key={`${center[0]}-${center[1]}-${zoom}`}
        title="TaskVoilà Map"
        src={osmSrc}
        className="w-full flex-1"
        style={{ border: 0, display: "block" }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      {/* Current user info overlay (bottom left) */}
      {currentUser && (
        <div className="absolute bottom-20 md:bottom-6 left-3 z-[1000] bg-white/95 backdrop-blur rounded-xl border border-border shadow-lg p-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-sm">
              👤
            </div>
            <div>
              <div className="font-semibold text-foreground text-sm">
                {currentUser.pseudo || currentUser.firstName}
              </div>
              <div className="text-muted-foreground">
                {currentUser.role === "pro"
                  ? tx.pros.slice(0, -1)
                  : tx.clients.slice(0, -1)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
