import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Megaphone, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/desk/chips";
import { useHaul } from "@/lib/haulos/store";
import type { BoxGroup, Channel, Person, Workflow } from "@/lib/haulos/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/box")({ component: Box });

const FIELD: Person["kind"][] = ["driver", "local", "helper", "shop"];
const STAFF: Person["kind"][] = ["owner", "dispatcher", "hr", "backoffice", "admin", "safety"];
const WORK: { id: Workflow; label: string }[] = [
  { id: "new", label: "New" },
  { id: "open", label: "Open" },
  { id: "in_progress", label: "In progress" },
  { id: "waiting", label: "Waiting" },
  { id: "resolved", label: "Resolved" },
];
const TAGS = ["JIT", "HOS", "Fuel", "Wait", "Breakdown"];

function initials(name: string) {
  const parts = name.replaceAll(".", "").split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function workLabel(id: Workflow) {
  return WORK.find((w) => w.id === id)?.label ?? id;
}

function isDeskChannel(ch: Channel) {
  return ch !== "voice";
}

function Box() {
  const people = useHaul((s) => s.people);
  const msgs = useHaul((s) => s.msgs);
  const trucks = useHaul((s) => s.trucks);
  const threads = useHaul((s) => s.boxThreads);
  const groups = useHaul((s) => s.boxGroups);
  const activity = useHaul((s) => s.boxActivity);
  const me = useHaul((s) => s.people.find((p) => p.id === s.personId));
  const did = useHaul((s) => s.companyDid);
  const kill = useHaul((s) => s.kill);
  const send = useHaul((s) => s.sendMsg);
  const read = useHaul((s) => s.markThreadRead);
  const assign = useHaul((s) => s.assignThread);
  const setStatus = useHaul((s) => s.setThreadStatus);
  const patch = useHaul((s) => s.patchThread);
  const createGroup = useHaul((s) => s.createGroup);
  const renameGroup = useHaul((s) => s.renameGroup);
  const broadcast = useHaul((s) => s.broadcast);
  const inbound = useHaul((s) => s.simulateInbound);
  const reset = useHaul((s) => s.resetDemo);

  const [peerId, setPeerId] = useState("p-alvarez");
  const [q, setQ] = useState("");
  const [asg, setAsg] = useState<"all" | "me" | "unassigned" | string>("all");
  const [readF, setReadF] = useState<"all" | "unread" | "read">("all");
  const [stF, setStF] = useState<"all" | Workflow>("all");
  const [gF, setGF] = useState<string[]>([]);
  const [tagF, setTagF] = useState<string | null>(null);
  const [today, setToday] = useState(false);
  const [mode, setMode] = useState<"sms" | "note">("sms");
  const [draft, setDraft] = useState("");
  const [pane, setPane] = useState<"list" | "chat">("list");
  const [showContact, setShowContact] = useState(false);
  const [castOpen, setCastOpen] = useState(false);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [castGroups, setCastGroups] = useState<string[]>([]);
  const [castTags, setCastTags] = useState<string[]>([]);
  const [castBody, setCastBody] = useState("");
  const [castSent, setCastSent] = useState<number | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const meName = me?.name ?? "Desk";
  const canSend = me ? STAFF.includes(me.kind) : false;
  const roster = people.filter((p) => STAFF.includes(p.kind));

  const allRows = useMemo(() => {
    return threads
      .map((t) => {
        const person = people.find((p) => p.id === t.personId);
        if (!person || !FIELD.includes(person.kind)) return null;
        const truck = trucks.find((x) => x.id === person.truckId);
        const staffNames = new Set(people.filter((p) => STAFF.includes(p.kind)).map((p) => p.name));
        const threadMsgs = msgs.filter((m) => {
          if (!isDeskChannel(m.channel)) return false;
          if (m.from === person.name) return true;
          if (m.to === person.name && (staffNames.has(m.from) || m.channel === "note")) return true;
          return false;
        });
        const last = threadMsgs.slice().sort((a, b) => b.when.localeCompare(a.when) || b.id.localeCompare(a.id))[0];
        const unread = threadMsgs.filter((m) => m.from === person.name && !m.read && m.channel !== "note").length;
        return { t, person, truck, last, unread, threadMsgs };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x));
  }, [threads, people, trucks, msgs]);

  const rows = allRows
    .filter((row) => {
      if (q) {
        const hay = `${row.person.name} ${row.person.phone} ${row.truck?.unit ?? ""} ${row.last?.text ?? ""}`.toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      if (asg === "me" && row.t.assignedTo !== me?.id) return false;
      if (asg === "unassigned" && row.t.assignedTo) return false;
      if (asg !== "all" && asg !== "me" && asg !== "unassigned" && row.t.assignedTo !== asg) return false;
      if (readF === "unread" && row.unread === 0) return false;
      if (readF === "read" && row.unread > 0) return false;
      if (stF !== "all" && row.t.status !== stF) return false;
      if (gF.length > 0 && !gF.some((g) => row.t.groups.includes(g))) return false;
      if (tagF && !row.t.tags.includes(tagF)) return false;
      if (today && row.last && row.last.when.includes("yesterday")) return false;
      return true;
    })
    .sort((a, b) => (b.last?.when ?? "").localeCompare(a.last?.when ?? ""));

  const filtersActive =
    q !== "" || asg !== "all" || readF !== "all" || stF !== "all" || gF.length > 0 || tagF !== null || today;
  const unreadTotal = allRows.reduce((n, r) => n + r.unread, 0);
  const selected = allRows.find((r) => r.person.id === peerId) ?? null;
  const thread = selected
    ? selected.threadMsgs.slice().sort((a, b) => a.when.localeCompare(b.when) || a.id.localeCompare(b.id))
    : [];
  const threadActivity = selected ? activity.filter((a) => a.personId === selected.person.id) : [];

  const others = useMemo(() => {
    if (!selected || !me) return [];
    const names: { name: string; mode: "viewing" | "replying" }[] = [];
    if (selected.t.assignedTo && selected.t.assignedTo !== me.id) {
      const p = people.find((x) => x.id === selected.t.assignedTo);
      if (p) names.push({ name: p.name, mode: "viewing" });
    }
    if (selected.t.status === "in_progress" && me.id !== "p-priya") {
      if (!names.some((n) => n.name === "Priya Owner")) names.push({ name: "Priya Owner", mode: "viewing" });
    }
    return names;
  }, [selected, me, people]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [thread.length, peerId]);

  useEffect(() => {
    if (selected && selected.unread > 0) read(selected.person.name);
  }, [peerId, selected?.unread, selected?.person.name, read]);

  function openThread(id: string, name: string) {
    setPeerId(id);
    read(name);
    setPane("chat");
    setShowContact(false);
  }

  function submit() {
    if (!selected || !draft.trim() || !canSend) return;
    send(selected.person.name, draft.trim(), undefined, mode === "note" ? "note" : "sms");
    setDraft("");
  }

  function clearFilters() {
    setQ("");
    setAsg("all");
    setReadF("all");
    setStF("all");
    setGF([]);
    setTagF(null);
    setToday(false);
  }

  function targetsFor(groupIds: string[], tagIds: string[]) {
    const ids = new Set(
      threads
        .filter((t) => t.groups.some((g) => groupIds.includes(g)) || t.tags.some((tag) => tagIds.includes(tag)))
        .map((t) => t.personId),
    );
    return people.filter((p) => ids.has(p.id));
  }

  const targets = targetsFor(castGroups, castTags);

  return (
    <div className="flex h-[calc(100dvh-7rem)] min-h-[520px] flex-col gap-2">
      <header className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight">Box</h1>
          <p className="text-xs text-muted">One shared SMS desk · {did} · {unreadTotal} unread</p>
        </div>
        {canSend && (
          <>
            <Button variant="ghost" onClick={() => setGroupsOpen(true)}>
              <Users className="size-4" />
              Groups
            </Button>
            <Button variant="ghost" onClick={() => { setCastOpen(true); setCastSent(null); }}>
              <Megaphone className="size-4" />
              Mass broadcast
            </Button>
          </>
        )}
        <Button variant="quiet" onClick={reset}>
          Reset desk
        </Button>
      </header>

      <div className="grid min-h-0 flex-1 gap-2 lg:grid-cols-[300px_1fr] xl:grid-cols-[300px_1fr_260px]">
        <aside className={cn("flex min-h-0 flex-col rounded-[var(--radius-md)] border border-line bg-raised", pane === "chat" && "hidden lg:flex")}>
          <div className="border-b border-line p-3">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <span className="sr-only">Search conversations</span>
              <input
                id="thread-search"
                className="min-h-11 w-full rounded-[var(--radius-sm)] border border-line bg-paper pl-9 pr-3 text-sm"
                placeholder="Search name, phone, truck"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </label>
            <div className="mt-2 flex items-baseline justify-between gap-2">
              <p className="font-mono text-[11px] uppercase tracking-wide text-muted">Shared inbox</p>
              <p className="font-mono text-[11px] text-navy">
                {unreadTotal} unread · {rows.length} shown
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {groups.map((g) => {
                const on = gF.includes(g.id);
                return (
                  <button key={g.id} type="button" onClick={() => setGF(on ? gF.filter((x) => x !== g.id) : [...gF, g.id])}>
                    <Chip tone={on ? g.tone : "muted"}>{g.name}</Chip>
                  </button>
                );
              })}
            </div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              <select className="min-h-10 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-xs" value={asg} onChange={(e) => setAsg(e.target.value)}>
                <option value="all">Assigned · all</option>
                <option value="me">Assigned · me</option>
                <option value="unassigned">Unassigned</option>
                {roster.filter((p) => p.id !== me?.id).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.split(" ")[0]}
                  </option>
                ))}
              </select>
              <select className="min-h-10 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-xs" value={readF} onChange={(e) => setReadF(e.target.value as typeof readF)}>
                <option value="all">Read · any</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>
              <select className="min-h-10 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-xs" value={stF} onChange={(e) => setStF(e.target.value as typeof stF)}>
                <option value="all">Status · all</option>
                {WORK.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className={cn("min-h-10 rounded-[var(--radius-sm)] border px-2 text-xs", today ? "border-navy bg-navy text-paper" : "border-line")}
                onClick={() => setToday((v) => !v)}
              >
                Today
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {TAGS.map((tag) => {
                const on = tagF === tag;
                return (
                  <button key={tag} type="button" onClick={() => setTagF(on ? null : tag)}>
                    <Chip tone={on ? "warn" : "muted"}>{tag}</Chip>
                  </button>
                );
              })}
            </div>
            {filtersActive ? (
              <button type="button" className="mt-2 font-mono text-[11px] text-navy" onClick={clearFilters}>
                Clear filters · full inbox
              </button>
            ) : (
              <p className="mt-2 font-mono text-[10px] uppercase tracking-wide text-muted">Filters are views — one shared desk</p>
            )}
          </div>
          <ul className="min-h-0 flex-1 overflow-auto" role="listbox" aria-label="Conversations">
            {rows.length === 0 && <li className="p-4 text-sm text-muted">No threads match this view. Clear filters to see the full shared inbox.</li>}
            {rows.map((row) => {
              const on = selected?.person.id === row.person.id;
              const assignee = roster.find((p) => p.id === row.t.assignedTo);
              const chips = row.t.groups
                .map((id) => groups.find((g) => g.id === id))
                .filter((g): g is BoxGroup => Boolean(g));
              return (
                <li key={row.person.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={on}
                    onClick={() => openThread(row.person.id, row.person.name)}
                    className={cn(
                      "flex min-h-14 w-full gap-2 border-b border-line px-3 py-2 text-left text-sm",
                      on ? "border-l-2 border-l-navy bg-paper" : "hover:bg-paper",
                    )}
                  >
                    <span className={cn("mt-0.5 grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-line bg-paper font-mono text-[11px]", on && "border-navy text-navy")}>
                      {initials(row.person.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex w-full items-baseline justify-between gap-2">
                        <span className={cn("truncate", row.unread ? "font-semibold" : "font-medium")}>{row.person.name}</span>
                        <span className="font-mono text-[11px] text-muted">{row.last?.when ?? ""}</span>
                      </span>
                      <span className="block font-mono text-[11px] text-muted">
                        {row.person.phone}
                        {row.truck ? ` · ${row.truck.unit}` : ""}
                      </span>
                      <span className={cn("mt-0.5 block truncate text-xs", row.unread ? "text-ink" : "text-muted")}>
                        {row.last?.channel === "note" ? `Note · ${row.last.text}` : (row.last?.text ?? "No messages yet")}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        <Chip tone="navy">{workLabel(row.t.status)}</Chip>
                        <Chip tone={assignee ? "warn" : "muted"}>{assignee ? assignee.name.split(" ")[0] : "Unassigned"}</Chip>
                        {chips.slice(0, 2).map((g) => (
                          <Chip key={g.id} tone={g.tone}>{g.name}</Chip>
                        ))}
                      </span>
                    </span>
                    {row.unread > 0 && (
                      <span className="mt-1 h-5 min-w-5 shrink-0 rounded-full bg-bad px-1.5 text-center font-mono text-[10px] text-paper">{row.unread}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <section className={cn("flex min-h-0 flex-col rounded-[var(--radius-md)] border border-line bg-raised", pane === "list" && "hidden lg:flex")}>
          {!selected ? (
            <div className="grid flex-1 place-items-center p-8 text-center">
              <p className="text-sm font-medium">Select a driver thread</p>
              <p className="mt-1 max-w-sm text-xs text-muted">One shared inbox. Filters and assignment are views — never a private copy.</p>
            </div>
          ) : (
            <>
              <header className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2">
                <button className="grid size-11 place-items-center lg:hidden" onClick={() => setPane("list")} aria-label="Back to threads">
                  <ArrowLeft className="size-4" />
                </button>
                <span className="grid size-9 shrink-0 place-items-center rounded-[var(--radius-sm)] border border-line bg-paper font-mono text-[11px]">
                  {initials(selected.person.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{selected.person.name}</p>
                  <p className="font-mono text-[11px] text-muted">
                    {selected.person.phone}
                    {selected.truck ? ` · ${selected.truck.unit}` : ""}
                    {selected.truck ? ` · ${selected.truck.where}` : ` · ${selected.person.kind}`}
                  </p>
                </div>
                <Button variant="ghost" className="xl:hidden" onClick={() => setShowContact((v) => !v)}>
                  Contact
                </Button>
                <Button variant="ghost" onClick={() => inbound(selected.person.id)}>
                  Simulate inbound
                </Button>
                <select
                  id="thread-status"
                  className="min-h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-xs"
                  value={selected.t.status}
                  disabled={!canSend}
                  onChange={(e) => setStatus(selected.person.id, e.target.value as Workflow)}
                >
                  {WORK.map((w) => (
                    <option key={w.id} value={w.id}>{w.label}</option>
                  ))}
                </select>
                <select
                  id="thread-assign"
                  className="min-h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-xs"
                  value={selected.t.assignedTo ?? ""}
                  disabled={!canSend}
                  onChange={(e) => assign(selected.person.id, e.target.value || null)}
                >
                  <option value="">Unassigned</option>
                  {roster.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </header>
              {others.length > 0 && (
                <p className="mx-3 mt-2 rounded-[var(--radius-sm)] border border-navy/30 bg-navy/10 px-3 py-2 font-mono text-[11px] text-navy" role="status">
                  {others.map((o) => o.name).join(", ")} {others.length === 1 ? "is" : "are"} viewing this conversation.
                </p>
              )}
              {showContact && (
                <div className="xl:hidden">
                  <ContactPane
                    selected={selected}
                    groups={groups}
                    activity={threadActivity}
                    canSend={canSend}
                    patch={patch}
                  />
                </div>
              )}
              <div
                ref={logRef}
                className="min-h-0 flex-1 space-y-3 overflow-auto p-4"
                role="log"
                aria-live="polite"
                aria-label={`Thread with ${selected.person.name}`}
              >
                {thread.length === 0 && <p className="py-16 text-center text-sm text-muted">No messages on this thread yet.</p>}
                {thread.map((m) => {
                  const mine = m.from === meName || (STAFF.includes(people.find((p) => p.name === m.from)?.kind ?? "driver") && m.from !== selected.person.name);
                  const note = m.channel === "note";
                  if (note) {
                    return (
                      <article key={m.id} className="mx-auto w-full max-w-xl rounded-[var(--radius-md)] border border-dashed border-warn/50 bg-warn/10 px-4 py-3">
                        <p className="mb-1 font-mono text-[10px] uppercase tracking-wide text-warn">
                          Internal · {m.from} · {m.when} · Staff only
                        </p>
                        <p className="text-sm">{m.text}</p>
                      </article>
                    );
                  }
                  return (
                    <article key={m.id} className={cn("flex w-full", mine ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[85%] rounded-[var(--radius-md)] border px-3 py-2", mine ? "border-navy/20 bg-navy text-paper" : "border-line bg-paper")}>
                        <p className={cn("mb-1 flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wide", mine ? "text-paper/80" : "text-muted")}>
                          <span>{mine ? `SMS · ${m.from}` : m.from}</span>
                          {m.broadcast ? (
                            <span className={cn("rounded-[var(--radius-xs)] border px-1.5 py-px", mine ? "border-paper/40 text-paper" : "border-warn/40 text-warn")}>
                              Broadcast
                            </span>
                          ) : null}
                          <span>{m.when}</span>
                        </p>
                        <p className="text-sm leading-6">{m.text}</p>
                      </div>
                    </article>
                  );
                })}
              </div>
              <form
                className="border-t border-line p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <div className="mb-2 flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    className={cn("min-h-10 rounded-[var(--radius-sm)] px-3 text-xs", mode === "sms" ? "bg-navy text-paper" : "border border-line")}
                    onClick={() => setMode("sms")}
                    aria-pressed={mode === "sms"}
                  >
                    SMS to driver
                  </button>
                  <button
                    type="button"
                    className={cn("min-h-10 rounded-[var(--radius-sm)] px-3 text-xs", mode === "note" ? "bg-warn text-paper" : "border border-line")}
                    onClick={() => setMode("note")}
                    aria-pressed={mode === "note"}
                  >
                    Internal note
                  </button>
                  <span className="self-center text-[11px] text-muted">
                    {!canSend
                      ? "Read-only — field seats reply from Phone"
                      : mode === "sms"
                        ? `Desk shows ${meName} · driver sees Northline`
                        : `Staff only · ${meName}`}
                  </span>
                </div>
                <div className="flex gap-2">
                  <textarea
                    id="composer-body"
                    rows={2}
                    className="min-h-14 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2 text-sm"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                        e.preventDefault();
                        submit();
                      }
                    }}
                    placeholder={
                      !canSend
                        ? "Field seats reply from Phone"
                        : kill.outbound && mode === "sms"
                          ? "Outbound frozen"
                          : mode === "sms"
                            ? `Text ${selected.person.name}…`
                            : "Private note for the desk. Drivers never see this."
                    }
                    disabled={!canSend}
                  />
                  <Button type="submit" disabled={!canSend || !draft.trim() || (kill.outbound && mode === "sms")}>
                    {mode === "sms" ? "Send SMS" : "Post note"}
                  </Button>
                </div>
                <p className="mt-1 text-[11px] text-muted">Ctrl+Enter to send · demo, nothing leaves the building</p>
              </form>
            </>
          )}
        </section>

        {selected && (
          <aside className="hidden min-h-0 xl:block">
            <ContactPane selected={selected} groups={groups} activity={threadActivity} canSend={canSend} patch={patch} />
          </aside>
        )}
      </div>

      {castOpen && (
        <div className="fixed inset-0 z-40 grid place-items-end bg-ink/50 p-4 sm:place-items-center" onClick={() => setCastOpen(false)}>
          <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-line bg-raised p-4" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="cast-title">
            <h2 id="cast-title" className="font-semibold">Broadcast to groups</h2>
            <p className="mt-2 rounded-[var(--radius-sm)] border border-warn/40 bg-warn/10 px-3 py-2 text-xs">
              Replies come back as private 1:1 threads — not a group chat.
            </p>
            <p className="mt-3 font-mono text-[11px] uppercase text-muted">Select groups</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {groups.map((g) => {
                const on = castGroups.includes(g.id);
                const n = targetsFor([g.id], []).length;
                return (
                  <button key={g.id} type="button" onClick={() => { setCastGroups(on ? castGroups.filter((x) => x !== g.id) : [...castGroups, g.id]); setCastSent(null); }}>
                    <Chip tone={on ? g.tone : "muted"}>{g.name} · {n}</Chip>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 font-mono text-[11px] uppercase text-muted">Tags</p>
            <div className="mt-1 flex flex-wrap gap-2">
              {TAGS.map((tag) => {
                const on = castTags.includes(tag);
                return (
                  <button key={tag} type="button" onClick={() => { setCastTags(on ? castTags.filter((x) => x !== tag) : [...castTags, tag]); setCastSent(null); }}>
                    <Chip tone={on ? "warn" : "muted"}>{tag}</Chip>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 font-mono text-[11px] uppercase text-muted">
              {targets.length === 0 ? "No drivers selected" : `${targets.length} driver${targets.length === 1 ? "" : "s"} will receive this SMS`}
            </p>
            {targets.length > 0 && (
              <ul className="mt-1 max-h-28 overflow-auto rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2 font-mono text-xs text-muted">
                {targets.map((p) => (
                  <li key={p.id} className="flex justify-between gap-2 py-0.5">
                    <span className="text-ink">{p.name}</span>
                    <span>{p.phone}</span>
                  </li>
                ))}
              </ul>
            )}
            <textarea
              className="mt-3 min-h-24 w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2 text-sm"
              value={castBody}
              onChange={(e) => { setCastBody(e.target.value); setCastSent(null); }}
              placeholder="Yard closed at 1900. Do not deadhead without a new load."
            />
            <p className="mt-1 font-mono text-[11px] text-muted">Sends as {meName}. Drivers answer in their own thread.</p>
            {castSent !== null && (
              <p className="mt-2 font-mono text-xs text-ok" role="status">
                Sent {castSent} SMS. Replies will land in each 1:1 inbox.
              </p>
            )}
            <div className="mt-3 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setCastOpen(false)}>Close</Button>
              <Button
                onClick={() => {
                  const n = broadcast(castGroups, castBody.trim(), castTags);
                  if (n > 0) setCastSent(n);
                }}
                disabled={!castBody.trim() || (castGroups.length === 0 && castTags.length === 0)}
              >
                Send {targets.length || ""} SMS
              </Button>
            </div>
          </div>
        </div>
      )}

      {groupsOpen && (
        <div className="fixed inset-0 z-40 grid place-items-end bg-ink/50 p-4 sm:place-items-center" onClick={() => setGroupsOpen(false)}>
          <div className="w-full max-w-md rounded-[var(--radius-lg)] border border-line bg-raised p-4" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="grp-title">
            <h2 id="grp-title" className="font-semibold">Contact groups</h2>
            <form
              className="mt-3 flex gap-1"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                createGroup(String(fd.get("name") ?? ""));
                e.currentTarget.reset();
              }}
            >
              <input name="name" className="min-h-11 flex-1 rounded-[var(--radius-sm)] border border-line bg-paper px-2 text-sm" placeholder="New group name" />
              <Button type="submit">Add group</Button>
            </form>
            <ul className="mt-3 space-y-2">
              {groups.map((g) => (
                <GroupRow key={g.id} group={g} onRename={renameGroup} />
              ))}
            </ul>
            <div className="mt-3 flex justify-end">
              <Button variant="ghost" onClick={() => setGroupsOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GroupRow({ group, onRename }: { group: BoxGroup; onRename: (id: string, name: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(group.name);
  return (
    <li className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2">
      <Chip tone={group.tone}>{group.name}</Chip>
      {editing ? (
        <form
          className="flex min-w-0 flex-1 gap-1"
          onSubmit={(e) => {
            e.preventDefault();
            onRename(group.id, name);
            setEditing(false);
          }}
        >
          <input className="min-h-10 min-w-0 flex-1 rounded-[var(--radius-sm)] border border-line bg-raised px-2 text-sm" value={name} onChange={(e) => setName(e.target.value)} />
          <Button type="submit" variant="ghost">Save</Button>
        </form>
      ) : (
        <button type="button" className="ml-auto font-mono text-[11px] uppercase text-muted" onClick={() => setEditing(true)}>
          Rename
        </button>
      )}
    </li>
  );
}

function ContactPane({
  selected,
  groups,
  activity,
  canSend,
  patch,
}: {
  selected: {
    person: Person;
    truck?: { unit: string; where: string } | undefined;
    t: { assignedTo: string | null; status: Workflow; groups: string[]; tags: string[]; deskNote: string };
  };
  groups: BoxGroup[];
  activity: { id: string; when: string; who: string; detail: string }[];
  canSend: boolean;
  patch: (personId: string, next: Partial<{ deskNote: string; groups: string[]; tags: string[] }>) => void;
}) {
  const assignee = useHaul((s) => s.people.find((p) => p.id === selected.t.assignedTo));
  return (
    <div className="flex h-full min-h-0 flex-col overflow-auto rounded-[var(--radius-md)] border border-line bg-raised p-4 text-sm">
      <p className="font-mono text-[11px] uppercase tracking-wide text-navy">Contact</p>
      <h2 className="mt-1 text-lg font-semibold">{selected.person.name}</h2>
      <p className="mt-1 font-mono text-xs text-muted">{selected.person.phone}</p>
      <p className="mt-1 font-mono text-[11px] uppercase text-muted">
        {workLabel(selected.t.status)} · {assignee?.name ?? "Unassigned"}
      </p>
      <dl className="mt-4 space-y-2 text-xs">
        <div>
          <dt className="font-mono text-[10px] uppercase text-muted">Phone</dt>
          <dd className="mt-0.5 rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2 font-mono">{selected.person.phone}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase text-muted">Driver ID</dt>
          <dd className="mt-0.5 rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2 font-mono">{selected.person.pin}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase text-muted">Truck</dt>
          <dd className="mt-0.5 rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2 font-mono">{selected.truck?.unit ?? "—"}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase text-muted">Terminal</dt>
          <dd className="mt-0.5 rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2">{selected.truck?.where ?? selected.person.kind}</dd>
        </div>
      </dl>
      <p className="mt-4 font-mono text-[10px] uppercase text-muted">Groups {canSend ? "· tap to add or remove" : "· view only"}</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {groups.map((g) => {
          const on = selected.t.groups.includes(g.id);
          return (
            <button
              key={g.id}
              type="button"
              disabled={!canSend}
              onClick={() => {
                const next = on ? selected.t.groups.filter((x) => x !== g.id) : [...selected.t.groups, g.id];
                patch(selected.person.id, { groups: next });
              }}
            >
              <Chip tone={on ? g.tone : "muted"}>{g.name}</Chip>
            </button>
          );
        })}
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase text-muted">Tags</p>
      <div className="mt-1 flex flex-wrap gap-1">
        {TAGS.map((tag) => {
          const on = selected.t.tags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              disabled={!canSend}
              onClick={() => {
                const next = on ? selected.t.tags.filter((x) => x !== tag) : [...selected.t.tags, tag];
                patch(selected.person.id, { tags: next });
              }}
            >
              <Chip tone={on ? "warn" : "muted"}>{tag}</Chip>
            </button>
          );
        })}
      </div>
      <p className="mt-4 font-mono text-[10px] uppercase text-muted">Desk notes</p>
      <textarea
        className="mt-1 min-h-20 w-full rounded-[var(--radius-sm)] border border-line bg-paper px-2 py-1 text-sm"
        value={selected.t.deskNote}
        disabled={!canSend}
        onChange={(e) => patch(selected.person.id, { deskNote: e.target.value })}
      />
      <p className="mt-4 font-mono text-[10px] uppercase tracking-wide text-navy">Activity</p>
      {activity.length === 0 ? (
        <p className="mt-1 text-xs text-muted">No assignment, group, or status changes yet.</p>
      ) : (
        <ol className="mt-1 space-y-2">
          {activity.slice(0, 12).map((event) => (
            <li key={event.id} className="rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2">
              <p className="text-xs">{event.detail}</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase text-muted">
                {event.who} · {event.when}
              </p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
