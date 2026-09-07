import { Button } from "@/components/ui/button";
import { Chip } from "./chips";
import type { Item } from "@/lib/haulos/types";
import { useHaul } from "@/lib/haulos/store";

export function YesCard({ item }: { item: Item }) {
  const yes = useHaul((s) => s.yesItem);
  const hold = useHaul((s) => s.holdItem);
  return (
    <article className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold leading-snug">{item.title}</h3>
        <Chip tone={item.status === "yes" ? "ok" : item.status === "hold" ? "warn" : "navy"}>
          {item.status === "open" ? "Needs a Yes" : item.status}
        </Chip>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-ink">{item.detail}</p>
      <p className="mt-1 text-xs text-muted">{item.impact}</p>
      {item.status === "open" && (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="yes" onClick={() => yes(item.id)}>
            Yes
          </Button>
          <Button variant="hold" onClick={() => hold(item.id)}>
            Hold
          </Button>
        </div>
      )}
    </article>
  );
}
