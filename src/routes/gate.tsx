import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useHaul } from "@/lib/haulos/store";

export const Route = createFileRoute("/gate")({ component: Gate });

function Gate() {
  const trucks = useHaul((s) => s.trucks);
  const [unit, setUnit] = useState("T-002");
  const [log, setLog] = useState<string[]>([]);
  const t = trucks.find((x) => x.unit.toUpperCase() === unit.toUpperCase());

  return (
    <div className="mx-auto grid min-h-dvh max-w-md content-center p-6">
      <p className="text-xs uppercase tracking-wide text-navy">Brampton gate</p>
      <h1 className="text-3xl font-semibold">Unit or PIN</h1>
      <input
        className="mt-4 min-h-12 rounded-[var(--radius-sm)] border border-line bg-raised px-3 font-mono text-lg"
        value={unit}
        onChange={(e) => setUnit(e.target.value)}
      />
      <div className="mt-3 flex gap-2">
        <Button
          className="flex-1"
          onClick={() =>
            setLog((l) => [`${new Date().toISOString().slice(11, 16)} OPEN ${unit} ${t ? t.driverId : "unknown"}`, ...l])
          }
          disabled={!t}
        >
          Open
        </Button>
        <Button
          variant="hold"
          className="flex-1"
          onClick={() => setLog((l) => [`HOLD ${unit} — dispatch`, ...l])}
        >
          Hold
        </Button>
      </div>
      {!t && <p className="mt-2 text-sm text-bad">Unknown plate. Dispatch must Yes.</p>}
      <ul className="mt-6 font-mono text-xs text-muted">
        {log.map((x, i) => (
          <li key={i}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
