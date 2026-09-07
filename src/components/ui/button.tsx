import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type V = "primary" | "ghost" | "danger" | "yes" | "hold" | "quiet";

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: V }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-3.5 text-sm font-medium transition-opacity duration-150 disabled:opacity-40",
        variant === "primary" && "bg-navy text-paper hover:opacity-90",
        variant === "ghost" && "border border-line bg-raised text-ink hover:bg-paper",
        variant === "danger" && "bg-bad text-paper",
        variant === "yes" && "bg-ok text-paper",
        variant === "hold" && "bg-warn text-paper",
        variant === "quiet" && "text-muted hover:text-ink",
        className,
      )}
      {...props}
    />
  );
}
