import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/desk/chips";
import { useHaul } from "@/lib/haulos/store";
import { money, moneyExact } from "@/lib/utils";

export const Route = createFileRoute("/app/money")({ component: Money });

function Money() {
  const invoices = useHaul((s) => s.invoices);
  const pays = useHaul((s) => s.pays);
  const people = useHaul((s) => s.people);
  const rates = useHaul((s) => s.rates);
  const ifta = useHaul((s) => s.ifta);
  const send = useHaul((s) => s.sendInvoice);
  const release = useHaul((s) => s.releaseHold);
  const updateRate = useHaul((s) => s.updateRate);
  const role = useHaul((s) => s.role);
  const kill = useHaul((s) => s.kill);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Money</h1>
        <p className="text-sm text-muted">
          Invoice after POD. Dual-control on send. {kill.money ? "Kill switch: money frozen." : "Send is live in demo only as a status flip."}
        </p>
      </header>
      <section>
        <h2 className="text-sm font-semibold">Invoices</h2>
        <div className="mt-2 overflow-x-auto rounded-[var(--radius-md)] border border-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-raised text-xs uppercase text-muted">
              <tr>
                {["ID", "Load", "Who", "Amount", "Status", ""].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {invoices.map((i) => (
                <tr key={i.id} className="border-t border-line">
                  <td className="px-3 py-2 font-mono">{i.id}</td>
                  <td className="px-3 py-2 font-mono">{i.loadId}</td>
                  <td className="px-3 py-2">{i.who}</td>
                  <td className="px-3 py-2 font-mono">{moneyExact(i.amount)}</td>
                  <td className="px-3 py-2">
                    <Chip tone={i.status === "sent" ? "ok" : "warn"}>{i.status}</Chip>
                  </td>
                  <td className="px-3 py-2">
                    {i.status === "draft" && (
                      <Button onClick={() => send(i.id)}>Send</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="text-sm font-semibold">Settlements / holds</h2>
        <ul className="mt-2 space-y-2">
          {pays.map((p) => {
            const who = people.find((x) => x.id === p.personId);
            return (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-2 text-sm">
                <span>
                  {who?.name} · {who?.payType} · {money(p.amount)}
                  {p.hold ? ` · hold ${money(p.hold)}` : ""}
                </span>
                {p.hold > 0 && role === "owner" && (
                  <Button variant="ghost" onClick={() => release(p.personId)}>
                    Release hold
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-semibold">Rate card</h2>
        <p className="text-xs text-muted">Driver rates: HR or owner only.</p>
        <ul className="mt-2 grid gap-2 sm:grid-cols-3">
          {rates.map((r) => (
            <li key={r.id} className="rounded-[var(--radius-sm)] border border-line bg-raised p-3 text-sm">
              <p className="text-xs text-muted">{r.label}</p>
              <p className="font-mono">
                {r.amount}
                {r.unit}
              </p>
              {(role === "owner" || role === "hr") && (
                <button className="mt-1 text-xs text-navy" onClick={() => updateRate(r.id, +(r.amount + 0.01).toFixed(2))}>
                  Nudge
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="text-sm font-semibold">IFTA draft Q3</h2>
        <p className="text-xs text-muted">Miles from ELD. Gallons from WEX. Filing stays human.</p>
        <table className="mt-2 w-full max-w-md text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="py-1">Jur</th>
              <th>Miles</th>
              <th>Gallons</th>
              <th>MPG</th>
            </tr>
          </thead>
          <tbody>
            {ifta.map((r) => (
              <tr key={r.jur} className="border-t border-line font-mono">
                <td className="py-1">{r.jur}</td>
                <td>{r.miles}</td>
                <td>{r.gallons}</td>
                <td>{(r.miles / r.gallons).toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Link to="/app/owner" className="mt-3 inline-block text-sm text-navy">
          Connectors and kill switch
        </Link>
      </section>
    </div>
  );
}
