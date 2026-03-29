type MiniMapProps = {
  lat: number;
  lon: number;
  radiusKm: number;
  name: string;
};

export function MiniMap({ lat, lon, radiusKm, name }: MiniMapProps) {
  const _zoom = radiusKm <= 5 ? 13 : radiusKm <= 20 ? 11 : 9;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${lon - 0.05},${lat - 0.04},${lon + 0.05},${lat + 0.04}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-border"
      style={{ height: 180 }}
    >
      <iframe
        title={`Map – ${name}`}
        src={src}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
      <div className="absolute bottom-1 right-1 bg-white/80 text-[10px] text-gray-500 px-1.5 py-0.5 rounded">
        © OpenStreetMap
      </div>
      {/* Radius label */}
      <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow">
        {radiusKm} km
      </div>
    </div>
  );
}
