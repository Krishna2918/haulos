import { Link } from "@tanstack/react-router";
import { YesCard } from "@/components/desk/yes-card";
import { Chip, StatusChip } from "@/components/desk/chips";
import { Button } from "@/components/ui/button";
import { useHaul } from "@/lib/haulos/store";
import { money, moneyExact } from "@/lib/utils";
import { fuelSeries } from "@/lib/haulos/seed";
import { missingDelivery, missingPickup, STEP_LABEL, trueNet } from "@/lib/haulos/sequence";
import { ROLE_LINE } from "@/lib/haulos/roles";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import type { Item, Role } from "@/lib/haulos/types";

function openItems(role: Role, all: Item[], theme: string) {
  const mine = all.filter((i) => i.status === "open" && (i.desk.includes(role) || role === "owner" || role === "admin"));
  if (theme === "night" && (role === "owner" || role === "dispatcher" || role === "safety")) {
    return mine.filter((i) => /HOS|shop|clock|brake|hold|wait/i.test(i.title + i.detail));
  }
  return mine;
}

function Stat({ k, v, tone }: { k: string; v: string; tone?: "bad" | "ok" }) {
  return (
    <div className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
      <p className="text-xs text-muted">{k}</p>
      <p className={`mt-1 font-mono text-xl tabular-nums ${tone === "bad" ? "text-bad" : tone === "ok" ? "text-ok" : ""}`}>
        {v}
      </p>
    </div>
  );
}

function YesBlock({ role }: { role: Role }) {
  const all = useHaul((s) => s.items);
  const theme = useHaul((s) => s.theme);
  const items = openItems(role, all, theme);
  const watch = theme === "night" && (role === "owner" || role === "dispatcher" || role === "safety");
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">{watch ? "Watchtower · red only" : "Needs a Yes"}</h2>
      <div className="grid gap-3 lg:grid-cols-2">
        {items.length === 0 && <p className="text-sm text-muted">Nothing waiting on this seat.</p>}
        {items.map((i) => (
          <YesCard key={i.id} item={i} />
        ))}
      </div>
    </section>
  );
}

