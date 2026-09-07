import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import {
  ClipboardList,
  FileScan,
  MessageSquare,
  Clock,
  User,
  Wrench,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip, StatusChip } from "@/components/desk/chips";
import { useHaul } from "@/lib/haulos/store";
import {
  canDeliver,
  canLeaveYard,
  detentionDollars,
  missingDelivery,
  missingPickup,
  nextHint,
} from "@/lib/haulos/sequence";
import { DEMO_NOW } from "@/lib/haulos/roles";
import { money, moneyExact, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Person, Role } from "@/lib/haulos/types";

export const Route = createFileRoute("/app/phone")({ component: Phone });

type Tab = "trip" | "scan" | "texts" | "hours" | "me" | "jobs" | "work" | "unit";

const COPY: Record<string, Record<string, string>> = {
  en: {
    trip: "Trip",
    scan: "Scan",
    texts: "Texts",
    hours: "Hours",
    me: "Me",
    jobs: "Jobs",
    work: "Work",
    unit: "Unit",
    next: "Next paper",
    scanBtn: "Scan into Bit Locker",
    leave: "Leave yard",
    done: "Mark delivered",
    cert: "Certify log",
    empty: "No load. Wait for dispatch.",
    shop: "Do not log drive.",
    waiting: "Waiting on local pickup papers.",
    dock: "At dock. Wait clock running.",
    waitBtn: "Still waiting",
    dvirPass: "DVIR pass",
    dvirFail: "DVIR fail",
    hold: "Hold",
    signOut: "Sign out",
    allIn: "All in",
    fileAs: "Filename stays English for the office.",
    northline: "Northline",
    driveLeft: "Drive left",
    cycle: "Cycle left",
    pay: "This settlement",
    fuel: "Fill Flying J before 06:00. $1.29/L.",
    legal: "Legal lanes only. No extra stop.",
  },
  pa: {
    trip: "ਯਾਤਰਾ",
    scan: "ਸਕੈਨ",
    texts: "ਸੁਨੇਹੇ",
    hours: "ਘੰਟੇ",
    me: "ਮੈਂ",
    jobs: "ਕੰਮ",
    work: "ਦੁਕਾਨ",
    unit: "ਯੂਨਿਟ",
    next: "ਅਗਲਾ ਕਾਗਜ਼",
    scanBtn: "ਲਾਕਰ ਵਿੱਚ ਸਕੈਨ",
    leave: "ਯਾਰਡ ਛੱਡੋ",
    done: "ਡਿਲੀਵਰ",
    cert: "ਲਾਗ ਤਸਦੀਕ",
    empty: "ਕੋਈ ਲੋਡ ਨਹੀਂ।",
    shop: "ਡਰਾਈਵ ਲਾਗ ਨਾ ਕਰੋ।",
    waiting: "ਲੋਕਲ ਪੇਪਰ ਬਾਕੀ।",
    dock: "ਡੌਕ 'ਤੇ ਉਡੀਕ।",
    waitBtn: "ਹਾਲੇ ਉਡੀਕ",
    dvirPass: "DVIR ਠੀਕ",
    dvirFail: "DVIR ਫੇਲ",
    hold: "ਰੋਕ",
    signOut: "ਬਾਹਰ",
    allIn: "ਸਭ ਅੰਦਰ",
    fileAs: "ਫਾਈਲ ਨਾਮ ਅੰਗਰੇਜ਼ੀ ਰਹੇਗਾ।",
    northline: "Northline",
    driveLeft: "ਡਰਾਈਵ ਬਾਕੀ",
    cycle: "ਚੱਕਰ ਬਾਕੀ",
    pay: "ਭੁਗਤਾਨ",
    fuel: "06:00 ਤੋਂ ਪਹਿਲਾਂ ਭਰੋ।",
    legal: "ਕਾਨੂੰਨੀ ਲੇਨ ਹੀ।",
  },
  fr: {
    trip: "Trajet",
    scan: "Scan",
    texts: "Texto",
    hours: "Heures",
    me: "Moi",
    jobs: "Jobs",
    work: "Atelier",
    unit: "Unité",
    next: "Prochain papier",
    scanBtn: "Numériser",
    leave: "Quitter la cour",
    done: "Livré",
    cert: "Certifier",
    empty: "Pas de chargement.",
    shop: "Ne pas logger drive.",
    waiting: "Papiers local en attente.",
    dock: "Au quai. Attente.",
    waitBtn: "Toujours en attente",
    dvirPass: "DVIR ok",
    dvirFail: "DVIR échec",
    hold: "Retenu",
    signOut: "Sortir",
    allIn: "Tout reçu",
    fileAs: "Le nom de fichier reste en anglais.",
    northline: "Northline",
    driveLeft: "Conduite restante",
    cycle: "Cycle restant",
    pay: "Règlement",
    fuel: "Plein avant 06:00. 1,29 $/L.",
    legal: "Voies légales seulement.",
  },
  es: {
    trip: "Viaje",
    scan: "Escanear",
    texts: "Mensajes",
    hours: "Horas",
    me: "Yo",
    jobs: "Trabajos",
    work: "Taller",
    unit: "Unidad",
    next: "Siguiente papel",
    scanBtn: "Escanear al Locker",
    leave: "Salir del patio",
    done: "Entregado",
    cert: "Certificar",
    empty: "Sin carga. Espera despacho.",
    shop: "No registrar drive.",
    waiting: "Faltan papeles del local.",
    dock: "En muelle. Reloj de espera.",
    waitBtn: "Sigo esperando",
    dvirPass: "DVIR ok",
    dvirFail: "DVIR fallo",
    hold: "Retenido",
    signOut: "Salir",
    allIn: "Todo adentro",
    fileAs: "El archivo queda en inglés para la oficina.",
    northline: "Northline",
    driveLeft: "Manejo restante",
    cycle: "Ciclo restante",
    pay: "Este pago",
    fuel: "Llenar Flying J antes de las 06:00. $1.29/L.",
    legal: "Solo carriles legales. Sin parada extra.",
  },
};

