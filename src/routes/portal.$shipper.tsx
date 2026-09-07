import { createFileRoute, Link } from "@tanstack/react-router";
import { Chip } from "@/components/desk/chips";
import { useHaul } from "@/lib/haulos/store";
import { STEP_LABEL } from "@/lib/haulos/sequence";

export const Route = createFileRoute("/portal/$shipper")({ component: Portal });

function Portal() {
  const { shipper } = Route.useParams();
  const key = decodeURIComponent(shipper).toLowerCase();
  const all = useHaul((s) => s.orders);
  const orders = all.filter(
    (o) => o.shipper.toLowerCase().includes(key) || key.includes(o.shipper.split(" ")[0].toLowerCase()),
  );
  return (
    <div className="mx-auto max-w-2xl p-6">
      <p className="text-xs uppercase tracking-wide text-navy">Shipper glass</p>
      <h1 className="text-2xl font-semibold">{decodeURIComponent(shipper)}</h1>
      <p className="text-sm text-muted">ETA, sequence, POD. No hours. No pay.</p>
      <ul className="mt-4 space-y-3">
        {orders.map((o) => (
          <li key={o.id} className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
            <div className="flex items-center justify-between">
              <p className="font-mono">{o.code}</p>
              <Chip tone="navy">{STEP_LABEL[o.step]}</Chip>
            </div>
            <p className="text-sm">
              {o.from} → {o.to} · {o.window}
            </p>
            <Link className="text-sm text-navy" to="/track/$code" params={{ code: o.track }}>
              Map
            </Link>
          </li>
        ))}
        {orders.length === 0 && <p className="text-sm">No loads on this portal.</p>}
      </ul>
    </div>
  );
}
