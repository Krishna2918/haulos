import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import type {
  Audit,
  BoxActivity,
  BoxGroup,
  BoxThread,
  Connector,
  EdiDoc,
  HosLog,
  Invoice,
  Item,
  KillSwitch,
  LockerFile,
  Mail,
  Msg,
  Note,
  Order,
  Pay,
  Person,
  Ping,
  Rate,
  Role,
  Site,
  Tender,
  Trailer,
  Truck,
  User,
  WorkOrder,
  Dvir,
  IftaRow,
  Channel,
  Workflow,
} from "./types";
import * as seed from "./seed";
import { canDeliver, canLeaveYard, missingPickup } from "./sequence";

export interface HaulState {
  role: Role;
  personId: string;
  theme: "day" | "night";
  lang: "en" | "pa" | "fr" | "es";
  kill: KillSwitch;
  samsaraToken: string;
  companyDid: string;
  trucks: Truck[];
  trailers: Trailer[];
  people: Person[];
  orders: Order[];
  items: Item[];
  invoices: Invoice[];
  rates: Rate[];
  pays: Pay[];
  msgs: Msg[];
  notes: Note[];
  tenders: Tender[];
  mails: Mail[];
  edi: EdiDoc[];
  locker: LockerFile[];
  hos: HosLog[];
  pings: Ping[];
  dvirs: Dvir[];
  wos: WorkOrder[];
  users: User[];
  sites: Site[];
  connectors: Connector[];
  ifta: IftaRow[];
  audit: Audit[];
  boxGroups: BoxGroup[];
  boxThreads: BoxThread[];
  boxActivity: BoxActivity[];
  setRole: (role: Role, personId?: string) => void;
  loginPin: (unitOrLocal: string, pin: string) => boolean;
  setTheme: (t: "day" | "night") => void;
  setLang: (l: HaulState["lang"]) => void;
  resetDemo: () => void;
  yesItem: (id: string) => void;
  holdItem: (id: string) => void;
  completeOrder: (id: string, patch: Partial<Order>) => void;
  assignOrder: (id: string, truckId: string, trailerId: string, driverId: string, localId: string) => string | null;
  scanPaper: (loadId: string, name: string, who: string, seal?: string) => void;
  leaveYard: (loadId: string) => string | null;
  markDelivered: (loadId: string) => string | null;
  sendMsg: (to: string, text: string, loadId?: string, channel?: Channel, broadcast?: boolean) => void;
  markThreadRead: (peer: string) => void;
  assignThread: (personId: string, staffId: string | null) => void;
  setThreadStatus: (personId: string, status: Workflow) => void;
  patchThread: (personId: string, patch: Partial<Pick<BoxThread, "deskNote" | "groups" | "tags">>) => void;
  createGroup: (name: string) => void;
  renameGroup: (id: string, name: string) => void;
  broadcast: (groupIds: string[], body: string, tagIds?: string[]) => number;
  simulateInbound: (personId: string, body?: string) => void;
  takeTender: (id: string) => void;
  declineTender: (id: string, reason: string) => void;
  accept990: (id: string) => void;
  fileBit: (loadId: string, kind: string, name: string) => void;
  sendInvoice: (id: string) => void;
  releaseHold: (personId: string) => void;
  updateRate: (id: string, amount: number) => void;
  toggleKill: (k: keyof KillSwitch) => void;
  toggleConnect: (id: string) => void;
  setToken: (t: string) => void;
  certifyHos: (personId: string) => void;
  dvir: (target: { truckId?: string | null; trailerId?: string | null }, result: "pass" | "fail", note: string) => void;
  closeWO: (id: string) => void;
  hireChen: () => void;
  addNote: (loadId: string, text: string) => void;
  claimWait: (loadId: string) => void;
  drift: () => void;
  log: (what: string) => void;
}

const whoOf = (s: HaulState) => s.people.find((p) => p.id === s.personId)?.name ?? "Desk";

