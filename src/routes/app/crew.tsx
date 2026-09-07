import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/desk/chips";
import { useHaul } from "@/lib/haulos/store";
import { moneyExact } from "@/lib/utils";

export const Route = createFileRoute("/app/crew")({ component: Crew });

function Crew() {
  const role = useHaul((s) => s.role);
  const people = useHaul((s) => s.people);
  const hire = useHaul((s) => s.hireChen);
  const [q, setQ] = useState("");
  const [id, setId] = useState<string | null>(null);
  const scoped =
    role === "dispatcher"
      ? people.filter((p) => ["driver", "local", "helper"].includes(p.kind))
      : people;
  const list = scoped.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const p = people.find((x) => x.id === id);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Crew</h1>
        <p className="text-sm text-muted">
          {role === "dispatcher" ? "Drivers, locals, helpers only. No pay column." : "Office · Drivers · Helpers"}
        </p>
        <input
          className="mt-3 min-h-11 w-full max-w-sm rounded-[var(--radius-sm)] border border-line bg-paper px-3 text-sm"
          placeholder="Search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="mt-3 overflow-x-auto rounded-[var(--radius-md)] border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-raised text-xs uppercase text-muted">
              <tr>
                {["Name", "Job", "Status", "Med", "FAST", role === "dispatcher" ? "" : "Pay"].filter(Boolean).map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((row) => (
                <tr key={row.id} className="border-t border-line">
                  <td className="px-3 py-2">
                    <button className="text-navy" onClick={() => setId(row.id)}>
                      {row.name}
                    </button>
                  </td>
                  <td className="px-3 py-2">{row.kind}</td>
                  <td className="px-3 py-2">
                    <Chip tone={row.status === "active" ? "ok" : "warn"}>{row.status}</Chip>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{row.med || "—"}</td>
                  <td className="px-3 py-2">{row.fast ? "yes" : "—"}</td>
                  {role !== "dispatcher" && (
                    <td className="px-3 py-2 font-mono text-xs">
                      {row.rate ? `${row.payType} ${row.rate}${row.rateUnit}` : row.payType}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(role === "hr" || role === "owner") && people.find((x) => x.id === "p-chen")?.status === "leave" && (
          <Button className="mt-4" onClick={hire}>
            Hire P. Chen
          </Button>
        )}
      </section>
      {p && (
        <aside className="rounded-[var(--radius-md)] border border-line bg-raised p-4 text-sm">
          <h2 className="font-semibold">{p.name}</h2>
          <p className="text-muted">{p.kind} · {p.email}</p>
          <dl className="mt-3 space-y-1">
            <Row k="Phone" v={p.phone} />
            <Row k="CDL" v={p.cdl || "—"} />
            <Row k="CDL exp" v={p.cdlExp || "—"} />
            <Row k="Med" v={p.med || "—"} />
            <Row k="PIN" v={p.pin} />
            <Row k="Lang" v={p.lang} />
            {role !== "dispatcher" && <Row k="Hold" v={p.hold ? moneyExact(p.hold) : "—"} />}
          </dl>
        </aside>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="font-mono text-xs">{v}</dd>
    </div>
  );
}
