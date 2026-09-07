import { cn } from "@/lib/utils";

export function Chip({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "ok" | "warn" | "bad" | "navy" | "hold";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-xs)] px-1.5 py-0.5 font-mono text-[11px] uppercase tracking-wide",
        tone === "muted" && "bg-line/60 text-muted",
        tone === "ok" && "bg-ok/15 text-ok",
        tone === "warn" && "bg-warn/15 text-warn",
        tone === "bad" && "bg-bad/15 text-bad",
        tone === "navy" && "bg-navy/15 text-navy",
        tone === "hold" && "bg-hold/15 text-hold",
      )}
    >
      {children}
    </span>
  );
}

export function truckTone(s: string) {
  if (s === "loaded") return "navy" as const;
  if (s === "empty") return "ok" as const;
  if (s === "shop") return "bad" as const;
  if (s === "wait") return "warn" as const;
  return "muted" as const;
}

export function trailerTone(s: string) {
  if (s === "loaded") return "navy" as const;
  if (s === "hooked") return "ok" as const;
  if (s === "yard") return "muted" as const;
  if (s === "shop") return "bad" as const;
  if (s === "dwell") return "warn" as const;
  return "muted" as const;
}

export function StatusChip({
  kind,
  status,
}: {
  kind: "truck" | "trailer";
  status?: string | null;
}) {
  if (!status) return <Chip>—</Chip>;
  return <Chip tone={kind === "truck" ? truckTone(status) : trailerTone(status)}>{status}</Chip>;
}
