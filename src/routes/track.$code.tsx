import { createFileRoute, Link } from "@tanstack/react-router";
import { Chip, StatusChip } from "@/components/desk/chips";
import { CorridorMap } from "@/components/desk/map";
import { useHaul } from "@/lib/haulos/store";
import { STEP_LABEL } from "@/lib/haulos/sequence";

export const Route = createFileRoute("/track/$code")({ component: PublicTrack });

function PublicTrack() {
  const { code } = Route.useParams();
  const o = useHaul((s) => s.orders.find((x) => x.track === code || x.code === code));
  const truck = useHaul((s) => s.trucks.find((t) => t.id === o?.truckId));
  const trailer = useHaul((s) => s.trailers.find((t) => t.id === o?.trailerId));
  if (!o) {
    return (
      <div className="mx-auto max-w-lg p-8">
        <p className="text-sm">No load for that code.</p>
        <Link to="/" className="text-navy">
          HaulOS
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl p-6">
      <p className="text-xs uppercase tracking-wide text-navy">Northline Freight · public track</p>
      <h1 className="mt-2 text-2xl font-semibold">{o.code}</h1>
      <p className="text-muted">
        {o.from} → {o.to}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Chip tone="navy">{STEP_LABEL[o.step]}</Chip>
        {truck && (
          <span className="text-sm">
            <span className="font-mono">{truck.unit}</span> <StatusChip kind="truck" status={truck.status} />
          </span>
        )}
        {trailer && (
          <span className="text-sm">
            <span className="font-mono">{trailer.unit}</span> <StatusChip kind="trailer" status={trailer.status} />
          </span>
        )}
      </div>
      <div className="mt-4">
        <CorridorMap highlight={o.truckId ?? undefined} />
      </div>
      <p className="mt-3 text-sm">Window {o.window}. One load only — not the fleet.</p>
      {o.step === "done" && <p className="mt-2 text-sm text-ok">Delivered. POD in locker.</p>}
      <Link to="/" className="mt-6 inline-block text-sm text-navy">
        Back
      </Link>
    </div>
  );
}