function fresh(): Pick<
  HaulState,
  | "role"
  | "personId"
  | "theme"
  | "lang"
  | "kill"
  | "samsaraToken"
  | "companyDid"
  | "trucks"
  | "trailers"
  | "people"
  | "orders"
  | "items"
  | "invoices"
  | "rates"
  | "pays"
  | "msgs"
  | "notes"
  | "tenders"
  | "mails"
  | "edi"
  | "locker"
  | "hos"
  | "pings"
  | "dvirs"
  | "wos"
  | "users"
  | "sites"
  | "connectors"
  | "ifta"
  | "audit"
  | "boxGroups"
  | "boxThreads"
  | "boxActivity"
> {
  return {
    role: "dispatcher",
    personId: "p-alex",
    theme: "day",
    lang: "en",
    kill: { agents: false, money: true, outbound: false },
    samsaraToken: "",
    companyDid: "+1 416 555 0199 · demo",
    trucks: structuredClone(seed.trucks),
    trailers: structuredClone(seed.trailers),
    people: structuredClone(seed.people),
    orders: structuredClone(seed.orders),
    items: structuredClone(seed.items),
    invoices: structuredClone(seed.invoices),
    rates: structuredClone(seed.rates),
    pays: structuredClone(seed.pays),
    msgs: structuredClone(seed.msgs),
    notes: structuredClone(seed.notes),
    tenders: structuredClone(seed.tenders),
    mails: structuredClone(seed.mails),
    edi: structuredClone(seed.edi),
    locker: structuredClone(seed.locker),
    hos: structuredClone(seed.hos),
    pings: structuredClone(seed.pings),
    dvirs: structuredClone(seed.dvirs),
    wos: structuredClone(seed.wos),
    users: structuredClone(seed.users),
    sites: structuredClone(seed.sites),
    connectors: structuredClone(seed.connectors),
    ifta: structuredClone(seed.ifta),
    audit: structuredClone(seed.audit),
    boxGroups: structuredClone(seed.boxGroups),
    boxThreads: structuredClone(seed.boxThreads),
    boxActivity: structuredClone(seed.boxActivity),
  };
}

const FIELD_KINDS: Role[] = ["driver", "local", "helper", "shop"];
const clock = () => new Date().toISOString().slice(11, 16);
let seq = 90;

function pushActivity(s: HaulState, personId: string | null, detail: string): BoxActivity[] {
  return [
    { id: "ba" + Date.now(), personId, when: clock(), who: whoOf(s), detail },
    ...s.boxActivity,
  ].slice(0, 80);
}

