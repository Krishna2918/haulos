import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/desk/chips";
import { useHaul } from "@/lib/haulos/store";

export const Route = createFileRoute("/app/owner")({ component: Owner });

const MODULES = [
  "Today / Needs a Yes",
  "Dispatch sequence + illegal HOS lock",
  "Board email + EDI 204/990/214/210",
  "Bit Locker paper gates",
  "Box + SMS/WA/voice demo thread",
  "Logs / Samsara VG34",
  "Track + public one-load link",
  "Crew + hire + PIN",
  "Fleet dual status + DVIR",
  "Shop work orders",
  "Money invoices holds IFTA",
  "Driver/local phone scan",
  "Shipper track page",
  "Yard gate kiosk",
  "Connect catalog",
  "Kill switch + audit",
];

function Owner() {
  const kill = useHaul((s) => s.kill);
  const toggleKill = useHaul((s) => s.toggleKill);
  const connectors = useHaul((s) => s.connectors);
  const toggle = useHaul((s) => s.toggleConnect);
  const reset = useHaul((s) => s.resetDemo);
  const audit = useHaul((s) => s.audit);
  const users = useHaul((s) => s.users);
  const role = useHaul((s) => s.role);

  if (role !== "owner" && role !== "admin") {
    return <p className="text-sm text-muted">Owner seat only.</p>;
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Owner</h1>
        <p className="text-sm text-muted">Humans oversee. Agents suggest. No deploy, no live money, no live SMS.</p>
      </header>
      <section className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
        <h2 className="text-sm font-semibold">Kill switch</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["agents", "money", "outbound"] as const).map((k) => (
            <Button key={k} variant={kill[k] ? "danger" : "ghost"} onClick={() => toggleKill(k)}>
              {k} {kill[k] ? "OFF" : "on"}
            </Button>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted">Money starts frozen. Desk stays manual if agents die.</p>
      </section>
      <section>
        <h2 className="text-sm font-semibold">Connect</h2>
        <p className="text-xs text-muted">Self-serve keys. Demo toggles only.</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-2">
          {connectors.map((c) => (
            <li key={c.id} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-2 text-sm">
              <span>
                {c.name}
                <span className="block text-[11px] text-muted">{c.group}</span>
              </span>
              <button onClick={() => toggle(c.id)}>
                <Chip tone={c.on ? "ok" : "muted"}>{c.on ? "on" : "off"}</Chip>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-semibold">Users</h2>
        <ul className="mt-2 text-sm">
          {users.map((u) => (
            <li key={u.id} className="flex justify-between border-b border-line py-2">
              <span>{u.name}</span>
              <span className="font-mono text-xs text-muted">{u.email}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-semibold">OS checklist — live in this preview</h2>
        <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
          {MODULES.map((m) => (
            <li key={m} className="flex gap-2">
              <Chip tone="ok">live</Chip>
              {m}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-semibold">Audit</h2>
        <ul className="mt-2 max-h-48 overflow-auto font-mono text-xs">
          {audit.map((a) => (
            <li key={a.id}>
              {a.when} · {a.who} · {a.what}
            </li>
          ))}
        </ul>
      </section>
      <Button variant="danger" onClick={reset}>
        Reset demo
      </Button>
    </div>
  );
}
