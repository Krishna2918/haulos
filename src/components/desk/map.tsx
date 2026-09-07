import { useHaul } from "@/lib/haulos/store";

function xy(lat: number, lng: number) {
  const x = ((lng + 84.2) / 5.4) * 100;
  const y = ((44.6 - lat) / 3.4) * 100;
  return { x: Math.min(98, Math.max(2, x)), y: Math.min(96, Math.max(4, y)) };
}

export function CorridorMap({ highlight }: { highlight?: string }) {
  const trucks = useHaul((s) => s.trucks);
  const trailers = useHaul((s) => s.trailers);
  const sites = useHaul((s) => s.sites);

  return (
    <div className="relative aspect-[16/10] overflow-hidden rounded-[var(--radius-md)] border border-line bg-[#c5d0c2]">
      <svg viewBox="0 0 100 62" className="h-full w-full">
        <path d="M8 50 C 22 48, 30 42, 38 38 S 52 28, 62 30 S 80 22, 92 18" fill="none" stroke="#5a5044" strokeWidth="2.2" />
        <path d="M38 38 C 44 44, 50 48, 58 52" fill="none" stroke="#5a5044" strokeWidth="1.4" />
        <text x="10" y="8" fontSize="3.2" fill="#5c6570">
          ON
        </text>
        <text x="70" y="56" fontSize="3.2" fill="#5c6570">
          MI / OH
        </text>
        {sites.map((s) => {
          const p = xy(s.lat, s.lng);
          return (
            <g key={s.id}>
              <circle cx={p.x} cy={p.y} r={s.kind === "border" ? 1.4 : 1.1} fill="#1e4f86" opacity={0.35} />
              <text x={p.x + 1.6} y={p.y + 0.8} fontSize="2.1" fill="#101820">
                {s.name.split(" ")[0]}
              </text>
            </g>
          );
        })}
        {trailers
          .filter((t) => !t.truckId)
          .map((t) => {
            const p = xy(t.lat, t.lng);
            return (
              <rect
                key={t.id}
                x={p.x - 1.1}
                y={p.y - 1.1}
                width="2.2"
                height="2.2"
                fill={t.status === "shop" ? "#9b2c2c" : t.status === "loaded" ? "#1e4f86" : "#8a5a12"}
              />
            );
          })}
        {trucks.map((t) => {
          const p = xy(t.lat, t.lng);
          const on = highlight === t.id;
          return (
            <g key={t.id}>
              <circle cx={p.x} cy={p.y} r={on ? 2.2 : 1.6} fill={t.status === "shop" ? "#9b2c2c" : "#1e4f86"} />
              <text x={p.x + 2} y={p.y - 1.4} fontSize="2.3" fontWeight={600} fill="#101820">
                {t.unit}
              </text>
            </g>
          );
        })}
      </svg>
      <p className="absolute bottom-2 left-3 text-[10px] text-muted">Round = truck · square = trailer · red = shop</p>
    </div>
  );
}
