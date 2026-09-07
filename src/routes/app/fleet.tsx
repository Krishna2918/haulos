import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusChip } from "@/components/desk/chips";
import { useHaul } from "@/lib/haulos/store";

export const Route = createFileRoute("/app/fleet")({ component: Fleet });

function Fleet() {
  const trucks = useHaul((s) => s.trucks);
  const trailers = useHaul((s) => s.trailers);
  const dvirs = useHaul((s) => s.dvirs);
  const run = useHaul((s) => s.dvir);
  const me = useHaul((s) => s.people.find((p) => p.id === s.personId));
  const [sel, setSel] = useState<{ kind: "truck" | "trailer"; id: string }>({ kind: "truck", id: trucks[0]?.id ?? "" });
  const t = sel.kind === "truck" ? trucks.find((x) => x.id === sel.id) : undefined;
  const tr = sel.kind === "trailer" ? trailers.find((x) => x.id === sel.id) : trailers.find((x) => x.id === t?.trailerId);
  const hookedTruck = tr ? trucks.find((x) => x.id === tr.truckId) : undefined;
  const canDvir =
    me?.kind === "shop" ||
    me?.kind === "owner" ||
    me?.kind === "safety" ||
    (me?.kind === "driver" && (me.truckId === t?.id || me.truckId === hookedTruck?.id));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight">Fleet</h1>
          <p className="text-sm text-muted">Truck status and trailer status are not the same. Plate lives here, not on dispatch.</p>
        </header>
        <div>
          <h2 className="mb-2 text-sm font-semibold">Trucks</h2>
          <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-raised text-xs uppercase text-muted">
                <tr>
                  {["Unit", "Plate", "Status", "Trailer", "Odo", "Fault"].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trucks.map((row) => {
                  const hooked = trailers.find((x) => x.id === row.trailerId);
                  return (
                    <tr key={row.id} className="border-t border-line">
                      <td className="px-3 py-2">
                        <button className="font-mono text-navy" onClick={() => setSel({ kind: "truck", id: row.id })}>
                          {row.unit}
                        </button>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{row.plate}</td>
                      <td className="px-3 py-2">
                        <StatusChip kind="truck" status={row.status} />
                      </td>
                      <td className="px-3 py-2">
                        {hooked ? (
                          <>
                            <span className="font-mono">{hooked.unit}</span>{" "}
                            <StatusChip kind="trailer" status={hooked.status} />
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2 font-mono">{row.odo.toLocaleString()}</td>
                      <td className="px-3 py-2 text-muted">{row.fault || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <h2 className="mb-2 text-sm font-semibold">Trailers</h2>
          <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="bg-raised text-xs uppercase text-muted">
                <tr>
                  {["Unit", "Kind", "Plate", "Status", "Hooked to", "Where", "Fault"].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trailers.map((row) => {
                  const power = trucks.find((x) => x.id === row.truckId);
                  return (
                    <tr key={row.id} className="border-t border-line">
                      <td className="px-3 py-2">
                        <button className="font-mono text-navy" onClick={() => setSel({ kind: "trailer", id: row.id })}>
                          {row.unit}
                        </button>
                      </td>
                      <td className="px-3 py-2">{row.kind}</td>
                      <td className="px-3 py-2 font-mono text-xs">{row.plate}</td>
                      <td className="px-3 py-2">
                        <StatusChip kind="trailer" status={row.status} />
                      </td>
                      <td className="px-3 py-2 font-mono">{power?.unit ?? "—"}</td>
                      <td className="px-3 py-2">{row.where}</td>
                      <td className="px-3 py-2 text-muted">{row.fault || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {t && (
        <aside className="rounded-[var(--radius-md)] border border-line bg-raised p-4 text-sm">
          <h2 className="font-semibold">
            {t.unit} · {t.year} {t.make}
          </h2>
          <p className="text-muted">{t.vin}</p>
          <div className="mt-2">
            <StatusChip kind="truck" status={t.status} />
          </div>
          <ul className="mt-3 space-y-1 text-xs">
            <li>Plate {t.plate} due {t.plateDue}</li>
            <li>ELD {t.eld}</li>
            <li>Fuel {t.fuelCard}</li>
            <li>Oil {t.oilDue} · PM {t.nextPm}</li>
            <li>Tires {t.tires}</li>
            <li>
              Hooked {tr?.unit ?? "none"} {tr ? `· ${tr.status}` : ""}
            </li>
          </ul>
          {canDvir && (
            <div className="mt-4 flex gap-2">
              <Button onClick={() => run({ truckId: t.id }, "pass", "Pre-trip ok")}>Truck DVIR pass</Button>
              <Button variant="danger" onClick={() => run({ truckId: t.id }, "fail", "Defect found")}>
                Truck DVIR fail
              </Button>
            </div>
          )}
          <h3 className="mt-4 text-xs uppercase text-muted">Last DVIR</h3>
          {dvirs
            .filter((d) => d.truckId === t.id)
            .slice(0, 3)
            .map((d) => (
              <p key={d.id} className="text-xs">
                {d.result} · {d.note} · {d.by}
              </p>
            ))}
        </aside>
      )}
      {!t && tr && (
        <aside className="rounded-[var(--radius-md)] border border-line bg-raised p-4 text-sm">
          <h2 className="font-semibold">
            {tr.unit} · {tr.kind}
          </h2>
          <p className="text-muted">{tr.plate}</p>
          <div className="mt-2">
            <StatusChip kind="trailer" status={tr.status} />
          </div>
          <ul className="mt-3 space-y-1 text-xs">
            <li>Where {tr.where}</li>
            <li>PM {tr.nextPm}</li>
            <li>Hooked to {hookedTruck?.unit ?? "none"}</li>
            <li>Fault {tr.fault || "none"}</li>
          </ul>
          {canDvir && (
            <div className="mt-4 flex gap-2">
              <Button onClick={() => run({ trailerId: tr.id }, "pass", "Trailer walk ok")}>Trailer DVIR pass</Button>
              <Button variant="danger" onClick={() => run({ trailerId: tr.id }, "fail", "Trailer defect")}>
                Trailer DVIR fail
              </Button>
            </div>
          )}
          <h3 className="mt-4 text-xs uppercase text-muted">Last DVIR</h3>
          {dvirs
            .filter((d) => d.trailerId === tr.id)
            .slice(0, 3)
            .map((d) => (
              <p key={d.id} className="text-xs">
                {d.result} · {d.note} · {d.by}
              </p>
            ))}
        </aside>
      )}
    </div>
  );
}