export function Floor() {
  const trucks = useHaul((s) => s.trucks);
  const trailers = useHaul((s) => s.trailers);
  const orders = useHaul((s) => s.orders);
  const people = useHaul((s) => s.people);
  const loose = trailers.filter((tr) => !tr.truckId);
  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-raised text-xs uppercase tracking-wide text-muted">
            <tr>
              {["Truck", "T status", "Trailer", "TR status", "Driver", "Where", "Hours", "Load"].map((h) => (
                <th key={h} className="px-3 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trucks.map((t) => {
              const tr = trailers.find((x) => x.id === t.trailerId);
              const o = orders.find((x) => x.id === t.loadId);
              const d = people.find((p) => p.id === t.driverId);
              return (
                <tr key={t.id} className="border-t border-line">
                  <td className="px-3 py-2 font-mono">{t.unit}</td>
                  <td className="px-3 py-2">
                    <StatusChip kind="truck" status={t.status} />
                  </td>
                  <td className="px-3 py-2 font-mono">{tr?.unit ?? "—"}</td>
                  <td className="px-3 py-2">
                    <StatusChip kind="trailer" status={tr?.status} />
                  </td>
                  <td className="px-3 py-2">{d?.name ?? "—"}</td>
                  <td className="px-3 py-2">{t.where}</td>
                  <td className={`px-3 py-2 font-mono tabular-nums ${t.hoursLeft < 3 ? "text-bad" : ""}`}>
                    {t.hoursLeft.toFixed(1)}h
                  </td>
                  <td className="px-3 py-2 font-mono">{o?.code ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {loose.length > 0 && (
        <div>
          <p className="mb-2 text-xs uppercase tracking-wide text-muted">Trailers not hooked</p>
          <ul className="grid gap-2 sm:grid-cols-3">
            {loose.map((tr) => (
              <li key={tr.id} className="flex items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-2 text-sm">
                <span>
                  <span className="font-mono">{tr.unit}</span>
                  <span className="text-muted"> · {tr.where}</span>
                </span>
                <StatusChip kind="trailer" status={tr.status} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function OwnerHome() {
  const invoices = useHaul((s) => s.invoices);
  const pays = useHaul((s) => s.pays);
  const wos = useHaul((s) => s.wos);
  const kill = useHaul((s) => s.kill);
  const orders = useHaul((s) => s.orders);
  const billed = invoices.reduce((a, i) => a + i.amount, 0);
  const held = pays.reduce((a, p) => a + p.hold, 0);
  const down = wos.filter((w) => w.status !== "done").reduce((a, w) => a + w.downtime, 0);
  const moving = orders.filter((o) => o.status === "moving" || o.status === "dock");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <p className="text-sm text-muted">{ROLE_LINE.owner}</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat k="Open bills" v={money(billed)} />
        <Stat k="Pay held" v={money(held)} tone={held ? "bad" : "ok"} />
        <Stat k="Shop downtime" v={money(down)} tone={down ? "bad" : "ok"} />
        <Stat k="Fuel today" v={money(6140)} />
      </section>
      <p className="text-xs text-muted">
        Kill · agents {kill.agents ? "OFF" : "on"} · money {kill.money ? "frozen" : "live"} · outbound{" "}
        {kill.outbound ? "OFF" : "on"}
        {" · "}
        <Link to="/app/owner" className="text-navy">
          Open owner
        </Link>
      </p>
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
          <p className="text-sm font-medium">Fuel · day vs month pattern</p>
          <p className="text-xs text-muted">Fill before 6am. $1.29/L. Saves $11k.</p>
          <div className="mt-2 h-36 min-w-0">
            <ResponsiveContainer>
              <BarChart data={fuelSeries}>
                <XAxis dataKey="d" hide />
                <Tooltip />
                <Bar dataKey="v" fill="#1e4f86" radius={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
          <p className="text-sm font-medium">Moving now</p>
          <p className="text-xs text-muted">{moving.length} loads on the road or at dock. Empty 9%.</p>
          <div className="mt-2 h-36 min-w-0">
            <ResponsiveContainer>
              <LineChart data={fuelSeries}>
                <XAxis dataKey="d" hide />
                <Tooltip />
                <Line type="monotone" dataKey="v" stroke="#1e4f86" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
      <YesBlock role="owner" />
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Units</h2>
          <Link to="/app/dispatch" className="text-sm text-navy">
            Open dispatch
          </Link>
        </div>
        <Floor />
      </section>
    </div>
  );
}

export function DispatchHome() {
  const orders = useHaul((s) => s.orders);
  const unread = useHaul((s) => s.msgs.filter((m) => !m.read && m.channel === "sms").length);
  const yesN = useHaul((s) => s.items.filter((i) => i.status === "open" && i.desk.includes("dispatcher")).length);
  const trucks = useHaul((s) => s.trucks);
  const trailers = useHaul((s) => s.trailers);
  const hot =
    trucks.filter((t) => t.hoursLeft < 3 || t.status === "shop" || t.status === "wait").length +
    trailers.filter((t) => t.status === "shop" || t.status === "dwell").length;
  const open = orders.filter((o) => o.step === "incomplete" || o.step === "ready" || o.step === "assigned");
  const fuel = 0.42;
  const drv = 0.55;
  const loadedT = trucks.filter((t) => t.status === "loaded").length;
  const loadedTr = trailers.filter((t) => t.status === "loaded" || t.status === "dwell").length;
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <p className="text-sm text-muted">{ROLE_LINE.dispatcher}</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-4">
        <Stat k="Needs a Yes" v={String(yesN)} />
        <Stat k="Unread texts" v={String(unread)} tone={unread ? "bad" : "ok"} />
        <Stat k="Hot units" v={String(hot)} tone={hot ? "bad" : "ok"} />
        <Stat k="On the floor" v={`${loadedT} truck · ${loadedTr} trailer`} />
      </section>
      <YesBlock role="dispatcher" />
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Floor</h2>
          <div className="flex gap-3 text-sm">
            <Link to="/app/dispatch" className="text-navy">
              Sequence
            </Link>
            <Link to="/app/box" className="text-navy">
              Box
            </Link>
            <Link to="/app/board" className="text-navy">
              Board
            </Link>
          </div>
        </div>
        <Floor />
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold">Open orders</h2>
        <ul className="space-y-2">
          {open.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-2 text-sm">
              <span>
                <span className="font-mono">{o.code}</span> · {o.from} → {o.to}
              </span>
              <span className="flex items-center gap-2">
                <Chip tone={o.step === "incomplete" ? "warn" : "navy"}>{STEP_LABEL[o.step]}</Chip>
                <span className="font-mono text-xs">{money(trueNet(o, fuel, drv))} net</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function HrHome() {
  const people = useHaul((s) => s.people);
  const hire = useHaul((s) => s.hireChen);
  const rates = useHaul((s) => s.rates);
  const field = people.filter((p) => ["driver", "local", "helper"].includes(p.kind));
  const medSoon = field.filter((p) => p.med && p.med <= "2026-09-30");
  const noFast = field.filter((p) => p.kind === "driver" && !p.fast);
  const chen = people.find((p) => p.id === "p-chen");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <p className="text-sm text-muted">{ROLE_LINE.hr}</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat k="Med due this month" v={String(medSoon.length)} tone={medSoon.length ? "bad" : "ok"} />
        <Stat k="No FAST" v={String(noFast.length)} />
        <Stat k="On leave" v={String(people.filter((p) => p.status === "leave").length)} />
      </section>
      <YesBlock role="hr" />
      {chen?.status === "leave" && (
        <Button onClick={hire}>Hire P. Chen · pass 9919</Button>
      )}
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">People</h2>
          <Link to="/app/crew" className="text-sm text-navy">
            Full crew
          </Link>
        </div>
        <div className="overflow-x-auto rounded-[var(--radius-md)] border border-line">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-raised text-xs uppercase text-muted">
              <tr>
                {["Name", "Job", "Med", "CDL exp", "FAST", "Hold"].map((h) => (
                  <th key={h} className="px-3 py-2 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {field.map((p) => (
                <tr key={p.id} className="border-t border-line">
                  <td className="px-3 py-2">{p.name}</td>
                  <td className="px-3 py-2">{p.kind}</td>
                  <td className={`px-3 py-2 font-mono text-xs ${p.med && p.med <= "2026-09-30" ? "text-bad" : ""}`}>
                    {p.med || "—"}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{p.cdlExp || "—"}</td>
                  <td className="px-3 py-2">{p.fast ? "yes" : "—"}</td>
                  <td className="px-3 py-2 font-mono text-xs">{p.hold ? moneyExact(p.hold) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold">Rate card · HR or owner lock</h2>
        <ul className="grid gap-2 sm:grid-cols-3">
          {rates.map((r) => (
            <li key={r.id} className="rounded-[var(--radius-sm)] border border-line bg-raised p-3 text-sm">
              <p className="text-xs text-muted">{r.label}</p>
              <p className="font-mono">
                {r.amount}
                {r.unit}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function OfficeHome() {
  const invoices = useHaul((s) => s.invoices);
  const orders = useHaul((s) => s.orders);
  const locker = useHaul((s) => s.locker);
  const ifta = useHaul((s) => s.ifta);
  const send = useHaul((s) => s.sendInvoice);
  const kill = useHaul((s) => s.kill);
  const missingPod = orders.filter((o) => o.departed && missingDelivery(o).length && o.step !== "done");
  const drafts = invoices.filter((i) => i.status === "draft");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <p className="text-sm text-muted">{ROLE_LINE.backoffice}</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat k="Draft invoices" v={String(drafts.length)} />
        <Stat k="POD still out" v={String(missingPod.length)} tone={missingPod.length ? "bad" : "ok"} />
        <Stat k="Bits in locker" v={String(locker.length)} />
      </section>
      <YesBlock role="backoffice" />
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Invoices</h2>
          <Link to="/app/money" className="text-sm text-navy">
            Money
          </Link>
        </div>
        <ul className="space-y-2">
          {invoices.map((i) => (
            <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-2 text-sm">
              <span>
                <span className="font-mono">{i.id}</span> · {i.who} · {moneyExact(i.amount)}
              </span>
              <span className="flex items-center gap-2">
                <Chip tone={i.status === "sent" ? "ok" : "warn"}>{i.status}</Chip>
                {i.status === "draft" && (
                  <Button onClick={() => send(i.id)} disabled={kill.money}>
                    {kill.money ? "Frozen" : "Send"}
                  </Button>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold">Missing delivery papers</h2>
        {missingPod.length === 0 && <p className="text-sm text-muted">All delivery bits in.</p>}
        <ul className="space-y-1 text-sm">
          {missingPod.map((o) => (
            <li key={o.id}>
              <span className="font-mono">{o.code}</span> · {missingDelivery(o).join(", ")}
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold">IFTA draft Q3</h2>
        <table className="w-full max-w-md text-left text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="py-1">Jur</th>
              <th>Miles</th>
              <th>Gallons</th>
            </tr>
          </thead>
          <tbody>
            {ifta.map((r) => (
              <tr key={r.jur} className="border-t border-line font-mono">
                <td className="py-1">{r.jur}</td>
                <td>{r.miles}</td>
                <td>{r.gallons}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export function SafetyHome() {
  const hos = useHaul((s) => s.hos);
  const people = useHaul((s) => s.people);
  const trucks = useHaul((s) => s.trucks);
  const trailers = useHaul((s) => s.trailers);
  const dvirs = useHaul((s) => s.dvirs);
  const certify = useHaul((s) => s.certifyHos);
  const hot = hos.filter((h) => h.driveLeft < 3);
  const fails = dvirs.filter((d) => d.result === "fail");
  const shopT = trucks.filter((t) => t.status === "shop");
  const shopTr = trailers.filter((t) => t.status === "shop");
  const noFast = people.filter((p) => p.kind === "driver" && !p.fast);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <p className="text-sm text-muted">{ROLE_LINE.safety}</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-4">
        <Stat k="Clock under 3h" v={String(hot.length)} tone={hot.length ? "bad" : "ok"} />
        <Stat k="DVIR fail" v={String(fails.length)} tone={fails.length ? "bad" : "ok"} />
        <Stat k="In shop" v={`${shopT.length} truck · ${shopTr.length} trailer`} tone={shopT.length + shopTr.length ? "bad" : "ok"} />
        <Stat k="No FAST" v={String(noFast.length)} />
      </section>
      <YesBlock role="safety" />
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Hours</h2>
          <Link to="/app/logs" className="text-sm text-navy">
            Full logs
          </Link>
        </div>
        <ul className="space-y-2">
          {hos.map((h) => {
            const p = people.find((x) => x.id === h.personId);
            const t = trucks.find((x) => x.driverId === h.personId);
            const tr = trailers.find((x) => x.id === t?.trailerId);
            return (
              <li key={h.personId} className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-2 text-sm">
                <span>
                  {p?.name} · {t?.unit ?? "—"} <StatusChip kind="truck" status={t?.status} /> · {tr?.unit ?? "no trailer"}{" "}
                  <StatusChip kind="trailer" status={tr?.status} /> · {h.ruleset}
                </span>
                <span className="flex items-center gap-2">
                  <Chip tone={h.driveLeft < 3 ? "bad" : "ok"}>{h.driveLeft.toFixed(1)}h left</Chip>
                  {!h.certified && (
                    <Button variant="quiet" onClick={() => certify(h.personId)}>
                      Certify
                    </Button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold">DVIR / shop</h2>
        <ul className="space-y-1 text-sm">
          {fails.map((d) => (
            <li key={d.id} className="text-bad">
              Fail · {d.truckId ? trucks.find((t) => t.id === d.truckId)?.unit : ""}
              {d.trailerId ? trailers.find((t) => t.id === d.trailerId)?.unit : ""} · {d.note} · {d.by}
            </li>
          ))}
          {shopT.map((t) => (
            <li key={t.id}>
              {t.unit} truck stays shop. {t.note}
            </li>
          ))}
          {shopTr.map((t) => (
            <li key={t.id}>
              {t.unit} trailer stays shop. {t.fault || t.where}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function AdminHome() {
  const kill = useHaul((s) => s.kill);
  const connectors = useHaul((s) => s.connectors);
  const users = useHaul((s) => s.users);
  const audit = useHaul((s) => s.audit);
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <p className="text-sm text-muted">{ROLE_LINE.admin}</p>
      </header>
      <section className="grid gap-3 sm:grid-cols-3">
        <Stat k="Agents" v={kill.agents ? "OFF" : "on"} tone={kill.agents ? "bad" : "ok"} />
        <Stat k="Money send" v={kill.money ? "frozen" : "live"} tone={kill.money ? "bad" : "ok"} />
        <Stat k="Outbound SMS" v={kill.outbound ? "OFF" : "on"} />
      </section>
      <YesBlock role="admin" />
      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Connect · {connectors.filter((c) => c.on).length} on</h2>
          <Link to="/app/owner" className="text-sm text-navy">
            Owner console
          </Link>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {connectors.slice(0, 6).map((c) => (
            <li key={c.id} className="flex justify-between rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-2 text-sm">
              <span>{c.name}</span>
              <Chip tone={c.on ? "ok" : "muted"}>{c.on ? "on" : "off"}</Chip>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold">Seats</h2>
        <ul className="text-sm">
          {users.map((u) => (
            <li key={u.id} className="flex justify-between border-b border-line py-2">
              <span>{u.name}</span>
              <span className="font-mono text-xs text-muted">{u.email}</span>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="mb-2 text-sm font-semibold">Audit</h2>
        <ul className="max-h-40 overflow-auto font-mono text-xs text-muted">
          {audit.slice(0, 8).map((a) => (
            <li key={a.id}>
              {a.when} · {a.who} · {a.what}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export function PickupHome() {
  const orders = useHaul((s) => s.orders);
  const waiting = orders.filter((o) => missingPickup(o).length && o.step !== "incomplete" && o.step !== "done");
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Today</h1>
        <p className="text-sm text-muted">Use the phone for scans. This is the yard list.</p>
      </header>
      <ul className="space-y-2">
        {waiting.map((o) => (
          <li key={o.id} className="rounded-[var(--radius-sm)] border border-line bg-raised px-3 py-2 text-sm">
            <span className="font-mono">{o.code}</span> · {o.shipper} · missing {missingPickup(o).join(", ")}
          </li>
        ))}
      </ul>
      <Link to="/app/phone" className="text-sm text-navy">
        Open phone
      </Link>
    </div>
  );
}
