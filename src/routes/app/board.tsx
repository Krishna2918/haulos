import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/desk/chips";
import { useHaul } from "@/lib/haulos/store";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/app/board")({ component: Board });

function Board() {
  const tenders = useHaul((s) => s.tenders);
  const mails = useHaul((s) => s.mails);
  const edi = useHaul((s) => s.edi);
  const take = useHaul((s) => s.takeTender);
  const decline = useHaul((s) => s.declineTender);
  const fuel = 0.42;
  const drv = 0.55;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Board</h1>
        <p className="text-sm text-muted">Email and EDI land here. Take onto the desk. Not a DAT clone.</p>
      </header>
      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-raised text-xs uppercase text-muted">
            <tr>
              {["ID", "Source", "Shipper", "Lane", "Rate", "Net-ish", "Window", "Status", ""].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenders.map((t) => {
              const km = t.miles * 1.609;
              const net = Math.round(t.rate - km * fuel - km * drv);
              return (
                <tr key={t.id} className="border-t border-line">
                  <td className="px-3 py-2 font-mono">{t.id}</td>
                  <td className="px-3 py-2">{t.source}</td>
                  <td className="px-3 py-2">{t.shipper}</td>
                  <td className="px-3 py-2">{t.lane}</td>
                  <td className="px-3 py-2 font-mono">{money(t.rate)}</td>
                  <td className="px-3 py-2 font-mono">{money(net)}</td>
                  <td className="px-3 py-2">{t.window}</td>
                  <td className="px-3 py-2">
                    <Chip tone={t.status === "open" ? "navy" : t.status === "declined" ? "bad" : "ok"}>{t.status}</Chip>
                  </td>
                  <td className="px-3 py-2">
                    {t.status === "open" && (
                      <div className="flex gap-1">
                        <Button variant="yes" onClick={() => take(t.id)}>
                          Take
                        </Button>
                        <Button variant="hold" onClick={() => decline(t.id, "rate")}>
                          990
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
          <h2 className="text-sm font-semibold">Order email</h2>
          <ul className="mt-3 space-y-3">
            {mails.map((m) => (
              <li key={m.id} className="border-t border-line pt-3 first:border-0 first:pt-0">
                <p className="text-xs text-muted">
                  {m.from} · {m.when}
                </p>
                <p className="font-medium">{m.subject}</p>
                <p className="text-sm text-muted">{m.body}</p>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
          <h2 className="text-sm font-semibold">EDI 204 / 990 / 214 / 210</h2>
          <ul className="mt-3 space-y-2 font-mono text-xs">
            {edi.slice(0, 12).map((e) => (
              <li key={e.id}>
                {e.set} · {e.status} · {e.note} · {e.when}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
