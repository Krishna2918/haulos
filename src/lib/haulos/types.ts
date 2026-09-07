export type Role =
  | "owner"
  | "dispatcher"
  | "hr"
  | "backoffice"
  | "admin"
  | "driver"
  | "local"
  | "helper"
  | "shop"
  | "safety";

export type TruckStatus = "loaded" | "empty" | "shop" | "wait";
export type TrailerStatus = "hooked" | "yard" | "shop" | "loaded" | "dwell";
export type OrderStatus = "new" | "moving" | "dock" | "done";
export type Step =
  | "incomplete"
  | "ready"
  | "assigned"
  | "pickup"
  | "highway"
  | "delivery"
  | "done";
export type Duty = "off" | "sleeper" | "drive" | "on";
export type Channel = "box" | "sms" | "wa" | "voice" | "note";
export type Workflow = "new" | "open" | "in_progress" | "waiting" | "resolved";

export interface BoxGroup {
  id: string;
  name: string;
  tone: "navy" | "ok" | "warn" | "bad" | "hold" | "muted";
}

export interface BoxThread {
  personId: string;
  assignedTo: string | null;
  status: Workflow;
  groups: string[];
  tags: string[];
  deskNote: string;
}

export interface BoxActivity {
  id: string;
  personId: string | null;
  when: string;
  who: string;
  detail: string;
}

export type PaperName =
  | "BOL"
  | "Packing list"
  | "Seal photo"
  | "ACI"
  | "POD"
  | "Delivery receipt";

export interface Truck {
  id: string;
  unit: string;
  driverId: string | null;
  trailerId: string | null;
  status: TruckStatus;
  where: string;
  loadId: string | null;
  note: string;
  hoursLeft: number;
  lat: number;
  lng: number;
  vin: string;
  plate: string;
  plateDue: string;
  year: number;
  make: string;
  odo: number;
  lastService: string;
  nextPm: string;
  oilDue: string;
  tires: string;
  fault: string;
  eld: string;
  fuelCard: string;
}

export interface Trailer {
  id: string;
  unit: string;
  kind: "van" | "reefer" | "flat";
  plate: string;
  status: TrailerStatus;
  truckId: string | null;
  where: string;
  lat: number;
  lng: number;
  nextPm: string;
  fault: string;
}

export interface Person {
  id: string;
  name: string;
  kind: Role;
  status: "active" | "leave";
  truckId: string | null;
  payType: "W-2" | "1099" | "Lease-op" | "Salary" | "Hourly";
  rate: number;
  rateUnit: string;
  med: string;
  cdl: string;
  cdlExp: string;
  pin: string;
  email: string;
  phone: string;
  hold: number;
  fast: boolean;
  lang: "en" | "pa" | "fr" | "es";
}

export interface Paper {
  name: PaperName;
  at: "pickup" | "delivery";
  scanned: boolean;
  by?: string;
  when?: string;
  seal?: string;
}

export interface Order {
  id: string;
  code: string;
  shipper: string;
  from: string;
  to: string;
  window: string;
  rate: number;
  miles: number;
  status: OrderStatus;
  step: Step;
  truckId: string | null;
  driverId: string | null;
  trailerId: string | null;
  localId: string | null;
  dispatchNo: string | null;
  leave: string;
  route: string;
  departed: boolean;
  localPicked: boolean;
  papers: Paper[];
  otif: "low" | "med" | "high";
  dockAt?: string;
  freeHours: number;
  waitRate: number;
  track: string;
  notes: string;
  emptyKm: number;
}

export interface Item {
  id: string;
  title: string;
  detail: string;
  impact: string;
  desk: Role[];
  status: "open" | "yes" | "hold";
  action?: string;
  loadId?: string;
  personId?: string;
  truckId?: string;
  trailerId?: string;
}

export interface Invoice {
  id: string;
  loadId: string;
  who: string;
  amount: number;
  status: "draft" | "sent" | "paid";
  note: string;
}

export interface Rate {
  id: string;
  label: string;
  amount: number;
  unit: string;
}

export interface Pay {
  id: string;
  personId: string;
  amount: number;
  hold: number;
  status: "open" | "held" | "paid";
  note: string;
}

export interface Msg {
  id: string;
  from: string;
  to: string;
  loadId?: string;
  when: string;
  text: string;
  read: boolean;
  channel: Channel;
  broadcast?: boolean;
}

export interface Note {
  id: string;
  loadId: string;
  when: string;
  text: string;
}

export interface Tender {
  id: string;
  source: "email" | "edi" | "desk" | "dat";
  shipper: string;
  lane: string;
  rate: number;
  miles: number;
  window: string;
  status: "open" | "accepted" | "taken" | "declined";
  expire: string;
  equip: string;
}

export interface Mail {
  id: string;
  from: string;
  subject: string;
  body: string;
  when: string;
  read: boolean;
  tenderId?: string;
}

export interface EdiDoc {
  id: string;
  set: "204" | "990" | "214" | "210";
  loadId?: string;
  tenderId?: string;
  status: "in" | "sent" | "ack" | "reject";
  when: string;
  note: string;
}

export interface LockerFile {
  id: string;
  loadId: string;
  kind: string;
  name: string;
  locked: boolean;
  source: "scan" | "email" | "edi" | "desk";
  by: string;
  when: string;
}

export interface HosEvent {
  duty: Duty;
  start: string;
  hours: number;
}

export interface HosLog {
  personId: string;
  date: string;
  events: HosEvent[];
  certified: boolean;
  driveLeft: number;
  cycleLeft: number;
  ruleset: string;
}

export interface Ping {
  id: string;
  truckId: string;
  lat: number;
  lng: number;
  when: string;
  event: "move" | "enter" | "exit";
  fence?: string;
}

export interface Dvir {
  id: string;
  truckId: string | null;
  trailerId: string | null;
  when: string;
  by: string;
  result: "pass" | "fail";
  note: string;
}

export interface WorkOrder {
  id: string;
  truckId: string | null;
  trailerId: string | null;
  title: string;
  parts: string;
  status: "open" | "parts" | "done";
  eta: string;
  downtime: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  personId: string;
}

export interface Site {
  id: string;
  name: string;
  kind: "plant" | "yard" | "shop" | "border";
  lat: number;
  lng: number;
  radius: number;
}

export interface Audit {
  id: string;
  when: string;
  who: string;
  what: string;
}

export interface IftaRow {
  jur: string;
  miles: number;
  gallons: number;
}

export interface Connector {
  id: string;
  name: string;
  group: string;
  on: boolean;
}

export interface KillSwitch {
  agents: boolean;
  money: boolean;
  outbound: boolean;
}
