import type { Role } from "./types";

export const FIELD_ROLES: Role[] = ["driver", "local", "helper", "shop"];

export function isField(role: Role) {
  return FIELD_ROLES.includes(role);
}

export function homePath(role: Role) {
  return isField(role) ? "/app/phone" : "/app/today";
}

export const ROLE_LINE: Record<Role, string> = {
  owner: "Money. Trucks legal. People paid.",
  dispatcher: "Sequence is the trip. Papers gate the next step.",
  hr: "People legal. Rates lock with owner.",
  backoffice: "POD in. Invoice out. Dual-control on send.",
  admin: "Kill switch. Connect. Audit.",
  driver: "One trip. Next paper. Hours truth. Texts from Northline.",
  local: "Pickup papers. Seal. Then highway may leave.",
  helper: "Yard tasks. Help local. Texts from Northline.",
  shop: "Truck and trailer each have a status. DVIR fail opens a work order.",
  safety: "Samsara is the hours truth. Truck shop and trailer shop are separate.",
};

export const NAV: { to: string; label: string; icon: NavIcon; roles: Role[] }[] = [
  { to: "/app/today", label: "Today", icon: "today", roles: ["owner", "dispatcher", "hr", "backoffice", "admin", "safety"] },
  { to: "/app/dispatch", label: "Dispatch", icon: "dispatch", roles: ["owner", "dispatcher", "admin"] },
  { to: "/app/board", label: "Board", icon: "board", roles: ["owner", "dispatcher", "backoffice", "admin"] },
  { to: "/app/box", label: "Box", icon: "box", roles: ["owner", "dispatcher", "hr", "backoffice", "admin", "safety"] },
  { to: "/app/locker", label: "Locker", icon: "locker", roles: ["owner", "dispatcher", "backoffice", "admin"] },
  { to: "/app/logs", label: "Logs", icon: "logs", roles: ["owner", "dispatcher", "hr", "admin", "safety"] },
  { to: "/app/track", label: "Track", icon: "track", roles: ["owner", "dispatcher", "admin", "safety"] },
  { to: "/app/crew", label: "Crew", icon: "crew", roles: ["owner", "dispatcher", "hr", "admin", "safety"] },
  { to: "/app/fleet", label: "Fleet", icon: "fleet", roles: ["owner", "dispatcher", "admin", "safety"] },
  { to: "/app/shop", label: "Shop", icon: "shop", roles: ["owner", "dispatcher", "admin"] },
  { to: "/app/money", label: "Money", icon: "money", roles: ["owner", "backoffice", "admin"] },
  { to: "/app/owner", label: "Owner", icon: "owner", roles: ["owner", "admin"] },
];

export type NavIcon =
  | "today"
  | "dispatch"
  | "board"
  | "box"
  | "locker"
  | "logs"
  | "track"
  | "crew"
  | "fleet"
  | "shop"
  | "money"
  | "owner";

export const MOBILE_NAV: { to: string; label: string; roles: Role[] }[] = [
  { to: "/app/today", label: "Today", roles: ["owner", "dispatcher", "hr", "backoffice", "admin", "safety"] },
  { to: "/app/dispatch", label: "Orders", roles: ["owner", "dispatcher", "admin"] },
  { to: "/app/box", label: "Inbox", roles: ["owner", "dispatcher", "hr", "backoffice", "admin", "safety"] },
  { to: "/app/crew", label: "Crew", roles: ["hr"] },
  { to: "/app/money", label: "Money", roles: ["owner", "backoffice", "admin"] },
  { to: "/app/logs", label: "Logs", roles: ["safety"] },
  { to: "/app/track", label: "Track", roles: ["owner", "dispatcher", "admin"] },
];

export function canSee(role: Role, roles: Role[]) {
  return roles.includes(role);
}

export const DEMO_NOW = Date.parse("2026-09-03T17:12:00");
