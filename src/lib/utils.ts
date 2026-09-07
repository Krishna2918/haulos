import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(n: number, cur: "CAD" | "USD" = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: cur,
    maximumFractionDigits: 0,
  }).format(n);
}

export function moneyExact(n: number, cur: "CAD" | "USD" = "CAD") {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: cur,
    minimumFractionDigits: 2,
  }).format(n);
}
