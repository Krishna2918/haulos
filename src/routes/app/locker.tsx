import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/desk/chips";
import { useHaul } from "@/lib/haulos/store";

export const Route = createFileRoute("/app/locker")({ component: Locker });

function Locker() {
  const orders = useHaul((s) => s.orders);
  const locker = useHaul((s) => s.locker);
  const fileBit = useHaul((s) => s.fileBit);
  const [loadId, setLoadId] = useState(orders[0]?.id ?? "");
  const [name, setName] = useState("rate-con.pdf");
  const files = locker.filter((f) => f.loadId === loadId);
  const o = orders.find((x) => x.id === loadId);

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Bit Locker</h1>
        <p className="text-sm text-muted">Papers live on the load. Locked bits block the next step.</p>
      </header>
      <select
        className="min-h-11 rounded-[var(--radius-sm)] border border-line bg-raised px-3 text-sm"
        value={loadId}
        onChange={(e) => setLoadId(e.target.value)}
      >
        {orders.map((x) => (
          <option key={x.id} value={x.id}>
            {x.code} · {x.shipper}
          </option>
        ))}
      </select>
      {o && (
        <div className="grid gap-2 sm:grid-cols-2">
          {o.papers.map((p, i) => (
            <div key={p.name + i} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-2 text-sm">
              <span>
                {p.at} · {p.name}
              </span>
              <Chip tone={p.scanned ? "ok" : "warn"}>{p.scanned ? "in" : "locked"}</Chip>
            </div>
          ))}
        </div>
      )}
      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-raised text-xs uppercase text-muted">
            <tr>
              {["File", "Kind", "Source", "By", "When", "Lock"].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {files.map((f) => (
              <tr key={f.id} className="border-t border-line">
                <td className="px-3 py-2 font-mono">{f.name}</td>
                <td className="px-3 py-2">{f.kind}</td>
                <td className="px-3 py-2">{f.source}</td>
                <td className="px-3 py-2">{f.by}</td>
                <td className="px-3 py-2">{f.when}</td>
                <td className="px-3 py-2">
                  <Chip tone={f.locked ? "navy" : "muted"}>{f.locked ? "locked" : "open"}</Chip>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          fileBit(loadId, "other", name);
        }}
      >
        <input
          className="min-h-11 flex-1 rounded-[var(--radius-sm)] border border-line bg-paper px-3 text-sm"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button type="submit">File a bit</Button>
      </form>
    </div>
  );
}