function tabsFor(kind: Role): { id: Tab; labelKey: string; icon: typeof Truck }[] {
  if (kind === "local") {
    return [
      { id: "jobs", labelKey: "jobs", icon: ClipboardList },
      { id: "scan", labelKey: "scan", icon: FileScan },
      { id: "texts", labelKey: "texts", icon: MessageSquare },
      { id: "me", labelKey: "me", icon: User },
    ];
  }
  if (kind === "helper") {
    return [
      { id: "jobs", labelKey: "jobs", icon: ClipboardList },
      { id: "texts", labelKey: "texts", icon: MessageSquare },
      { id: "me", labelKey: "me", icon: User },
    ];
  }
  if (kind === "shop") {
    return [
      { id: "work", labelKey: "work", icon: Wrench },
      { id: "unit", labelKey: "unit", icon: Truck },
      { id: "texts", labelKey: "texts", icon: MessageSquare },
      { id: "me", labelKey: "me", icon: User },
    ];
  }
  return [
    { id: "trip", labelKey: "trip", icon: Truck },
    { id: "scan", labelKey: "scan", icon: FileScan },
    { id: "texts", labelKey: "texts", icon: MessageSquare },
    { id: "hours", labelKey: "hours", icon: Clock },
    { id: "me", labelKey: "me", icon: User },
  ];
}

function defaultTab(me: Person, nextPaper?: string, _shop?: boolean): Tab {
  if (me.kind === "shop") return "work";
  if (me.kind === "helper") return "jobs";
  if (me.kind === "local") return nextPaper ? "scan" : "jobs";
  return "trip";
}

