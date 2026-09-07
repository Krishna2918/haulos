import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CorridorMap } from "@/components/desk/map";
import { Chip, StatusChip, trailerTone, truckTone } from "@/components/desk/chips";
import { useHaul } from "@/lib/haulos/store";

export const Route = createFileRoute("/app/track")({ component: Track });

function Track() {
  const trucks = useHaul((s) => s.trucks);
  const trailers = useHaul((s) => s.trailers);
  const orders = useHaul((s) => s.orders);
  const sites = useHaul((s) => s.sites);
  const [sel, setSel] = useState<string | undefined>(trucks.find((t) => t.status === "loaded")?.id);
  const loose = trailers.filter((t) => !t.truckId);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Track</h1>
        <p className="text-sm text-muted">Truck status and trailer status are not the same. Public link is one load, not the fleet.</p>
      </header>
      <CorridorMap highlight={sel} />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-muted">Truck</span>
        {["loaded", "empty", "shop", "wait"].map((s) => (
          <Chip key={s} tone={truckTone(s)}>
            {s} {trucks.filter((t) => t.status === s).length}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] uppercase tracking-wide text-muted">Trailer</span>
        {["loaded", "hooked", "yard", "dwell", "shop"].map((s) => (
          <Chip key={s} tone={trailerTone(s)}>
            {s} {trailers.filter((t) => t.status === s).length}
          </Chip>
        ))}
      </div>
      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-raised text-xs uppercase text-muted">
            <tr>
              {["Truck", "T status", "Trailer", "TR status", "Where", "Load", "Public"].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trucks.map((t) => {
              const tr = trailers.find((x) => x.id === t.trailerId);
              const o = orders.find((x) => x.id === t.loadId);
              return (
                <tr key={t.id} className="border-t border-line" onClick={() => setSel(t.id)}>
                  <td className="px-3 py-2 font-mono">{t.unit}</td>
                  <td className="px-3 py-2">
                    <StatusChip kind="truck" status={t.status} />
                  </td>
                  <td className="px-3 py-2 font-mono">{tr?.unit ?? "—"}</td>
                  <td className="px-3 py-2">
                    <StatusChip kind="trailer" status={tr?.status} />
                  </td>
                  <td className="px-3 py-2">{t.where}</td>
                  <td className="px-3 py-2 font-mono">{o?.code ?? "—"}</td>
                  <td className="px-3 py-2">
                    {o && (
                      <Link className="text-navy" to="/track/$code" params={{ code: o.track }}>
                        {o.track}
                      </Link>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {loose.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-semibold">Trailers not hooked</h2>
          <ul className="grid gap-2 sm:grid-cols-3">
            {loose.map((tr) => (
              <li key={tr.id} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-2 text-sm">
                <span>
                  <span className="font-mono">{tr.unit}</span>
                  <span className="text-muted"> · {tr.where}</span>
                </span>
                <StatusChip kind="trailer" status={tr.status} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <p className="text-xs text-muted">
        Geofences: {sites.map((s) => s.name).join(" · ")}. Fence events write 214 when live GPS is on.
      </p>
    </div>
  );
}
