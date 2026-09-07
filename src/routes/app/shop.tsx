import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Chip, StatusChip } from "@/components/desk/chips";
import { useHaul } from "@/lib/haulos/store";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/app/shop")({ component: Shop });

function Shop() {
  const wos = useHaul((s) => s.wos);
  const trucks = useHaul((s) => s.trucks);
  const trailers = useHaul((s) => s.trailers);
  const close = useHaul((s) => s.closeWO);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Shop</h1>
        <p className="text-sm text-muted">Truck and trailer each have a status. DVIR fail opens a work order. Unplanned downtime $650–$1,000 / unit / day.</p>
      </header>
      <div className="grid gap-3">
        {wos.map((w) => {
          const t = trucks.find((x) => x.id === w.truckId);
          const tr = trailers.find((x) => x.id === w.trailerId);
          return (
            <article key={w.id} className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-sm">
                    {w.id}
                    {t ? ` · ${t.unit}` : ""}
                    {tr ? ` · ${tr.unit}` : ""}
                  </p>
                  <h2 className="font-semibold">{w.title}</h2>
                  <p className="text-sm text-muted">Parts: {w.parts} · ETA {w.eta}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {t && <StatusChip kind="truck" status={t.status} />}
                    {tr && <StatusChip kind="trailer" status={tr.status} />}
                  </div>
                </div>
                <Chip tone={w.status === "done" ? "ok" : "bad"}>{w.status}</Chip>
              </div>
              <p className="mt-2 text-sm">Downtime clock {money(w.downtime)} today.</p>
              {w.status !== "done" && (
                <Button className="mt-3" onClick={() => close(w.id)}>
                  Shop clear · DVIR signed
                </Button>
              )}
            </article>
          );
        })}
        {wos.length === 0 && <p className="text-sm text-muted">No open work.</p>}
      </div>
    </div>
  );
}
