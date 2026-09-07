import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip, StatusChip } from "@/components/desk/chips";
import { Floor } from "@/components/desk/homes";
import { useHaul } from "@/lib/haulos/store";
import { canAssign, canLeaveYard, missingPickup, nextHint, STEP_LABEL, trueNet } from "@/lib/haulos/sequence";
import { money } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/app/dispatch")({ component: Dispatch });

function Dispatch() {
  const orders = useHaul((s) => s.orders);
  const trucks = useHaul((s) => s.trucks);
  const trailers = useHaul((s) => s.trailers);
  const people = useHaul((s) => s.people);
  const rates = useHaul((s) => s.rates);
  const [sel, setSel] = useState(orders[0]?.id ?? "");
  const o = orders.find((x) => x.id === sel) ?? orders[0];
  const assign = useHaul((s) => s.assignOrder);
  const complete = useHaul((s) => s.completeOrder);
  const leave = useHaul((s) => s.leaveYard);
  const fuel = rates.find((r) => r.label === "Fuel")?.amount ?? 0.42;
  const drv = rates.find((r) => r.label === "Driver")?.amount ?? 0.55;

  const [truckId, setTruckId] = useState("t-002");
  const [trailerId, setTrailerId] = useState("tr-09");
  const [driverId, setDriverId] = useState("p-patel");
  const [localId, setLocalId] = useState("p-brar");

  if (!o) return <p>No orders.</p>;
  const truck = trucks.find((t) => t.id === (o.truckId ?? truckId));
  const trailer = trailers.find((t) => t.id === (o.trailerId ?? trailerId));
  const block = o.step === "ready" || o.step === "incomplete" ? canAssign(o, truck, trailer) : canLeaveYard(o);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Dispatch</h1>
        <p className="text-sm text-muted">Truck status and trailer status are not the same. Sequence is the trip.</p>
        <div className="mt-4 overflow-x-auto rounded-[var(--radius-md)] border border-line">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-raised text-xs uppercase text-muted">
              <tr>
                {["Load", "Lane", "Step", "Truck", "Trailer", "Rate", ""].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.filter((x) => x.status !== "done").map((row) => {
                const t = trucks.find((x) => x.id === row.truckId);
                const tr = trailers.find((x) => x.id === row.trailerId);
                return (
                  <tr
                    key={row.id}
                    className={`border-t border-line ${row.id === o.id ? "bg-navy/5" : ""}`}
                  >
                    <td className="px-3 py-2 font-mono">{row.code}</td>
                    <td className="px-3 py-2">
                      {row.from} → {row.to}
                    </td>
                    <td className="px-3 py-2">
                      <Chip tone={row.step === "incomplete" ? "warn" : "navy"}>{STEP_LABEL[row.step]}</Chip>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono">{t?.unit ?? "—"}</span>{" "}
                      <StatusChip kind="truck" status={t?.status} />
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono">{tr?.unit ?? "—"}</span>{" "}
                      <StatusChip kind="trailer" status={tr?.status} />
                    </td>
                    <td className="px-3 py-2 font-mono">{money(row.rate)}</td>
                    <td className="px-3 py-2">
                      <Button variant="quiet" onClick={() => setSel(row.id)}>
                        Open
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <Floor />
        </div>
      </section>
      <aside className="space-y-4 rounded-[var(--radius-md)] border border-line bg-raised p-4">
        <p className="font-mono text-sm text-navy">{o.code}</p>
        <h2 className="text-lg font-semibold">
          {o.shipper}
          <span className="block text-sm font-normal text-muted">
            {o.from} → {o.to}
          </span>
        </h2>
        <p className="text-sm">{nextHint(o)}</p>
        <p className="text-xs text-muted">
          Window {o.window} · {o.miles} mi · empty {o.emptyKm} km · true net{" "}
          {money(trueNet(o, fuel, drv))}
        </p>
        {o.step === "incomplete" && (
          <Button
            onClick={() =>
              complete(o.id, {
                truckId: "t-005",
                trailerId: "tr-07",
                localId: "p-brar",
                rate: o.rate || 1550,
                from: o.from || "Magna Brampton",
                to: o.to || "GM Lansing",
                window: o.window || "06:00",
              })
            }
          >
            Fill rest / Save
          </Button>
        )}
        {(o.step === "ready" || (o.step === "assigned" && !o.dispatchNo)) && (
          <div className="space-y-2">
            <Field
              label="Truck"
              value={truckId}
              onChange={setTruckId}
              options={trucks.map((t) => [t.id, `${t.unit} · ${t.status}`])}
            />
            <Field
              label="Trailer"
              value={trailerId}
              onChange={setTrailerId}
              options={trailers.map((t) => [t.id, `${t.unit} · ${t.status}`])}
            />
            <Field
              label="Highway"
              value={driverId}
              onChange={setDriverId}
              options={people.filter((p) => p.kind === "driver").map((p) => [p.id, p.name])}
            />
            <Field
              label="Local"
              value={localId}
              onChange={setLocalId}
              options={people.filter((p) => p.kind === "local").map((p) => [p.id, p.name])}
            />
            <Button
              variant="yes"
              onClick={() => {
                const err = assign(o.id, truckId, trailerId, driverId, localId);
                if (err) toast.error(err);
              }}
            >
              Yes · assign
            </Button>
            {block && <p className="text-xs text-bad">{block}</p>}
          </div>
        )}
        {o.step === "assigned" || o.step === "pickup" ? (
          <div>
            <p className="text-xs font-medium uppercase text-muted">Pickup papers</p>
            <ul className="mt-1 text-sm">
              {o.papers
                .filter((p) => p.at === "pickup")
                .map((p) => (
                  <li key={p.name}>
                    {p.scanned ? "In · " : "Missing · "}
                    {p.name}
                  </li>
                ))}
            </ul>
            {missingPickup(o).length === 0 && !o.departed && (
              <Button
                className="mt-3"
                onClick={() => {
                  const err = leave(o.id);
                  if (err) toast.error(err);
                }}
              >
                Highway leave yard
              </Button>
            )}
          </div>
        ) : null}
        <p className="text-xs text-muted">
          Dispatch {o.dispatchNo ?? "—"} · OTIF {o.otif} · {o.route || "no route yet"}
        </p>
      </aside>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <select
        className="mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm text-ink"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map(([id, name]) => (
          <option key={id} value={id}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}