function Phone() {
  const me = useHaul((s) => s.people.find((p) => p.id === s.personId));
  const orders = useHaul((s) => s.orders);
  const trucks = useHaul((s) => s.trucks);
  const trailers = useHaul((s) => s.trailers);
  const msgs = useHaul((s) => s.msgs);
  const hos = useHaul((s) => s.hos);
  const pays = useHaul((s) => s.pays);
  const wos = useHaul((s) => s.wos);
  const dvirs = useHaul((s) => s.dvirs);
  const did = useHaul((s) => s.companyDid);
  const scan = useHaul((s) => s.scanPaper);
  const leave = useHaul((s) => s.leaveYard);
  const deliver = useHaul((s) => s.markDelivered);
  const send = useHaul((s) => s.sendMsg);
  const read = useHaul((s) => s.markThreadRead);
  const certify = useHaul((s) => s.certifyHos);
  const runDvir = useHaul((s) => s.dvir);
  const closeWO = useHaul((s) => s.closeWO);
  const setLang = useHaul((s) => s.setLang);
  const lang = (me?.lang as keyof typeof COPY) || "en";
  const t = COPY[lang] ?? COPY.en;
  const [draft, setDraft] = useState("");
  const [tab, setTab] = useState<Tab | null>(null);

  useEffect(() => {
    setTab(null);
    setDraft("");
  }, [me?.id]);

  const mine =
    me?.kind === "local"
      ? orders.filter((o) => o.localId === me.id && o.step !== "done")
      : orders.filter((o) => o.driverId === me?.id && o.step !== "done");
  const o = mine.find((x) => x.step !== "done") ?? mine[0];
  const truck = trucks.find((x) => x.id === (me?.truckId ?? o?.truckId));
  const trailer = trailers.find((x) => x.id === (truck?.trailerId ?? o?.trailerId));
  const truckShop = truck?.status === "shop";
  const trailerShop = trailer?.status === "shop";
  const shopLock = truckShop || trailerShop;
  const pickupNext = o ? missingPickup(o)[0] : undefined;
  const delivNext = o ? missingDelivery(o)[0] : undefined;
  const next =
    !o || shopLock
      ? undefined
      : me?.kind === "local"
        ? pickupNext
        : o.localPicked
          ? delivNext
          : pickupNext;
  const active = tab ?? (me ? defaultTab(me, next, shopLock) : "trip");
  const tabs = me ? tabsFor(me.kind) : [];
  const myHos = hos.find((h) => h.personId === me?.id);
  const myPay = pays.find((p) => p.personId === me?.id);
  const waitCash = o ? detentionDollars(o, DEMO_NOW) : 0;

  const texts = useMemo(() => {
    if (!me) return [];
    return msgs
      .filter((m) => (m.from === me.name || m.to === me.name) && m.channel !== "note" && m.channel !== "voice")
      .slice()
      .sort((a, b) => a.when.localeCompare(b.when) || a.id.localeCompare(b.id));
  }, [msgs, me]);
  const unread = texts.filter((m) => m.from !== me?.name && !m.read).length;

  if (!me) {
    return (
      <div className="mx-auto max-w-sm p-4">
        <h1 className="text-xl font-semibold">Phone</h1>
        <p className="text-sm text-muted">No seat on this phone.</p>
      </div>
    );
  }

  if (!["driver", "local", "helper", "shop"].includes(me.kind)) {
    return (
      <div className="mx-auto max-w-sm p-4">
        <h1 className="text-xl font-semibold">Phone</h1>
        <p className="text-sm text-muted">Desk uses Box. Switch the seat to a driver, local, helper, or shop.</p>
      </div>
    );
  }

  function reply() {
    const body = draft.trim();
    if (!body || !me) return;
    const lastDesk = [...texts].reverse().find((m) => m.from !== me.name);
    send(lastDesk?.from ?? "Alex Dispatch", body, o?.id, "sms");
    setDraft("");
  }

  const DUTY: Record<string, string> = {
    off: "bg-line",
    sleeper: "bg-hold/50",
    drive: "bg-navy",
    on: "bg-warn/70",
  };

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-4 pb-4 pt-1">
        {active === "trip" && (
          <section className="space-y-3">
            {shopLock && (
              <article className="rounded-[var(--radius-md)] border border-bad bg-raised p-4">
                <p className="text-xs uppercase tracking-wide text-bad">
                  {truckShop ? truck?.unit : trailer?.unit}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight">{t.shop}</h2>
                <p className="mt-2 text-sm">{truckShop ? truck?.note : trailer?.fault || trailer?.where}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {truck && <StatusChip kind="truck" status={truck.status} />}
                  {trailer && <StatusChip kind="trailer" status={trailer.status} />}
                </div>
                <p className="mt-2 text-xs text-muted">
                  {trailerShop && !truckShop
                    ? `${trailer?.unit} stays shop. Unhook. Do not pull it.`
                    : `${trailer?.unit ?? "Trailer"} stays shop even if dispatch tries to hook it.`}
                </p>
              </article>
            )}
            {!shopLock && !o && (
              <article className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
                <h2 className="text-2xl font-semibold tracking-tight">{t.empty}</h2>
                <p className="mt-2 text-sm text-muted">
                  {truck?.unit ?? "No unit"} · {truck?.where} · {truck?.hoursLeft.toFixed(1)}h
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {truck && <StatusChip kind="truck" status={truck.status} />}
                  {trailer ? <StatusChip kind="trailer" status={trailer.status} /> : <Chip>no trailer</Chip>}
                </div>
              </article>
            )}
            {!shopLock && o && (
              <article className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
                <p className="font-mono text-xs text-navy">
                  {o.code}
                  {o.dispatchNo ? ` · ${o.dispatchNo}` : ""}
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight">
                  {o.from} → {o.to}
                </h2>
                <p className="mt-1 text-sm text-muted">{o.shipper}</p>
                <dl className="mt-3 space-y-1 text-sm">
                  <Row k="Window" v={o.window} />
                  <Row k="Route" v={o.route || "—"} />
                  <Row k="Truck" v={`${truck?.unit ?? "—"} · ${truck?.status ?? "—"}`} />
                  <Row k="Trailer" v={trailer ? `${trailer.unit} · ${trailer.status}` : "—"} />
                  <Row k="Hours" v={`${(truck?.hoursLeft ?? 0).toFixed(1)}h`} />
                </dl>
                <div className="mt-2 flex flex-wrap gap-2">
                  {truck && <StatusChip kind="truck" status={truck.status} />}
                  {trailer ? <StatusChip kind="trailer" status={trailer.status} /> : <Chip>no trailer</Chip>}
                </div>
                {truck && truck.hoursLeft < 3 && <p className="mt-3 text-sm text-bad">{t.legal}</p>}
                {o.notes && <p className="mt-2 text-sm">{o.notes}</p>}
                {truck?.id === "t-003" && <p className="mt-2 text-sm">{t.fuel}</p>}
                {o.dockAt && (
                  <p className="mt-3 text-sm text-warn">
                    {t.dock} {waitCash ? `· ${money(waitCash)}` : ""}
                  </p>
                )}
                <p className="mt-3 text-xs text-muted">{nextHint(o)}</p>
                <div className="mt-4 flex flex-col gap-2">
                  {next && (
                    <Button className="w-full min-h-12" onClick={() => setTab("scan")}>
                      {t.next}: {next}
                    </Button>
                  )}
                  {!next && me.kind === "driver" && !o.departed && (
                    <Button
                      className="w-full min-h-12"
                      onClick={() => {
                        const err = leave(o.id);
                        if (err) toast.error(err);
                      }}
                    >
                      {t.leave}
                    </Button>
                  )}
                  {!next && o.departed && o.step !== "done" && missingDelivery(o).length === 0 && me.kind === "driver" && (
                    <Button
                      className="w-full min-h-12"
                      variant="yes"
                      onClick={() => {
                        const err = deliver(o.id);
                        if (err) toast.error(err);
                      }}
                    >
                      {t.done}
                    </Button>
                  )}
                  {o.dockAt && me.kind === "driver" && (
                    <Button
                      variant="ghost"
                      onClick={() => send("Alex Dispatch", "Still at dock. Waiting on a door.", o.id, "sms")}
                    >
                      {t.waitBtn}
                    </Button>
                  )}
                </div>
                {canLeaveYard(o) && me.kind === "driver" && !o.departed && (
                  <p className="mt-2 text-xs text-bad">{canLeaveYard(o)}</p>
                )}
                {canDeliver(o) && o.departed && <p className="mt-2 text-xs text-bad">{canDeliver(o)}</p>}
                <Link
                  to="/track/$code"
                  params={{ code: o.track }}
                  className="mt-3 inline-block text-xs text-navy"
                >
                  Public track {o.track}
                </Link>
              </article>
            )}
          </section>
        )}

        {active === "jobs" && me.kind === "local" && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">{t.jobs}</h2>
            {mine.filter((x) => !x.localPicked).length === 0 && (
              <p className="text-sm text-muted">{t.empty}</p>
            )}
            {mine
              .filter((x) => !x.localPicked)
              .map((job) => (
                <article key={job.id} className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
                  <p className="font-mono text-xs text-navy">{job.code}</p>
                  <h3 className="font-semibold">{job.shipper}</h3>
                  <p className="text-sm text-muted">
                    {job.from} → {job.to}
                  </p>
                  <p className="mt-2 text-sm">
                    Trailer {trailers.find((x) => x.id === job.trailerId)?.unit ?? "—"} ·{" "}
                    {trailers.find((x) => x.id === job.trailerId)?.status ?? "—"}
                  </p>
                  <p className="mt-2 text-sm">
                    {missingPickup(job).length ? missingPickup(job).join(" · ") : t.allIn}
                  </p>
                  <Button className="mt-3 w-full" onClick={() => setTab("scan")}>
                    {t.scan}
                  </Button>
                </article>
              ))}
          </section>
        )}

        {active === "jobs" && me.kind === "helper" && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">{t.jobs}</h2>
            <article className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
              <h3 className="font-semibold">Help D. Brar · Magna Brampton</h3>
              <p className="mt-1 text-sm text-muted">Seal photo and packing list. Night sort after 19:00.</p>
            </article>
            <article className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
              <h3 className="font-semibold">Yard walk</h3>
              <p className="mt-1 text-sm text-muted">TR-09 and TR-07 in the yard. TR-06 shop — do not hook.</p>
            </article>
          </section>
        )}

        {active === "scan" && !o && (
          <p className="text-sm text-muted">{t.empty}</p>
        )}
        {active === "scan" && o && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight">{t.scan}</h2>
              <select
                className="min-h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm"
                value={lang}
                onChange={(e) => setLang(e.target.value as "en")}
                aria-label="Language"
              >
                <option value="en">EN</option>
                <option value="pa">PA</option>
                <option value="fr">FR</option>
                <option value="es">ES</option>
              </select>
            </div>
            <article className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
              <p className="text-xs uppercase tracking-wide text-navy">{t.next}</p>
              <h3 className="mt-2 text-3xl font-semibold tracking-tight">{next ?? t.allIn}</h3>
              <p className="mt-2 text-sm">{nextHint(o)}</p>
              <div className="mt-4 grid aspect-video place-items-center rounded-[var(--radius-sm)] border border-dashed border-line bg-paper text-xs text-muted">
                {next ? `${next.replace(/\s/g, "-")}-${o.code}.jpg` : t.allIn}
              </div>
              {next && (
                <Button
                  className="mt-4 w-full min-h-12"
                  onClick={() => scan(o.id, next, me.name, next.includes("Seal") ? "448291" : undefined)}
                >
                  {t.scanBtn}
                </Button>
              )}
              <p className="mt-2 text-[11px] text-muted">{t.fileAs}</p>
            </article>
            <ul className="space-y-1 text-sm">
              {o.papers
                .filter((p) => (me.kind === "local" ? p.at === "pickup" : true))
                .map((p, i) => (
                  <li key={p.name + i} className="flex justify-between">
                    <span>
                      {p.at} · {p.name}
                    </span>
                    <Chip tone={p.scanned ? "ok" : "warn"}>{p.scanned ? "in" : "—"}</Chip>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {active === "hours" && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">{t.hours}</h2>
            {shopLock && <p className="text-sm text-bad">{t.shop}</p>}
            {myHos ? (
              <article className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
                <p className="text-xs text-muted">{myHos.ruleset}</p>
                <p className="mt-1 font-mono text-4xl tabular-nums tracking-tight">
                  {myHos.driveLeft.toFixed(1)}
                  <span className="ml-2 text-base text-muted">{t.driveLeft}</span>
                </p>
                <p className="mt-1 text-sm text-muted">
                  {t.cycle} {myHos.cycleLeft.toFixed(0)}h
                </p>
                <div className="mt-4 flex h-6 overflow-hidden rounded-[var(--radius-xs)]">
                  {myHos.events.map((e, i) => {
                    const total = myHos.events.reduce((a, x) => a + x.hours, 0) || 24;
                    return (
                      <div
                        key={i}
                        className={DUTY[e.duty]}
                        style={{ width: `${(e.hours / total) * 100}%` }}
                        title={`${e.duty} ${e.hours}h`}
                      />
                    );
                  })}
                </div>
                <p className="mt-2 text-[11px] text-muted">off · sleeper · drive · on-duty</p>
                {!myHos.certified && (
                  <Button className="mt-4 w-full" onClick={() => certify(me.id)}>
                    {t.cert}
                  </Button>
                )}
                {myHos.certified && <p className="mt-3 text-xs text-ok">Certified</p>}
                {truck?.unit === "T-003" && (
                  <p className="mt-3 text-sm text-bad">No reload after Toledo. Clock would break.</p>
                )}
              </article>
            ) : (
              <p className="text-sm text-muted">No ELD on this seat.</p>
            )}
          </section>
        )}

        {active === "work" && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">{t.work}</h2>
            {wos.map((w) => {
              const u = trucks.find((x) => x.id === w.truckId);
              const tr = trailers.find((x) => x.id === w.trailerId);
              return (
                <article key={w.id} className="rounded-[var(--radius-md)] border border-line bg-raised p-4">
                  <p className="font-mono text-xs">
                    {w.id}
                    {u ? ` · ${u.unit}` : ""}
                    {tr ? ` · ${tr.unit}` : ""}
                  </p>
                  <h3 className="font-semibold">{w.title}</h3>
                  <p className="text-sm text-muted">
                    Parts: {w.parts} · ETA {w.eta}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {u && <StatusChip kind="truck" status={u.status} />}
                    {tr && <StatusChip kind="trailer" status={tr.status} />}
                  </div>
                  <p className="mt-2 text-sm">Downtime {money(w.downtime)} today.</p>
                  {w.status !== "done" && (
                    <Button className="mt-3 w-full" onClick={() => closeWO(w.id)}>
                      Shop clear · DVIR signed
                    </Button>
                  )}
                  {w.status === "done" && <Chip tone="ok">done</Chip>}
                </article>
              );
            })}
            {wos.length === 0 && <p className="text-sm text-muted">No open work.</p>}
          </section>
        )}

        {active === "unit" && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">{t.unit}</h2>
            <p className="text-xs text-muted">Truck status and trailer status are not the same.</p>
            {trucks.map((u) => {
              const hooked = trailers.find((x) => x.id === u.trailerId);
              return (
                <article key={u.id} className="rounded-[var(--radius-md)] border border-line bg-raised p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-mono font-semibold">{u.unit}</p>
                    <StatusChip kind="truck" status={u.status} />
                  </div>
                  <p className="mt-1 text-muted">
                    {u.make} · {u.fault || "no fault"} · {hooked ? `${hooked.unit} ${hooked.status}` : "no trailer"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => runDvir({ truckId: u.id }, "pass", "Shop walk ok")}>{t.dvirPass}</Button>
                    <Button variant="danger" onClick={() => runDvir({ truckId: u.id }, "fail", "Defect found")}>
                      {t.dvirFail}
                    </Button>
                  </div>
                </article>
              );
            })}
            {trailers.map((u) => (
              <article key={u.id} className="rounded-[var(--radius-md)] border border-line bg-raised p-4 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-mono font-semibold">{u.unit}</p>
                  <StatusChip kind="trailer" status={u.status} />
                </div>
                <p className="mt-1 text-muted">
                  {u.kind} · {u.fault || "no fault"} · {u.where}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button onClick={() => runDvir({ trailerId: u.id }, "pass", "Trailer walk ok")}>Trailer pass</Button>
                  <Button variant="danger" onClick={() => runDvir({ trailerId: u.id }, "fail", "Trailer defect")}>
                    Trailer fail
                  </Button>
                </div>
              </article>
            ))}
          </section>
        )}

        {active === "texts" && (
          <section className="overflow-hidden rounded-[var(--radius-md)] border border-line bg-raised" aria-label="Texts with Northline">
            <header className="border-b border-line px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-navy">{t.texts}</p>
              <p className="font-semibold">{t.northline}</p>
              <p className="font-mono text-[11px] text-muted">{did}</p>
            </header>
            <div className="max-h-80 space-y-2 overflow-auto p-3" role="log" aria-label="Texts with Northline">
              {texts.length === 0 && (
                <p className="px-4 py-10 text-center text-sm text-muted">No texts yet. Dispatch shows up as Northline.</p>
              )}
              {texts.map((m) => {
                const mineMsg = m.from === me.name;
                return (
                  <div key={m.id} className={cn("flex", mineMsg ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-[var(--radius-md)] px-3 py-2 text-sm",
                        mineMsg ? "bg-navy text-paper" : "bg-paper",
                      )}
                    >
                      <p className="whitespace-pre-wrap leading-5">{m.text}</p>
                      <p className={cn("mt-0.5 text-right font-mono text-[10px]", mineMsg ? "text-paper/70" : "text-muted")}>
                        {m.when}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form
              className="flex gap-2 border-t border-line p-3"
              onSubmit={(e) => {
                e.preventDefault();
                reply();
              }}
            >
              <textarea
                rows={1}
                className="min-h-11 flex-1 resize-none rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2 text-sm"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    reply();
                  }
                }}
                onFocus={() => {
                  const lastDesk = [...texts].reverse().find((m) => m.from !== me.name);
                  if (lastDesk) read(lastDesk.from);
                }}
                placeholder="Text message"
              />
              <Button type="submit" disabled={!draft.trim()} aria-label="Send text">
                Send
              </Button>
            </form>
            <p className="px-3 pb-3 text-[11px] text-muted">Internal desk notes never appear here.</p>
          </section>
        )}

        {active === "me" && (
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight">{me.name}</h2>
            <article className="rounded-[var(--radius-md)] border border-line bg-raised p-4 text-sm">
              <dl className="space-y-1">
                <Row k="Seat" v={me.kind} />
                <Row k="Truck" v={truck ? `${truck.unit} · ${truck.status}` : "—"} />
                <Row k="Trailer" v={trailer ? `${trailer.unit} · ${trailer.status}` : "—"} />
                <Row k="PIN" v={me.pin} />
                <Row k="FAST" v={me.fast ? "yes" : "—"} />
                <Row k="Med" v={me.med || "—"} />
                <Row k="CDL" v={me.cdl || "—"} />
                {myPay && <Row k={t.pay} v={money(myPay.amount)} />}
                {me.hold > 0 && <Row k={t.hold} v={moneyExact(me.hold)} />}
                {me.rate > 0 && <Row k="Rate" v={`${me.payType} ${me.rate}${me.rateUnit}`} />}
              </dl>
              {truck && me.kind === "driver" && (
                <div className="mt-4 space-y-2">
                  <div className="flex gap-2">
                    <Button onClick={() => runDvir({ truckId: truck.id }, "pass", "Pre-trip ok")}>Truck pass</Button>
                    <Button variant="danger" onClick={() => runDvir({ truckId: truck.id }, "fail", "Defect found")}>
                      Truck fail
                    </Button>
                  </div>
                  {trailer && (
                    <div className="flex gap-2">
                      <Button onClick={() => runDvir({ trailerId: trailer.id }, "pass", "Trailer pre-trip ok")}>
                        Trailer pass
                      </Button>
                      <Button variant="danger" onClick={() => runDvir({ trailerId: trailer.id }, "fail", "Trailer defect")}>
                        Trailer fail
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {dvirs
                .filter((d) => d.truckId === truck?.id || (trailer && d.trailerId === trailer.id))
                .slice(0, 3)
                .map((d) => (
                  <p key={d.id} className="mt-2 text-xs text-muted">
                    Last DVIR {d.truckId ? "truck" : "trailer"} {d.result} · {d.note}
                  </p>
                ))}
              <label className="mt-4 block text-xs text-muted">
                Language
                <select
                  className="mt-1 min-h-11 w-full rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm text-ink"
                  value={lang}
                  onChange={(e) => setLang(e.target.value as "en")}
                >
                  <option value="en">English</option>
                  <option value="pa">ਪੰਜਾਬੀ</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                </select>
              </label>
              <Link to="/" className="mt-4 inline-block text-sm text-navy">
                {t.signOut}
              </Link>
            </article>
          </section>
        )}
      </div>

      <nav className="mt-auto flex border-t border-line bg-raised">
        {tabs.map((n) => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={cn(
              "flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 text-[11px]",
              active === n.id ? "font-semibold text-navy" : "text-muted",
            )}
          >
            <span className="relative">
              <n.icon className="size-4" />
              {n.id === "texts" && unread > 0 && (
                <span className="absolute -right-2 -top-1 rounded-full bg-bad px-1 text-[9px] text-paper">{unread}</span>
              )}
            </span>
            {t[n.labelKey] ?? n.labelKey}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{k}</dt>
      <dd className="font-mono text-xs">{v}</dd>
    </div>
  );
}