export const useHaul = create<HaulState>()(
  persist(
    (set, get) => ({
      ...fresh(),
      setRole: (role, personId) => {
        const p =
          personId ??
          get().people.find((x) => x.kind === role)?.id ??
          get().personId;
        set({ role, personId: p });
      },
      loginPin: (unitOrLocal, pin) => {
        const u = unitOrLocal.trim().toUpperCase();
        const people = get().people;
        const trucks = get().trucks;
        const byKind =
          u === "LOCAL" || u === "BRAR"
            ? people.find((p) => p.id === "p-brar" && p.pin === pin)
            : u === "SHOP" || u === "DIAZ"
              ? people.find((p) => p.id === "p-diaz" && p.pin === pin)
              : u === "HELPER" || u === "OKONKWO"
                ? people.find((p) => p.id === "p-okonkwo" && p.pin === pin)
                : undefined;
        if (byKind) {
          set({ role: byKind.kind, personId: byKind.id });
          return true;
        }
        const truck = trucks.find((t) => t.unit === u);
        const person =
          people.find((p) => truck && p.truckId === truck.id && p.pin === pin) ??
          people.find(
            (p) =>
              p.pin === pin &&
              (p.name.toUpperCase().includes(u) || p.kind.toUpperCase() === u || p.pin === u),
          );
        if (!person) return false;
        set({ role: person.kind, personId: person.id });
        return true;
      },
      setTheme: (t) => {
        document.documentElement.classList.toggle("night", t === "night");
        set({ theme: t });
      },
      setLang: (l) =>
        set((s) => ({
          lang: l,
          people: s.people.map((p) => (p.id === s.personId ? { ...p, lang: l } : p)),
        })),
      resetDemo: () => {
        set(fresh());
        toast.message("Demo reset. Five trucks. Northline.");
      },
      log: (what) =>
        set((s) => ({
          audit: [{ id: "a" + Date.now(), when: new Date().toISOString().slice(11, 16), who: whoOf(s), what }, ...s.audit].slice(0, 80),
        })),
      yesItem: (id) => {
        const s = get();
        const it = s.items.find((i) => i.id === id);
        if (!it || it.status !== "open") return;
        if (it.action === "assign-4510") {
          const err = get().assignOrder("o-4510", "t-002", "tr-09", "p-patel", "p-brar");
          if (err) {
            toast.error(err);
            return;
          }
        } else if (it.action === "complete-4520") {
          get().completeOrder("o-4520", {
            truckId: "t-005",
            trailerId: "tr-07",
            localId: "p-brar",
            rate: 1550,
            route: "401 · Ambassador · I-75",
            leave: "18:10",
          });
        } else if (it.action === "hire-chen") get().hireChen();
        else if (it.action === "claim-wait") get().claimWait("o-4403");
        else if (it.action === "send-inv") get().sendInvoice("inv-4388");
        else if (it.action === "take-honda") get().takeTender("b-12");
        else if (it.action === "ack-shop") toast.message("T-001 and TR-11 stay grounded until shop clears.");
        else if (it.action === "ack-trailer-shop") toast.message("TR-06 stays shop. Door latch. Not hooked.");
        else if (it.action === "hos-lock") toast.message("Second stop locked. T-003 will not take more freight.");
        else if (it.action === "keep-hold") toast.message("Hold stays. File the receipt to release.");
        else if (it.action === "book-med") toast.message("Clinic booked 8 Sep for M. Singh.");
        else if (it.action === "fuel-plan") {
          get().addNote("o-4402", "Fill Flying J before 06:00. $1.29/L.");
          toast.message("Fill stop written on L-4402.");
        }
        set((st) => ({
          items: st.items.map((i) => (i.id === id ? { ...i, status: "yes" as const } : i)),
        }));
        get().log(`Yes · ${it.title}`);
      },
      holdItem: (id) => {
        set((s) => ({ items: s.items.map((i) => (i.id === id ? { ...i, status: "hold" as const } : i)) }));
        get().log(`Hold · ${id}`);
      },
      completeOrder: (id, patch) => {
        set((s) => ({
          orders: s.orders.map((o) => {
            if (o.id !== id) return o;
            const next = { ...o, ...patch };
            const complete = Boolean(next.shipper && next.from && next.to && next.rate);
            return { ...next, step: complete ? ("ready" as const) : o.step, status: complete ? ("new" as const) : o.status };
          }),
        }));
        toast.message("Order saved.");
        get().log(`Saved order ${id}`);
      },
      assignOrder: (id, truckId, trailerId, driverId, localId) => {
        const s = get();
        if (s.kill.agents) {
          /* still allow human Yes */
        }
        const truck = s.trucks.find((t) => t.id === truckId);
        const trailer = s.trailers.find((t) => t.id === trailerId);
        const order = s.orders.find((o) => o.id === id);
        if (!order) return "No order.";
        if (order.step === "incomplete") return "Order incomplete. Cannot assign.";
        if (truck?.status === "shop") return `${truck.unit} is in shop.`;
        if (trailer?.status === "shop") return `${trailer.unit} is in shop.`;
        if (trailer && (trailer.status === "loaded" || trailer.status === "dwell") && trailer.truckId !== truckId) {
          return `${trailer.unit} still has freight. Drop it first.`;
        }
        if (truck?.id === "t-003" && order.id !== "o-4402") return "T-003 clock would break. Illegal dispatch locked.";
        const dn = "D-88" + String(++seq);
        set((st) => ({
          orders: st.orders.map((o) =>
            o.id === id
              ? {
                  ...o,
                  truckId,
                  trailerId,
                  driverId,
                  localId,
                  dispatchNo: dn,
                  step: "assigned" as const,
                  status: "moving" as const,
                  leave: o.leave || "16:40",
                  route: o.route || "401 · Ambassador · I-75",
                }
              : o,
          ),
          trucks: st.trucks.map((t) => {
            if (t.id === truckId) return { ...t, status: "loaded" as const, loadId: id, trailerId, note: `Assigned ${dn}` };
            if (t.trailerId === trailerId) return { ...t, trailerId: null };
            return t;
          }),
          trailers: st.trailers.map((tr) => {
            if (tr.id === trailerId) {
              return { ...tr, status: "hooked" as const, truckId, where: truck?.where ?? tr.where, lat: truck?.lat ?? tr.lat, lng: truck?.lng ?? tr.lng };
            }
            if (tr.truckId === truckId) return { ...tr, status: "yard" as const, truckId: null };
            return tr;
          }),
          edi: [
            { id: "e" + Date.now(), set: "214", loadId: id, status: "sent", when: "now", note: `Assigned ${dn}` },
            { id: "e" + Date.now() + "a", set: "990", loadId: id, status: "sent", when: "now", note: "Accept" },
            ...st.edi,
          ],
        }));
        const driver = s.people.find((p) => p.id === driverId);
        const local = s.people.find((p) => p.id === localId);
        if (driver) get().sendMsg(driver.name, `Assigned ${dn}. Legal lanes only.`, id, "box");
        if (local) get().sendMsg(local.name, `Pickup papers on ${order.code}. Scan before highway leaves.`, id, "sms");
        toast.message(`Accept · ${dn}`);
        get().log(`Assigned ${order.code} ${dn}`);
        return null;
      },
      scanPaper: (loadId, name, who, seal) => {
        const s = get();
        set((st) => {
          const orders = st.orders.map((o) => {
            if (o.id !== loadId) return o;
            const papers = o.papers.map((p) =>
              p.name === name ? { ...p, scanned: true, by: who, when: "now", seal: seal ?? p.seal } : p,
            );
            const pu = papers.filter((p) => p.at === "pickup");
            const allPu = pu.every((p) => p.scanned);
            const dv = papers.filter((p) => p.at === "delivery");
            const allDv = dv.every((p) => p.scanned);
            let step = o.step;
            let localPicked = o.localPicked;
            if (allPu && (o.step === "assigned" || o.step === "pickup")) {
              step = "pickup";
              localPicked = true;
            }
            if (allDv) step = "delivery";
            return { ...o, papers, step, localPicked };
          });
          const locker: LockerFile[] = [
            {
              id: "lk" + Date.now(),
              loadId,
              kind: name.toLowerCase(),
              name: `${name.replace(/\s/g, "-")}-${loadId}.jpg`,
              locked: true,
              source: "scan",
              by: who,
              when: "now",
            },
            ...st.locker,
          ];
          return { orders, locker };
        });
        const o = get().orders.find((x) => x.id === loadId);
        if (o && o.localPicked && missingPickup(o).length === 0) {
          const hwy = s.people.find((p) => p.id === o.driverId);
          if (hwy) get().sendMsg(hwy.name, "Papers in. You can leave.", loadId, "box");
        }
        toast.message(`${name} in Bit Locker`);
        get().log(`Scan ${name} ${loadId}`);
      },
      leaveYard: (loadId) => {
        const o = get().orders.find((x) => x.id === loadId);
        if (!o) return "No load.";
        const err = canLeaveYard(o);
        if (err) return err;
        set((st) => ({
          orders: st.orders.map((x) =>
            x.id === loadId ? { ...x, departed: true, step: "highway" as const, status: "moving" as const } : x,
          ),
          trailers: st.trailers.map((tr) =>
            tr.id === o.trailerId ? { ...tr, status: "loaded" as const } : tr,
          ),
          edi: [{ id: "e" + Date.now(), set: "214", loadId, status: "sent", when: "now", note: "Departed" }, ...st.edi],
        }));
        toast.message("Left yard. 214 sent.");
        get().log(`Left yard ${o.code}`);
        return null;
      },
      markDelivered: (loadId) => {
        const o = get().orders.find((x) => x.id === loadId);
        if (!o) return "No load.";
        const err = canDeliver(o);
        if (err) return err;
        if (get().kill.money) {
          /* invoice still drafts */
        }
        set((st) => ({
          orders: st.orders.map((x) =>
            x.id === loadId ? { ...x, step: "done" as const, status: "done" as const } : x,
          ),
          trucks: st.trucks.map((t) =>
            t.id === o.truckId ? { ...t, status: "empty" as const, loadId: null, note: "Empty after deliver" } : t,
          ),
          trailers: st.trailers.map((tr) =>
            tr.id === o.trailerId ? { ...tr, status: "hooked" as const } : tr,
          ),
          invoices: st.invoices.some((i) => i.loadId === loadId)
            ? st.invoices
            : [{ id: "inv-" + o.code, loadId, who: o.shipper, amount: o.rate, status: "draft", note: "POD in" }, ...st.invoices],
          edi: [{ id: "e" + Date.now(), set: "210", loadId, status: "in", when: "now", note: "Invoice draft" }, ...st.edi],
        }));
        toast.message("Delivered. Invoice drafted.");
        get().log(`Delivered ${o.code}`);
        return null;
      },
      sendMsg: (to, text, loadId, channel = "box", broadcast = false) => {
        const s = get();
        const me = s.people.find((p) => p.id === s.personId);
        const field = me ? FIELD_KINDS.includes(me.kind) : false;
        if (s.kill.outbound && channel !== "box" && channel !== "note" && !field) {
          toast.error("Outbound SMS frozen. Kill switch.");
          return;
        }
        set((st) => ({
          msgs: [
            {
              id: "m" + Date.now(),
              from: whoOf(st),
              to,
              loadId,
              when: clock(),
              text,
              read: false,
              channel,
              broadcast: broadcast || undefined,
            },
            ...st.msgs,
          ],
        }));
      },
      markThreadRead: (peer) => {
        set((s) => ({
          msgs: s.msgs.map((m) =>
            m.from === peer && m.channel !== "note" ? { ...m, read: true } : m,
          ),
        }));
      },
      assignThread: (personId, staffId) => {
        set((s) => ({
          boxThreads: s.boxThreads.map((t) => (t.personId === personId ? { ...t, assignedTo: staffId } : t)),
          boxActivity: pushActivity(s, personId, staffId ? `Assigned to ${s.people.find((p) => p.id === staffId)?.name ?? "desk"}` : "Unassigned"),
        }));
        const who = get().people.find((p) => p.id === staffId)?.name ?? "Unassigned";
        get().log(`Assign thread ${personId} → ${who}`);
      },
      setThreadStatus: (personId, status) => {
        const label = status.replaceAll("_", " ");
        set((s) => ({
          boxThreads: s.boxThreads.map((t) => (t.personId === personId ? { ...t, status } : t)),
          boxActivity: pushActivity(s, personId, `Status → ${label}`),
        }));
        get().log(`Thread ${personId} ${status}`);
      },
      patchThread: (personId, patch) => {
        set((s) => {
          const prev = s.boxThreads.find((t) => t.personId === personId);
          let activity = s.boxActivity;
          if (patch.groups && prev && patch.groups.join() !== prev.groups.join()) {
            const names = patch.groups
              .map((id) => s.boxGroups.find((g) => g.id === id)?.name)
              .filter(Boolean)
              .join(", ");
            activity = pushActivity(s, personId, names ? `Groups → ${names}` : "Groups cleared");
          }
          if (patch.tags && prev && patch.tags.join() !== prev.tags.join()) {
            activity = pushActivity({ ...s, boxActivity: activity }, personId, patch.tags.length ? `Tags → ${patch.tags.join(", ")}` : "Tags cleared");
          }
          return {
            boxThreads: s.boxThreads.map((t) => (t.personId === personId ? { ...t, ...patch } : t)),
            boxActivity: activity,
          };
        });
      },
      createGroup: (name) => {
        const n = name.trim();
        if (!n) return;
        set((s) => ({
          boxGroups: [...s.boxGroups, { id: "g-" + Date.now(), name: n, tone: "muted" }],
          boxActivity: pushActivity(s, null, `Group created · ${n}`),
        }));
      },
      renameGroup: (id, name) => {
        const n = name.trim();
        if (!n) return;
        set((s) => ({
          boxGroups: s.boxGroups.map((g) => (g.id === id ? { ...g, name: n } : g)),
          boxActivity: pushActivity(s, null, `Group renamed · ${n}`),
        }));
      },
      broadcast: (groupIds, body, tagIds = []) => {
        const s = get();
        if (s.kill.outbound) {
          toast.error("Outbound SMS frozen. Kill switch.");
          return 0;
        }
        const ids = new Set(
          s.boxThreads
            .filter(
              (t) =>
                t.groups.some((g) => groupIds.includes(g)) || t.tags.some((tag) => tagIds.includes(tag)),
            )
            .map((t) => t.personId),
        );
        const targets = s.people.filter((p) => ids.has(p.id));
        targets.forEach((p) => get().sendMsg(p.name, body, undefined, "sms", true));
        toast.message(`Broadcast · ${targets.length} drivers`);
        get().log(`Broadcast to ${targets.length}`);
        return targets.length;
      },
      simulateInbound: (personId, body) => {
        const p = get().people.find((x) => x.id === personId);
        const me = whoOf(get());
        if (!p) return;
        const lines = [
          "On site. Waiting on a door.",
          "Copy. Rolling.",
          "Need a scale ticket.",
          "Traffic on Ambassador. 20 min.",
        ];
        const text = body ?? lines[Math.floor(Math.random() * lines.length)];
        set((st) => ({
          msgs: [
            {
              id: "m" + Date.now(),
              from: p.name,
              to: me,
              when: new Date().toISOString().slice(11, 16),
              text,
              read: false,
              channel: "sms" as const,
            },
            ...st.msgs,
          ],
        }));
        toast.message(`Inbound from ${p.name}`);
      },
      takeTender: (id) => {
        const t = get().tenders.find((x) => x.id === id);
        if (!t) return;
        const code = "L-" + (4500 + Math.floor(Math.random() * 80));
        const [from, to] = t.lane.split("→").map((x) => x.trim());
        const newOrder: Order = {
          id: "o-" + Date.now(),
          code,
          shipper: t.shipper,
          from: from || t.lane,
          to: to || "",
          window: t.window,
          rate: t.rate,
          miles: t.miles,
          status: "new",
          step: "ready",
          truckId: null,
          driverId: null,
          trailerId: null,
          localId: "p-brar",
          dispatchNo: null,
          leave: "",
          route: "401 · Ambassador · I-75",
          departed: false,
          localPicked: false,
          papers: [
            { name: "BOL", at: "pickup", scanned: false },
            { name: "Packing list", at: "pickup", scanned: false },
            { name: "Seal photo", at: "pickup", scanned: false },
            { name: "ACI", at: "pickup", scanned: false },
            { name: "POD", at: "delivery", scanned: false },
            { name: "Seal photo", at: "delivery", scanned: false },
            { name: "Delivery receipt", at: "delivery", scanned: false },
          ],
          otif: "med",
          freeHours: 2,
          waitRate: 75,
          track: code,
          notes: "Taken from board.",
          emptyKm: 0,
        };
        set((s) => ({
          tenders: s.tenders.map((x) => (x.id === id ? { ...x, status: "taken" as const } : x)),
          orders: [newOrder, ...s.orders],
          mails: s.mails.map((m) => (m.tenderId === id ? { ...m, read: true } : m)),
        }));
        toast.message(`Taken onto desk as ${code}`);
        get().log(`Took tender ${t.shipper}`);
      },
      declineTender: (id, reason) => {
        set((s) => ({
          tenders: s.tenders.map((x) => (x.id === id ? { ...x, status: "declined" as const } : x)),
          edi: [{ id: "e" + Date.now(), set: "990", tenderId: id, status: "reject", when: "now", note: reason }, ...s.edi],
        }));
        toast.message("990 decline · " + reason);
      },
      accept990: (id) => get().takeTender(id),
      fileBit: (loadId, kind, name) => {
        set((s) => ({
          locker: [
            {
              id: "lk" + Date.now(),
              loadId,
              kind,
              name,
              locked: false,
              source: "desk",
              by: whoOf(s),
              when: "now",
            },
            ...s.locker,
          ],
        }));
        toast.message("Filed in Bit Locker");
      },
      sendInvoice: (id) => {
        if (get().kill.money) {
          toast.error("Money send frozen. Kill switch. Draft only.");
          return;
        }
        set((s) => ({
          invoices: s.invoices.map((i) => (i.id === id ? { ...i, status: "sent" as const } : i)),
        }));
        toast.message("Invoice sent.");
        get().log(`Sent invoice ${id}`);
      },
      releaseHold: (personId) => {
        if (get().kill.money) {
          toast.error("Money frozen.");
          return;
        }
        set((s) => ({
          pays: s.pays.map((p) => (p.personId === personId ? { ...p, hold: 0, status: "open" as const } : p)),
          people: s.people.map((p) => (p.id === personId ? { ...p, hold: 0 } : p)),
        }));
        toast.message("Hold released.");
      },
      updateRate: (id, amount) => {
        if (get().role !== "owner" && get().role !== "hr") {
          toast.error("Driver rates: HR or owner only.");
          return;
        }
        set((s) => ({ rates: s.rates.map((r) => (r.id === id ? { ...r, amount } : r)) }));
        get().log(`Rate ${id} = ${amount}`);
      },
      toggleKill: (k) => {
        set((s) => ({ kill: { ...s.kill, [k]: !s.kill[k] } }));
        get().log(`Kill ${k}`);
      },
      toggleConnect: (id) =>
        set((s) => ({ connectors: s.connectors.map((c) => (c.id === id ? { ...c, on: !c.on } : c)) })),
      setToken: (t) => set({ samsaraToken: t }),
      certifyHos: (personId) => {
        set((s) => ({ hos: s.hos.map((h) => (h.personId === personId ? { ...h, certified: true } : h)) }));
        toast.message("Log certified.");
      },
      dvir: (target, result, note) => {
        const truckId = target.truckId ?? null;
        const trailerId = target.trailerId ?? null;
        set((s) => ({
          dvirs: [
            { id: "dv" + Date.now(), truckId, trailerId, when: "now", by: whoOf(s), result, note },
            ...s.dvirs,
          ],
          trucks:
            result === "fail" && truckId
              ? s.trucks.map((t) =>
                  t.id === truckId ? { ...t, status: "shop" as const, fault: note, note: "DVIR fail. Shop." } : t,
                )
              : s.trucks,
          trailers:
            result === "fail" && trailerId
              ? s.trailers.map((tr) =>
                  tr.id === trailerId ? { ...tr, status: "shop" as const, fault: note } : tr,
                )
              : s.trailers,
          wos:
            result === "fail"
              ? [
                  {
                    id: "wo-" + Date.now(),
                    truckId,
                    trailerId,
                    title: note || "DVIR fail",
                    parts: "TBD",
                    status: "open" as const,
                    eta: "open",
                    downtime: 760,
                  },
                  ...s.wos,
                ]
              : s.wos,
        }));
        toast.message(result === "fail" ? "DVIR fail → work order" : "DVIR pass");
      },
      closeWO: (id) => {
        const wo = get().wos.find((w) => w.id === id);
        set((s) => ({
          wos: s.wos.map((w) => (w.id === id ? { ...w, status: "done" as const } : w)),
          trucks: s.trucks.map((t) =>
            t.id === wo?.truckId ? { ...t, status: "empty" as const, fault: "", note: "Shop clear" } : t,
          ),
          trailers: s.trailers.map((tr) => {
            if (tr.id !== wo?.trailerId) return tr;
            return {
              ...tr,
              status: tr.truckId ? ("hooked" as const) : ("yard" as const),
              fault: "",
            };
          }),
        }));
        toast.message("Shop cleared. Truck and trailer status updated.");
      },
      hireChen: () => {
        set((s) => ({
          people: s.people.map((p) => (p.id === "p-chen" ? { ...p, status: "active" as const } : p)),
        }));
        get().sendMsg("P. Chen", "Welcome to Northline. Pass 9919. Brampton dock.", undefined, "box");
        toast.message("P. Chen hired. Portal open. Pass 9919.");
      },
      addNote: (loadId, text) =>
        set((s) => ({
          notes: [{ id: "n" + Date.now(), loadId, when: "now", text }, ...s.notes],
        })),
      claimWait: (loadId) => {
        const o = get().orders.find((x) => x.id === loadId);
        if (!o) return;
        set((s) => ({
          invoices: s.invoices.map((i) =>
            i.loadId === loadId ? { ...i, amount: i.amount + 150, note: (i.note + " +$150 wait").trim() } : i,
          ),
        }));
        toast.message("+$150 wait on the invoice. Still needs send.");
      },
      drift: () =>
        set((s) => ({
          trucks: s.trucks.map((t) =>
            t.status === "loaded"
              ? { ...t, lat: t.lat + (Math.random() - 0.45) * 0.01, lng: t.lng + (Math.random() - 0.5) * 0.012 }
              : t,
          ),
        })),
    }),
    {
      name: "haulos-data-v15",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => {
        const skip = new Set(["setRole", "loginPin", "setTheme", "setLang", "resetDemo", "yesItem", "holdItem", "completeOrder", "assignOrder", "scanPaper", "leaveYard", "markDelivered", "sendMsg", "markThreadRead", "assignThread", "setThreadStatus", "patchThread", "createGroup", "renameGroup", "broadcast", "simulateInbound", "takeTender", "declineTender", "accept990", "fileBit", "sendInvoice", "releaseHold", "updateRate", "toggleKill", "toggleConnect", "setToken", "certifyHos", "dvir", "closeWO", "hireChen", "addNote", "claimWait", "drift", "log"]);
        const o: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(s)) if (!skip.has(k)) o[k] = v;
        return o as never;
      },
    },
  ),
);

export function useMe() {
  return useHaul((s) => s.people.find((p) => p.id === s.personId));
}

export function unreadCount() {
  return useHaul((s) => {
    const field = new Set(s.people.filter((p) => FIELD_KINDS.includes(p.kind)).map((p) => p.name));
    return s.msgs.filter((m) => field.has(m.from) && !m.read && m.channel !== "note" && m.channel !== "voice").length;
  });
}
