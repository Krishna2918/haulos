import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useHaul } from "@/lib/haulos/store";
import { homePath } from "@/lib/haulos/roles";
import type { Role } from "@/lib/haulos/types";

export const Route = createFileRoute("/")({ component: Home });

const OFFICE: { role: Role; who: string; id: string; line: string }[] = [
  { role: "owner", who: "Priya", id: "p-priya", line: "Money, Yes, kill switch" },
  { role: "dispatcher", who: "Alex", id: "p-alex", line: "Floor: truck status + trailer status" },
  { role: "hr", who: "Jordan", id: "p-jordan", line: "People, med, hire" },
  { role: "backoffice", who: "Sam", id: "p-sam", line: "Invoices, locker, IFTA" },
  { role: "safety", who: "Riley", id: "p-riley", line: "Hours truth, DVIR, shop" },
  { role: "admin", who: "IT", id: "p-admin", line: "Connect, audit, kill" },
];

const FIELD: { role: Role; who: string; id: string; line: string }[] = [
  { role: "driver", who: "Alvarez", id: "p-alvarez", line: "T-003 loaded · TR-08 loaded" },
  { role: "driver", who: "Kowalski", id: "p-kowalski", line: "T-004 wait · TR-04 dwell" },
  { role: "driver", who: "Singh", id: "p-singh", line: "T-001 shop · TR-11 shop" },
  { role: "local", who: "Brar", id: "p-brar", line: "Pickup papers · PIN 6606" },
  { role: "helper", who: "Okonkwo", id: "p-okonkwo", line: "Yard assist · PIN 7707" },
  { role: "shop", who: "Diaz", id: "p-diaz", line: "WO-001 truck+trailer · TR-06 door" },
];

function Home() {
  const setRole = useHaul((s) => s.setRole);
  const loginPin = useHaul((s) => s.loginPin);
  const nav = useNavigate();
  const [unit, setUnit] = useState("T-003");
  const [pin, setPin] = useState("2202");
  const [err, setErr] = useState("");

  function open(role: Role, id: string) {
    setRole(role, id);
    nav({ to: homePath(role) });
  }

  return (
    <div className="min-h-dvh bg-paper">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-5 py-5">
        <span className="font-semibold tracking-tight text-navy">HaulOS</span>
        <Link to="/track/$code" params={{ code: "L-4402" }} className="text-sm text-muted hover:text-ink">
          Track a load
        </Link>
      </header>
      <section className="mx-auto max-w-5xl px-5 pb-16 pt-6">
        <p className="text-xs font-medium uppercase tracking-widest text-navy">Northline Freight · demo</p>
        <h1 className="mt-3 max-w-xl break-words text-4xl font-semibold leading-[1.1] tracking-tight md:text-5xl">
          Loads. Trucks. One Yes.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
          Every seat is its own desk. Dispatch runs the floor. Owner watches money. Drivers get a phone —
          one trip, next paper, hours, texts from Northline.
        </p>
        <h2 className="mt-10 text-xs font-medium uppercase tracking-widest text-muted">Office</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {OFFICE.map((s) => (
            <button
              key={s.id}
              onClick={() => open(s.role, s.id)}
              className="rounded-[var(--radius-md)] border border-line bg-raised p-4 text-left transition-opacity hover:opacity-90"
            >
              <p className="text-xs uppercase tracking-wide text-muted">{s.role}</p>
              <p className="mt-1 font-semibold">{s.who}</p>
              <p className="mt-1 text-sm text-muted">{s.line}</p>
            </button>
          ))}
        </div>
        <h2 className="mt-10 text-xs font-medium uppercase tracking-widest text-muted">Field · phone</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FIELD.map((s) => (
            <button
              key={s.id}
              onClick={() => open(s.role, s.id)}
              className="rounded-[var(--radius-md)] border border-line bg-raised p-4 text-left transition-opacity hover:opacity-90"
            >
              <p className="text-xs uppercase tracking-wide text-muted">{s.role}</p>
              <p className="mt-1 font-semibold">{s.who}</p>
              <p className="mt-1 text-sm text-muted">{s.line}</p>
            </button>
          ))}
        </div>
        <form
          className="mt-10 max-w-md rounded-[var(--radius-md)] border border-line bg-raised p-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (loginPin(unit, pin)) nav({ to: "/app/phone" });
            else setErr("Pass does not match. Try T-003 / 2202, LOCAL / 6606, SHOP / 8808.");
          }}
        >
          <p className="text-sm font-medium">Driver pass</p>
          <p className="mt-1 text-xs text-muted">Truck number + last four. LOCAL, SHOP, or HELPER for yard.</p>
          <div className="mt-3 flex gap-2">
            <input
              className="min-h-11 flex-1 rounded-[var(--radius-sm)] border border-line bg-paper px-3 text-sm"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              aria-label="Unit"
            />
            <input
              className="min-h-11 w-28 rounded-[var(--radius-sm)] border border-line bg-paper px-3 font-mono text-sm"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              aria-label="PIN"
            />
            <Button type="submit">Open</Button>
          </div>
          {err && <p className="mt-2 text-xs text-bad">{err}</p>}
        </form>
        <p className="mt-8 text-xs text-muted">Five trucks. Preview only. No live SMS, no money send.</p>
      </section>
    </div>
  );
}
