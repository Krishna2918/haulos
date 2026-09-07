import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ClipboardList,
  LayoutGrid,
  Map,
  MessageSquare,
  Moon,
  Sun,
  Truck,
  Users,
  Wallet,
  Wrench,
  Radio,
  FileStack,
  Settings2,
} from "lucide-react";
import { useEffect } from "react";
import { useHaul, unreadCount } from "@/lib/haulos/store";
import { cn } from "@/lib/utils";
import { NAV, MOBILE_NAV, canSee, homePath, isField, ROLE_LINE, type NavIcon } from "@/lib/haulos/roles";

const ICONS: Record<NavIcon, typeof Truck> = {
  today: LayoutGrid,
  dispatch: ClipboardList,
  board: Radio,
  box: MessageSquare,
  locker: FileStack,
  logs: ClipboardList,
  track: Map,
  crew: Users,
  fleet: Truck,
  shop: Wrench,
  money: Wallet,
  owner: Settings2,
};

export function DeskShell() {
  const role = useHaul((s) => s.role);
  const people = useHaul((s) => s.people);
  const personId = useHaul((s) => s.personId);
  const setRole = useHaul((s) => s.setRole);
  const theme = useHaul((s) => s.theme);
  const setTheme = useHaul((s) => s.setTheme);
  const drift = useHaul((s) => s.drift);
  const did = useHaul((s) => s.companyDid);
  const trucks = useHaul((s) => s.trucks);
  const trailers = useHaul((s) => s.trailers);
  const unread = unreadCount();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const me = people.find((p) => p.id === personId);
  const nav = useNavigate();
  const field = isField(role);
  const truck = trucks.find((t) => t.id === me?.truckId);
  const trailer = trailers.find((t) => t.id === truck?.trailerId);

  useEffect(() => {
    const id = setInterval(drift, 15000);
    return () => clearInterval(id);
  }, [drift]);

  useEffect(() => {
    if (field && path !== "/app/phone") {
      void nav({ to: "/app/phone" });
    } else if (!field && path === "/app/phone") {
      void nav({ to: "/app/today" });
    }
  }, [field, path, nav]);

  const links = NAV.filter((n) => canSee(role, n.roles));
  const mobile = MOBILE_NAV.filter((n) => canSee(role, n.roles)).slice(0, 4);

  function switchSeat(id: string) {
    const p = people.find((x) => x.id === id);
    if (!p) return;
    setRole(p.kind, p.id);
    void nav({ to: homePath(p.kind) });
  }

  if (field) {
    return (
      <div className="flex min-h-dvh flex-col bg-paper md:items-center md:justify-center md:bg-navy-deep md:py-6">
        <div className="flex min-h-dvh w-full flex-col bg-paper md:min-h-[760px] md:w-[390px] md:overflow-hidden md:rounded-[var(--radius-lg)] md:border md:border-line">
          <header className="flex items-center gap-2 border-b border-line px-3 py-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-navy">Northline</p>
              <p className="truncate text-[11px] text-muted">
                {me?.name} · {truck?.unit ?? me?.kind}
                {trailer ? ` · ${trailer.unit}` : ""}
                {truck ? ` · ${truck.hoursLeft.toFixed(1)}h` : ""}
              </p>
            </div>
            <label className="ml-auto text-[11px] text-muted">
              <span className="sr-only">Seat</span>
              <select
                className="min-h-11 max-w-36 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm text-ink"
                value={personId}
                onChange={(e) => switchSeat(e.target.value)}
              >
                {people.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="grid size-11 place-items-center rounded-[var(--radius-sm)] border border-line"
              onClick={() => setTheme(theme === "day" ? "night" : "day")}
              aria-label="Theme"
            >
              {theme === "day" ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </button>
          </header>
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col bg-paper md:flex-row">
      <aside className="hidden w-52 shrink-0 flex-col border-r border-line bg-raised md:flex">
        <div className="border-b border-line px-4 py-4">
          <Link to="/app/today" className="font-semibold tracking-tight text-navy">
            HaulOS
          </Link>
          <p className="mt-0.5 text-[11px] text-muted">Northline Freight</p>
        </div>
        <nav className="flex-1 overflow-auto p-2">
          {links.map((n) => {
            const Icon = ICONS[n.icon];
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex min-h-10 items-center gap-2 rounded-[var(--radius-sm)] px-2 text-sm",
                  path === n.to ? "bg-navy text-paper" : "text-ink hover:bg-paper",
                )}
              >
                <Icon className="size-4" />
                {n.label}
                {n.label === "Box" && unread > 0 && (
                  <span className="ml-auto rounded-full bg-bad px-1.5 text-[10px] text-paper">{unread}</span>
                )}
              </Link>
            );
          })}
        </nav>
        <p className="px-3 py-2 text-[10px] text-muted">Preview · demo data · no live send</p>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-2 border-b border-line bg-raised px-3 py-2">
          <Link to="/app/today" className="font-semibold text-navy md:hidden">
            HaulOS
          </Link>
          <label className="ml-auto text-[11px] text-muted">
            Seat
            <select
              className="ml-2 min-h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm text-ink"
              value={personId}
              onChange={(e) => switchSeat(e.target.value)}
            >
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.kind}
                </option>
              ))}
            </select>
          </label>
          <button
            className="grid size-11 place-items-center rounded-[var(--radius-sm)] border border-line"
            onClick={() => setTheme(theme === "day" ? "night" : "day")}
            aria-label="Theme"
          >
            {theme === "day" ? <Moon className="size-4" /> : <Sun className="size-4" />}
          </button>
        </header>
        <main className="min-h-0 flex-1 overflow-auto p-4 pb-24 md:pb-6">
          <p className="mb-3 text-xs text-muted">
            {me?.name} · {role} · {ROLE_LINE[role]} · {did}
          </p>
          <Outlet />
        </main>
        <nav className="fixed inset-x-0 bottom-0 z-10 flex border-t border-line bg-raised md:hidden">
          {mobile.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex min-h-12 flex-1 items-center justify-center text-xs",
                path === n.to ? "font-semibold text-navy" : "text-muted",
              )}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
