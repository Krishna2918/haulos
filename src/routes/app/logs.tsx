import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/desk/chips";
import { useHaul } from "@/lib/haulos/store";

export const Route = createFileRoute("/app/logs")({ component: Logs });

const DUTY_COLOR: Record<string, string> = {
  off: "bg-line",
  sleeper: "bg-hold/50",
  drive: "bg-navy",
  on: "bg-warn/70",
};

function Logs() {
  const hos = useHaul((s) => s.hos);
  const people = useHaul((s) => s.people);
  const trucks = useHaul((s) => s.trucks);
  const token = useHaul((s) => s.samsaraToken);
  const setToken = useHaul((s) => s.setToken);
  const certify = useHaul((s) => s.certifyHos);
  const me = useHaul((s) => s.people.find((p) => p.id === s.personId));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Logs</h1>
        <p className="text-sm text-muted">Samsara is the only hours truth. No second ledger.</p>
      </header>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
        }}
      >
        <input
          className="min-h-11 min-w-56 flex-1 rounded-[var(--radius-sm)] border border-line bg-paper px-3 font-mono text-sm"
          placeholder="Samsara token (optional — blank keeps demo feed)"
          value={token}
          onChange={(e) => setToken(e.target.value)}
        />
        <Chip tone={token ? "ok" : "muted"}>{token ? "live path armed" : "demo VG34 feed"}</Chip>
      </form>
      {hos.map((h) => {
        const p = people.find((x) => x.id === h.personId);
        const t = trucks.find((x) => x.driverId === h.personId);
        const total = h.events.reduce((a, e) => a + e.hours, 0) || 24;
        return (
          <article key={h.personId} className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">
                {p?.name} · {t?.unit ?? "no unit"} · {h.ruleset}
              </p>
              <Chip tone={h.driveLeft < 3 ? "bad" : "ok"}>{h.driveLeft.toFixed(1)}h drive left</Chip>
            </div>
            <div className="mt-3 flex h-6 overflow-hidden rounded-[var(--radius-xs)]">
              {h.events.map((e, i) => (
                <div key={i} className={DUTY_COLOR[e.duty]} style={{ width: `${(e.hours / total) * 100}%` }} title={`${e.duty} ${e.hours}h`} />
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted">off · sleeper · drive · on-duty · cycle {h.cycleLeft.toFixed(0)}h</p>
            {(me?.id === h.personId || me?.kind === "dispatcher" || me?.kind === "owner") && !h.certified && (
              <Button className="mt-3" onClick={() => certify(h.personId)}>
                Certify day
              </Button>
            )}
            {h.certified && <p className="mt-2 text-xs text-ok">Certified</p>}
            {t?.unit === "T-003" && <p className="mt-2 text-sm text-bad">No reload after Toledo. Clock would break.</p>}
          </article>
        );
      })}
    </div>
  );
}
