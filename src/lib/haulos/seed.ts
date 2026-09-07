import type {
  Connector,
  EdiDoc,
  HosLog,
  Invoice,
  Item,
  LockerFile,
  Mail,
  Msg,
  Note,
  Order,
  Paper,
  Pay,
  Person,
  Ping,
  Rate,
  Site,
  Tender,
  Trailer,
  Truck,
  User,
  WorkOrder,
  Dvir,
  IftaRow,
  Audit,
  BoxGroup,
  BoxThread,
  BoxActivity,
} from "./types";

const pickup = (scanned: boolean, seal?: string): Paper[] => [
  { name: "BOL", at: "pickup", scanned, by: scanned ? "D. Brar" : undefined, when: scanned ? "2026-09-03T12:10" : undefined },
  { name: "Packing list", at: "pickup", scanned, by: scanned ? "D. Brar" : undefined, when: scanned ? "2026-09-03T12:11" : undefined },
  { name: "Seal photo", at: "pickup", scanned, by: scanned ? "D. Brar" : undefined, when: scanned ? "2026-09-03T12:12" : undefined, seal: seal ?? "448291" },
  { name: "ACI", at: "pickup", scanned, by: scanned ? "D. Brar" : undefined, when: scanned ? "2026-09-03T12:13" : undefined },
];

const delivery = (scanned: boolean): Paper[] => [
  { name: "POD", at: "delivery", scanned },
  { name: "Seal photo", at: "delivery", scanned, seal: "448291" },
  { name: "Delivery receipt", at: "delivery", scanned },
];

export const people: Person[] = [
  { id: "p-priya", name: "Priya Owner", kind: "owner", status: "active", truckId: null, payType: "Salary", rate: 0, rateUnit: "", med: "", cdl: "", cdlExp: "", pin: "0000", email: "priya@northline.freight", phone: "+1 416 555 0100", hold: 0, fast: true, lang: "en" },
  { id: "p-alex", name: "Alex Dispatch", kind: "dispatcher", status: "active", truckId: null, payType: "Salary", rate: 0, rateUnit: "", med: "", cdl: "", cdlExp: "", pin: "1001", email: "alex@northline.freight", phone: "+1 416 555 0101", hold: 0, fast: false, lang: "en" },
  { id: "p-jordan", name: "Jordan HR", kind: "hr", status: "active", truckId: null, payType: "Salary", rate: 0, rateUnit: "", med: "", cdl: "", cdlExp: "", pin: "1002", email: "jordan@northline.freight", phone: "+1 416 555 0102", hold: 0, fast: false, lang: "en" },
  { id: "p-sam", name: "Sam Backoffice", kind: "backoffice", status: "active", truckId: null, payType: "Salary", rate: 0, rateUnit: "", med: "", cdl: "", cdlExp: "", pin: "1003", email: "sam@northline.freight", phone: "+1 416 555 0103", hold: 0, fast: false, lang: "en" },
  { id: "p-admin", name: "IT Admin", kind: "admin", status: "active", truckId: null, payType: "Salary", rate: 0, rateUnit: "", med: "", cdl: "", cdlExp: "", pin: "1004", email: "it@northline.freight", phone: "+1 416 555 0104", hold: 0, fast: false, lang: "en" },
  { id: "p-riley", name: "Riley Safety", kind: "safety", status: "active", truckId: null, payType: "Salary", rate: 0, rateUnit: "", med: "", cdl: "", cdlExp: "", pin: "1005", email: "riley@northline.freight", phone: "+1 416 555 0105", hold: 0, fast: true, lang: "en" },
  { id: "p-singh", name: "M. Singh", kind: "driver", status: "active", truckId: "t-001", payType: "W-2", rate: 0.55, rateUnit: "/km", med: "2026-09-14", cdl: "S1234-49081", cdlExp: "2027-03-01", pin: "1101", email: "singh@northline.freight", phone: "+1 647 555 1101", hold: 420, fast: true, lang: "en" },
  { id: "p-patel", name: "R. Patel", kind: "driver", status: "active", truckId: "t-002", payType: "W-2", rate: 0.54, rateUnit: "/km", med: "2027-01-12", cdl: "P8821-10221", cdlExp: "2028-02-01", pin: "4404", email: "patel@northline.freight", phone: "+1 647 555 4404", hold: 0, fast: true, lang: "en" },
  { id: "p-alvarez", name: "J. Alvarez", kind: "driver", status: "active", truckId: "t-003", payType: "Lease-op", rate: 0.58, rateUnit: "/km", med: "2027-04-02", cdl: "A4410-77621", cdlExp: "2028-06-01", pin: "2202", email: "alvarez@northline.freight", phone: "+1 519 555 2202", hold: 0, fast: true, lang: "es" },
  { id: "p-kowalski", name: "A. Kowalski", kind: "driver", status: "active", truckId: "t-004", payType: "W-2", rate: 0.55, rateUnit: "/km", med: "2026-12-20", cdl: "K3301-19284", cdlExp: "2027-11-01", pin: "3303", email: "kowalski@northline.freight", phone: "+1 313 555 3303", hold: 0, fast: true, lang: "en" },
  { id: "p-nguyen", name: "K. Nguyen", kind: "driver", status: "active", truckId: "t-005", payType: "1099", rate: 0.52, rateUnit: "/km", med: "2027-02-08", cdl: "N5505-88311", cdlExp: "2028-01-15", pin: "5505", email: "nguyen@northline.freight", phone: "+1 647 555 5505", hold: 0, fast: false, lang: "en" },
  { id: "p-brar", name: "D. Brar", kind: "local", status: "active", truckId: null, payType: "Hourly", rate: 24, rateUnit: "/h", med: "2027-05-01", cdl: "B6606-44102", cdlExp: "2028-05-01", pin: "6606", email: "brar@northline.freight", phone: "+1 905 555 6606", hold: 0, fast: true, lang: "pa" },
  { id: "p-okonkwo", name: "T. Okonkwo", kind: "helper", status: "active", truckId: null, payType: "Hourly", rate: 22, rateUnit: "/h", med: "", cdl: "", cdlExp: "", pin: "7707", email: "okonkwo@northline.freight", phone: "+1 905 555 7707", hold: 0, fast: false, lang: "en" },
  { id: "p-chen", name: "P. Chen", kind: "helper", status: "leave", truckId: null, payType: "Hourly", rate: 22, rateUnit: "/h", med: "", cdl: "", cdlExp: "", pin: "9919", email: "chen@northline.freight", phone: "+1 905 555 9919", hold: 0, fast: false, lang: "en" },
  { id: "p-diaz", name: "M. Diaz", kind: "shop", status: "active", truckId: null, payType: "Hourly", rate: 32, rateUnit: "/h", med: "", cdl: "", cdlExp: "", pin: "8808", email: "diaz@northline.freight", phone: "+1 905 555 8808", hold: 0, fast: false, lang: "es" },
];

export const trucks: Truck[] = [
  { id: "t-001", unit: "T-001", driverId: "p-singh", trailerId: "tr-11", status: "shop", where: "Mississauga shop", loadId: null, note: "Brakes. ABS SPN 789. Do not log drive.", hoursLeft: 8.2, lat: 43.59, lng: -79.64, vin: "1XPBDP9X8ND123001", plate: "ON 412-KTM", plateDue: "2026-11-30", year: 2022, make: "Peterbilt 579", odo: 412880, lastService: "2026-07-12", nextPm: "2026-09-20", oilDue: "2026-09-18", tires: "steer 8/32", fault: "ABS SPN 789", eld: "VG34-001", fuelCard: "WEX · 4412" },
  { id: "t-002", unit: "T-002", driverId: "p-patel", trailerId: "tr-12", status: "empty", where: "Brampton yard", loadId: null, note: "Ready. Empty.", hoursLeft: 10.4, lat: 43.731, lng: -79.762, vin: "1XPBDP9X8ND123002", plate: "ON 883-PLQ", plateDue: "2027-01-12", year: 2021, make: "Kenworth T680", odo: 501220, lastService: "2026-08-02", nextPm: "2026-10-01", oilDue: "2026-10-04", tires: "ok", fault: "", eld: "VG34-002", fuelCard: "WEX · 4413" },
  { id: "t-003", unit: "T-003", driverId: "p-alvarez", trailerId: "tr-08", status: "loaded", where: "I-75 S Monroe", loadId: "o-4402", note: "Legal lanes only. No extra stop.", hoursLeft: 2.1, lat: 41.92, lng: -83.4, vin: "1XPBDP9X8ND123003", plate: "ON 229-HST", plateDue: "2026-12-01", year: 2023, make: "Freightliner Cascadia", odo: 288410, lastService: "2026-08-22", nextPm: "2026-10-12", oilDue: "2026-10-10", tires: "ok", fault: "", eld: "VG34-003", fuelCard: "WEX · 4414" },
  { id: "t-004", unit: "T-004", driverId: "p-kowalski", trailerId: "tr-04", status: "wait", where: "Dearborn dock", loadId: "o-4403", note: "72 min past free time.", hoursLeft: 6.8, lat: 42.322, lng: -83.176, vin: "1XPBDP9X8ND123004", plate: "ON 771-BRM", plateDue: "2026-11-01", year: 2020, make: "Volvo VNL", odo: 622100, lastService: "2026-06-30", nextPm: "2026-09-15", oilDue: "2026-09-12", tires: "drive 6/32", fault: "", eld: "VG34-004", fuelCard: "WEX · 4415" },
  { id: "t-005", unit: "T-005", driverId: "p-nguyen", trailerId: null, status: "empty", where: "Cambridge", loadId: null, note: "Empty. 68 km to Guelph.", hoursLeft: 9.6, lat: 43.36, lng: -80.31, vin: "1XPBDP9X8ND123005", plate: "ON 554-NVA", plateDue: "2027-02-20", year: 2024, make: "Peterbilt 579", odo: 141200, lastService: "2026-08-28", nextPm: "2026-11-01", oilDue: "2026-11-04", tires: "new", fault: "", eld: "VG34-005", fuelCard: "WEX · 4416" },
];

export const trailers: Trailer[] = [
  { id: "tr-11", unit: "TR-11", kind: "van", plate: "ON TR-11", status: "shop", truckId: "t-001", where: "Mississauga shop", lat: 43.59, lng: -79.64, nextPm: "2026-10-01", fault: "Stays with T-001. Do not hook." },
  { id: "tr-12", unit: "TR-12", kind: "van", plate: "ON TR-12", status: "hooked", truckId: "t-002", where: "Brampton yard", lat: 43.731, lng: -79.762, nextPm: "2026-10-08", fault: "" },
  { id: "tr-08", unit: "TR-08", kind: "van", plate: "ON TR-08", status: "loaded", truckId: "t-003", where: "I-75 S Monroe", lat: 41.92, lng: -83.4, nextPm: "2026-09-28", fault: "" },
  { id: "tr-04", unit: "TR-04", kind: "van", plate: "ON TR-04", status: "dwell", truckId: "t-004", where: "Dearborn dock", lat: 42.322, lng: -83.176, nextPm: "2026-10-14", fault: "" },
  { id: "tr-09", unit: "TR-09", kind: "van", plate: "ON TR-09", status: "yard", truckId: null, where: "Brampton yard", lat: 43.728, lng: -79.76, nextPm: "2026-11-02", fault: "" },
  { id: "tr-07", unit: "TR-07", kind: "van", plate: "ON TR-07", status: "yard", truckId: null, where: "Brampton yard", lat: 43.729, lng: -79.763, nextPm: "2026-10-22", fault: "" },
  { id: "tr-06", unit: "TR-06", kind: "van", plate: "ON TR-06", status: "shop", truckId: null, where: "Mississauga shop", lat: 43.591, lng: -79.641, nextPm: "2026-09-18", fault: "Right rear door will not latch." },
];

export const orders: Order[] = [
  {
    id: "o-4510",
    code: "L-4510",
    shipper: "Stellantis Windsor",
    from: "Windsor Assembly",
    to: "Jeep Toledo North",
    window: "14:00 Toledo",
    rate: 1890,
    miles: 412,
    status: "moving",
    step: "assigned",
    truckId: null,
    driverId: null,
    trailerId: "tr-09",
    localId: "p-brar",
    dispatchNo: null,
    leave: "16:40",
    route: "401 · Ambassador · I-75",
    departed: false,
    localPicked: false,
    papers: [...pickup(false), ...delivery(false)],
    otif: "med",
    freeHours: 2,
    waitRate: 75,
    track: "NL-4510",
    notes: "JIT. Plant window 14:00. Complete package waiting on Yes.",
    emptyKm: 0,
  },
  {
    id: "o-4402",
    code: "L-4402",
    shipper: "Linamar Guelph",
    from: "Guelph",
    to: "Ford Dearborn",
    window: "18:00 Dearborn",
    rate: 1680,
    miles: 390,
    status: "moving",
    step: "highway",
    truckId: "t-003",
    driverId: "p-alvarez",
    trailerId: "tr-08",
    localId: "p-brar",
    dispatchNo: "D-8801",
    leave: "11:20",
    route: "401 · Ambassador · I-75",
    departed: true,
    localPicked: true,
    papers: [...pickup(true), ...delivery(false)],
    otif: "low",
    freeHours: 2,
    waitRate: 75,
    track: "L-4402",
    notes: "Legal lanes only. No extra stop. Clock 2.1 h.",
    emptyKm: 22,
  },
  {
    id: "o-4403",
    code: "L-4403",
    shipper: "Ford Dearborn",
    from: "Windsor",
    to: "Ford Dearborn",
    window: "14:00 Dearborn",
    rate: 1420,
    miles: 280,
    status: "dock",
    step: "delivery",
    truckId: "t-004",
    driverId: "p-kowalski",
    trailerId: "tr-04",
    localId: "p-brar",
    dispatchNo: "D-8794",
    leave: "08:10",
    route: "Ambassador · I-94",
    departed: true,
    localPicked: true,
    papers: [...pickup(true, "448291"), ...delivery(false)],
    otif: "high",
    dockAt: "2026-09-03T14:00:00",
    freeHours: 2,
    waitRate: 75,
    track: "L-4403",
    notes: "At dock. Free time ended 16:00.",
    emptyKm: 8,
  },
  {
    id: "o-4520",
    code: "L-4520",
    shipper: "Magna Brampton",
    from: "Magna L-4520",
    to: "GM Lansing",
    window: "06:00 Lansing",
    rate: 1550,
    miles: 360,
    status: "new",
    step: "incomplete",
    truckId: null,
    driverId: null,
    trailerId: null,
    localId: null,
    dispatchNo: null,
    leave: "",
    route: "",
    departed: false,
    localPicked: false,
    papers: [...pickup(false), ...delivery(false)],
    otif: "med",
    freeHours: 2,
    waitRate: 75,
    track: "L-4520",
    notes: "Incomplete. Shipper and lane in. Need truck, trailer, local, rate confirm.",
    emptyKm: 14,
  },
  {
    id: "o-4401",
    code: "L-4401",
    shipper: "Honda Alliston",
    from: "Alliston",
    to: "Marysville OH",
    window: "21:00 Alliston pickup",
    rate: 1720,
    miles: 418,
    status: "new",
    step: "ready",
    truckId: null,
    driverId: null,
    trailerId: null,
    localId: "p-brar",
    dispatchNo: null,
    leave: "18:40",
    route: "400 · 401 · Ambassador · I-75",
    departed: false,
    localPicked: false,
    papers: [...pickup(false), ...delivery(false)],
    otif: "low",
    freeHours: 2,
    waitRate: 75,
    track: "L-4401",
    notes: "68 km extra empty from Cambridge if T-005. True net before Yes.",
    emptyKm: 68,
  },
  {
    id: "o-4388",
    code: "L-4388",
    shipper: "Toyota Cambridge",
    from: "Cambridge",
    to: "Georgetown KY — REMOVED; now Buffalo cross-dock cancelled. Delivered Dearborn satellite.",
    window: "done",
    rate: 2140,
    miles: 400,
    status: "done",
    step: "done",
    truckId: "t-002",
    driverId: "p-patel",
    trailerId: "tr-12",
    localId: "p-brar",
    dispatchNo: "D-8710",
    leave: "yesterday",
    route: "401 · Ambassador",
    departed: true,
    localPicked: true,
    papers: [...pickup(true), ...delivery(true)],
    otif: "low",
    freeHours: 2,
    waitRate: 75,
    track: "L-4388",
    notes: "Delivered. Invoice includes $187 wait. Ready to send.",
    emptyKm: 0,
  },
];

export const items: Item[] = [
  { id: "i1", title: "Yes L-4510 package", detail: "TR-09 · T-002 Patel or keep T-005? Local D. Brar. Leave 16:40. Ambassador. D-8812.", impact: "Plant window 14:00 Toledo. Late = chargeback.", desk: ["owner", "dispatcher"], status: "open", action: "assign-4510", loadId: "o-4510" },
  { id: "i2", title: "T-001 stays in shop", detail: "Brakes. ABS SPN 789. T-001 shop. TR-11 shop with it. Work order WO-001 open. Do not log drive.", impact: "Downtime $760 today.", desk: ["owner", "dispatcher", "shop", "safety"], status: "open", action: "ack-shop", truckId: "t-001", trailerId: "tr-11" },
  { id: "i3", title: "No second stop on T-003", detail: "Alvarez 2.1 h drive left after Toledo. A reload would break the clock.", impact: "Illegal dispatch if Yes on extra freight.", desk: ["owner", "dispatcher", "safety"], status: "open", action: "hos-lock", truckId: "t-003", loadId: "o-4402" },
  { id: "i4", title: "Hold $420 on M. Singh", detail: "Fuel card swipe, no receipt in Bit Locker.", impact: "Pay held until receipt or Owner releases.", desk: ["owner", "backoffice"], status: "open", action: "keep-hold", personId: "p-singh" },
  { id: "i5", title: "Claim $150 wait at Dearborn", detail: "T-004 inside dock fence past free time. $75/h × 2 h.", impact: "Add accessorial to INV on L-4403.", desk: ["owner", "dispatcher", "backoffice"], status: "open", action: "claim-wait", loadId: "o-4403" },
  { id: "i6", title: "Book Singh med card", detail: "Expires 14 Sep 2026. 11 days.", impact: "Cannot dispatch southbound if lapsed.", desk: ["hr", "owner"], status: "open", action: "book-med", personId: "p-singh" },
  { id: "i7", title: "Hire P. Chen onto Brampton dock", detail: "Background clear. Drug pending. $22/h helper.", impact: "Night sort coverage.", desk: ["hr", "owner"], status: "open", action: "hire-chen", personId: "p-chen" },
  { id: "i8", title: "Finish Magna L-4520", detail: "Order incomplete. Fill truck, trailer, local, then it becomes assignable.", impact: "Cannot Yes a half-built load.", desk: ["dispatcher", "owner"], status: "open", action: "complete-4520", loadId: "o-4520" },
  { id: "i9", title: "Honda B-12 on the board", detail: "$1,640 / 412 mi. 990 timer running. Take onto desk or decline.", impact: "Tender dies if ignored.", desk: ["dispatcher", "owner"], status: "open", action: "take-honda" },
  { id: "i10", title: "Send INV-4388", detail: "Toyota delivered. POD in locker. $2,140 incl wait.", impact: "Cash. Factor pack ready.", desk: ["backoffice", "owner"], status: "open", action: "send-inv", loadId: "o-4388" },
  { id: "i11", title: "Fill T-003 before 06:00", detail: "Flying J $1.29/L vs noon $1.41. Clock allows the stop.", impact: "Night fill saves ~$11k / month at this pattern.", desk: ["owner", "dispatcher"], status: "open", action: "fuel-plan", truckId: "t-003" },
  { id: "i12", title: "TR-06 stays in shop", detail: "Right rear door will not latch. Not hooked. Separate from T-001.", impact: "Do not assign. Shop WO-002.", desk: ["owner", "dispatcher", "safety"], status: "open", action: "ack-trailer-shop", trailerId: "tr-06" },
];

export const invoices: Invoice[] = [
  { id: "inv-4388", loadId: "o-4388", who: "Toyota Cambridge", amount: 2140, status: "draft", note: "Includes $187 wait" },
  { id: "inv-4403", loadId: "o-4403", who: "Ford Dearborn", amount: 1420, status: "draft", note: "Wait claim open" },
  { id: "inv-4402", loadId: "o-4402", who: "Linamar Guelph", amount: 1680, status: "draft", note: "" },
];

export const rates: Rate[] = [
  { id: "r1", label: "Load", amount: 2.1, unit: "/km" },
  { id: "r2", label: "Fuel", amount: 0.42, unit: "/km" },
  { id: "r3", label: "Driver", amount: 0.55, unit: "/km" },
  { id: "r4", label: "Wait", amount: 75, unit: "/h" },
  { id: "r5", label: "Helper", amount: 22, unit: "/h" },
  { id: "r6", label: "Parking after 12h", amount: 45, unit: "/h" },
];

export const pays: Pay[] = [
  { id: "pay-singh", personId: "p-singh", amount: 1840, hold: 420, status: "held", note: "Fuel receipt missing" },
  { id: "pay-alvarez", personId: "p-alvarez", amount: 2100, hold: 0, status: "open", note: "Lease-op" },
  { id: "pay-patel", personId: "p-patel", amount: 1920, hold: 0, status: "open", note: "" },
  { id: "pay-kowalski", personId: "p-kowalski", amount: 1880, hold: 0, status: "open", note: "" },
  { id: "pay-nguyen", personId: "p-nguyen", amount: 1760, hold: 0, status: "open", note: "1099" },
  { id: "pay-brar", personId: "p-brar", amount: 960, hold: 0, status: "open", note: "Local hourly" },
];

export const msgs: Msg[] = [
  { id: "m10", from: "Alex Dispatch", to: "J. Alvarez", when: "10:02", text: "Yard closed at 19:00. Do not deadhead without a new load.", read: true, channel: "sms", broadcast: true },
  { id: "m11", from: "Alex Dispatch", to: "A. Kowalski", when: "10:02", text: "Yard closed at 19:00. Do not deadhead without a new load.", read: true, channel: "sms", broadcast: true },
  { id: "m12", from: "Alex Dispatch", to: "M. Singh", when: "10:02", text: "Yard closed at 19:00. Do not deadhead without a new load.", read: true, channel: "sms", broadcast: true },
  { id: "m13", from: "Alex Dispatch", to: "R. Patel", when: "10:02", text: "Yard closed at 19:00. Do not deadhead without a new load.", read: true, channel: "sms", broadcast: true },
  { id: "m14", from: "Alex Dispatch", to: "K. Nguyen", when: "10:02", text: "Yard closed at 19:00. Do not deadhead without a new load.", read: true, channel: "sms", broadcast: true },
  { id: "m1", from: "Alex Dispatch", to: "J. Alvarez", loadId: "o-4402", when: "11:22", text: "D-8801 assigned. Legal lanes only. No extra stop.", read: true, channel: "sms" },
  { id: "m2", from: "Alex Dispatch", to: "J. Alvarez", loadId: "o-4402", when: "12:14", text: "Papers in. You can leave.", read: true, channel: "sms" },
  { id: "m3", from: "J. Alvarez", to: "Alex Dispatch", loadId: "o-4402", when: "12:18", text: "Copy. Fueling in Windsor then Ambassador.", read: true, channel: "sms" },
  { id: "m8", from: "Alex Dispatch", to: "J. Alvarez", loadId: "o-4402", when: "12:19", text: "Clock is 2.1 h. Do not offer him a reload. Staff only.", read: true, channel: "note" },
  { id: "m18", from: "D. Brar", to: "Alex Dispatch", when: "12:08", text: "Seal photo going in now.", read: true, channel: "sms" },
  { id: "m19", from: "R. Patel", to: "Alex Dispatch", when: "09:40", text: "Empty at Brampton. Ready.", read: true, channel: "sms" },
  { id: "m6", from: "Alex Dispatch", to: "M. Singh", when: "08:02", text: "T-001 stays in Mississauga shop. Brakes. Do not log drive.", read: true, channel: "sms" },
  { id: "m4", from: "Alex Dispatch", to: "A. Kowalski", loadId: "o-4403", when: "16:05", text: "Still at Dearborn dock. Clocking wait.", read: true, channel: "sms" },
  { id: "m5", from: "A. Kowalski", to: "Alex Dispatch", loadId: "o-4403", when: "16:07", text: "At dock, waiting. Door 22.", read: true, channel: "sms" },
  { id: "m16", from: "Alex Dispatch", to: "A. Kowalski", loadId: "o-4403", when: "16:10", text: "Stay on door 22. Clocking wait from 14:00.", read: true, channel: "sms" },
  { id: "m17", from: "Alex Dispatch", to: "A. Kowalski", when: "16:11", text: "Free time ended. Claim wait if they keep him.", read: true, channel: "note" },
  { id: "m9", from: "J. Alvarez", to: "Alex Dispatch", loadId: "o-4402", when: "16:18", text: "On I-75. Fuel after Toledo if the clock allows.", read: false, channel: "sms" },
  { id: "m15", from: "J. Alvarez", to: "Alex Dispatch", loadId: "o-4402", when: "16:22", text: "Customer at Toledo said the dock isn't ready. Holding at the gate.", read: false, channel: "sms" },
  { id: "m7", from: "Night Porter", to: "Priya Owner", when: "02:14", text: "IVR: breakdown press 3 — false alarm, Patel radio check.", read: false, channel: "voice" },
  { id: "m20", from: "Alex Dispatch", to: "M. Diaz", when: "08:10", text: "T-001 brakes. Do not release until DVIR signed.", read: false, channel: "sms" },
  { id: "m21", from: "Alex Dispatch", to: "T. Okonkwo", when: "11:00", text: "Help Brar at Magna. Seal and packing list.", read: false, channel: "sms" },
];

export const notes: Note[] = [
  { id: "n1", loadId: "o-4402", when: "11:22", text: "Assigned D-8801 · T-003 · TR-08 · Alvarez · Brar pickup done" },
  { id: "n2", loadId: "o-4402", when: "12:14", text: "Local pickup papers scanned into Bit Locker" },
  { id: "n3", loadId: "o-4402", when: "12:20", text: "Left Windsor yard. 214 sent." },
  { id: "n4", loadId: "o-4403", when: "14:00", text: "Entered Dearborn fence. Detention clock armed." },
  { id: "n5", loadId: "o-4388", when: "yesterday", text: "Delivered. POD signed. 210 drafted." },
];

export const tenders: Tender[] = [
  { id: "b-12", source: "edi", shipper: "Honda Alliston", lane: "Alliston → Marysville", rate: 1640, miles: 412, window: "21:00 pickup", status: "open", expire: "30 min", equip: "van" },
  { id: "b-13", source: "email", shipper: "Toyota Cambridge", lane: "Cambridge → Georgetown KY", rate: 2180, miles: 620, window: "06:00", status: "open", expire: "2 h", equip: "van" },
  { id: "b-14", source: "edi", shipper: "Stellantis Windsor", lane: "Windsor → Toledo North", rate: 1890, miles: 412, window: "14:00", status: "taken", expire: "—", equip: "van" },
  { id: "b-15", source: "email", shipper: "Cheap broker", lane: "Toronto → Cleveland", rate: 890, miles: 500, window: "anytime", status: "declined", expire: "—", equip: "van" },
  { id: "b-16", source: "desk", shipper: "Magna Brampton", lane: "Brampton → Lansing", rate: 1550, miles: 360, window: "06:00", status: "taken", expire: "—", equip: "van" },
];

export const mails: Mail[] = [
  { id: "mail-1", from: "tenders@honda.ca", subject: "204 Alliston 21:00 $1640", body: "Equipment van. FAST preferred. 990 in 30 min.", when: "05:40", read: false, tenderId: "b-12" },
  { id: "mail-2", from: "logistics@toyota.ca", subject: "Rate con Cambridge", body: "Cambridge to Marysville satellite. $2180.", when: "05:12", read: false, tenderId: "b-13" },
  { id: "mail-3", from: "unknown@fastcash.biz", subject: "HOT LOAD $$$", body: "Cleveland dump. $890.", when: "04:02", read: true, tenderId: "b-15" },
];

export const edi: EdiDoc[] = [
  { id: "e1", set: "204", tenderId: "b-12", status: "in", when: "05:40", note: "Honda Alliston" },
  { id: "e2", set: "204", tenderId: "b-14", loadId: "o-4510", status: "ack", when: "yesterday", note: "Stellantis" },
  { id: "e3", set: "214", loadId: "o-4402", status: "sent", when: "12:20", note: "Departed Windsor" },
  { id: "e4", set: "214", loadId: "o-4403", status: "sent", when: "14:00", note: "Arrived Dearborn" },
  { id: "e5", set: "210", loadId: "o-4388", status: "in", when: "yesterday", note: "Draft invoice" },
];

export const locker: LockerFile[] = [
  { id: "lk1", loadId: "o-4402", kind: "bol", name: "BOL-4402.pdf", locked: true, source: "scan", by: "D. Brar", when: "12:10" },
  { id: "lk2", loadId: "o-4402", kind: "seal", name: "seal-4402.jpg", locked: true, source: "scan", by: "D. Brar", when: "12:12" },
  { id: "lk3", loadId: "o-4402", kind: "aci", name: "ACI-4402.xml", locked: true, source: "desk", by: "D. Brar", when: "12:13" },
  { id: "lk4", loadId: "o-4403", kind: "bol", name: "BOL-4403.pdf", locked: true, source: "scan", by: "D. Brar", when: "08:40" },
  { id: "lk5", loadId: "o-4388", kind: "bol", name: "BOL-4388.pdf", locked: true, source: "scan", by: "D. Brar", when: "yesterday" },
  { id: "lk6", loadId: "o-4388", kind: "pod", name: "POD-4388.pdf", locked: true, source: "scan", by: "R. Patel", when: "yesterday" },
  { id: "lk7", loadId: "o-4388", kind: "edi", name: "210-4388.xml", locked: false, source: "edi", by: "system", when: "yesterday" },
];

export const hos: HosLog[] = [
  { personId: "p-alvarez", date: "2026-09-03", certified: false, driveLeft: 2.1, cycleLeft: 14.4, ruleset: "US 70/8 · ON 13/70", events: [
    { duty: "off", start: "00:00", hours: 8 },
    { duty: "on", start: "08:00", hours: 0.5 },
    { duty: "drive", start: "08:30", hours: 8.9 },
    { duty: "on", start: "17:20", hours: 0.5 },
  ]},
  { personId: "p-kowalski", date: "2026-09-03", certified: true, driveLeft: 6.8, cycleLeft: 22, ruleset: "US 70/8", events: [
    { duty: "sleeper", start: "00:00", hours: 7 },
    { duty: "drive", start: "07:00", hours: 4.2 },
    { duty: "on", start: "14:00", hours: 3 },
  ]},
  { personId: "p-singh", date: "2026-09-03", certified: true, driveLeft: 8.2, cycleLeft: 40, ruleset: "ON 13/70", events: [
    { duty: "off", start: "00:00", hours: 10 },
    { duty: "on", start: "10:00", hours: 2 },
  ]},
  { personId: "p-patel", date: "2026-09-03", certified: false, driveLeft: 10.4, cycleLeft: 50, ruleset: "ON 13/70", events: [
    { duty: "off", start: "00:00", hours: 10 },
  ]},
  { personId: "p-nguyen", date: "2026-09-03", certified: false, driveLeft: 9.6, cycleLeft: 48, ruleset: "ON 13/70", events: [
    { duty: "off", start: "00:00", hours: 11 },
  ]},
];

export const sites: Site[] = [
  { id: "s-brampton", name: "Brampton yard", kind: "yard", lat: 43.731, lng: -79.762, radius: 0.45 },
  { id: "s-windsor", name: "Stellantis Windsor", kind: "plant", lat: 42.292, lng: -82.99, radius: 0.85 },
  { id: "s-toledo", name: "Jeep Toledo North", kind: "plant", lat: 41.692, lng: -83.512, radius: 0.85 },
  { id: "s-dearborn", name: "Ford Dearborn", kind: "plant", lat: 42.322, lng: -83.176, radius: 0.85 },
  { id: "s-alliston", name: "Honda Alliston", kind: "plant", lat: 44.151, lng: -79.869, radius: 0.85 },
  { id: "s-cambridge", name: "Toyota Cambridge", kind: "plant", lat: 43.36, lng: -80.31, radius: 0.85 },
  { id: "s-guelph", name: "Linamar Guelph", kind: "plant", lat: 43.545, lng: -80.248, radius: 0.85 },
  { id: "s-shop", name: "Mississauga shop", kind: "shop", lat: 43.59, lng: -79.64, radius: 0.3 },
  { id: "s-amb", name: "Ambassador Bridge", kind: "border", lat: 42.312, lng: -83.074, radius: 0.4 },
  { id: "s-bw", name: "Blue Water Bridge", kind: "border", lat: 42.999, lng: -82.423, radius: 0.4 },
];

export const pings: Ping[] = trucks.map((t, i) => ({
  id: `pg-${i}`,
  truckId: t.id,
  lat: t.lat,
  lng: t.lng,
  when: "16:20",
  event: "move",
}));

export const dvirs: Dvir[] = [
  { id: "dv1", truckId: "t-001", trailerId: null, when: "06:10", by: "M. Singh", result: "fail", note: "Left steer brake pull. ABS lamp." },
  { id: "dv2", truckId: "t-003", trailerId: null, when: "07:50", by: "J. Alvarez", result: "pass", note: "Pre-trip ok" },
  { id: "dv3", truckId: "t-004", trailerId: null, when: "06:40", by: "A. Kowalski", result: "pass", note: "Pre-trip ok" },
  { id: "dv4", truckId: null, trailerId: "tr-11", when: "06:12", by: "M. Singh", result: "fail", note: "Trailer stays with T-001." },
  { id: "dv5", truckId: null, trailerId: "tr-06", when: "07:05", by: "M. Diaz", result: "fail", note: "Right rear door will not latch." },
  { id: "dv6", truckId: null, trailerId: "tr-08", when: "07:52", by: "J. Alvarez", result: "pass", note: "Trailer pre-trip ok" },
];

export const wos: WorkOrder[] = [
  { id: "wo-001", truckId: "t-001", trailerId: "tr-11", title: "Brakes / ABS SPN 789", parts: "Pads, drums, ABS sensor", status: "open", eta: "tomorrow 14:00", downtime: 760 },
  { id: "wo-002", truckId: null, trailerId: "tr-06", title: "Right rear door latch", parts: "Latch kit, seal", status: "open", eta: "today 18:00", downtime: 650 },
];

export const users: User[] = people.filter((p) => ["owner", "dispatcher", "hr", "backoffice", "admin", "safety"].includes(p.kind)).map((p) => ({
  id: "u-" + p.id,
  name: p.name,
  email: p.email,
  role: p.kind,
  personId: p.id,
}));

export const connectors: Connector[] = [
  { id: "samsara", name: "Samsara VG34", group: "ELD / GPS", on: true },
  { id: "motive", name: "Motive", group: "ELD / GPS", on: false },
  { id: "geotab", name: "Geotab", group: "ELD / GPS", on: false },
  { id: "twilio", name: "Twilio SMS (demo)", group: "Comms", on: false },
  { id: "whatsapp", name: "WhatsApp Cloud (demo)", group: "Comms", on: false },
  { id: "edi", name: "McLeod DataFusion EDI", group: "Freight", on: true },
  { id: "dat", name: "DAT One", group: "Freight", on: false },
  { id: "truckstop", name: "Truckstop", group: "Freight", on: false },
  { id: "qbo", name: "QuickBooks", group: "Money", on: false },
  { id: "wex", name: "WEX fuel", group: "Money", on: true },
  { id: "okta", name: "Okta SAML (demo IdP)", group: "Identity", on: true },
  { id: "pbi", name: "Power BI feed", group: "Live", on: true },
];

export const ifta: IftaRow[] = [
  { jur: "ON", miles: 1840, gallons: 280 },
  { jur: "MI", miles: 920, gallons: 140 },
  { jur: "OH", miles: 410, gallons: 62 },
];

export const audit: Audit[] = [
  { id: "a1", when: "12:14", who: "D. Brar", what: "Scanned pickup papers L-4402" },
  { id: "a2", when: "12:20", who: "system", what: "EDI 214 departed L-4402" },
  { id: "a3", when: "14:00", who: "system", what: "Geofence enter Ford Dearborn T-004" },
];

export const fuelSeries = [
  { d: "21", v: 5100 },
  { d: "22", v: 5480 },
  { d: "23", v: 6020 },
  { d: "24", v: 5800 },
  { d: "25", v: 4900 },
  { d: "26", v: 4700 },
  { d: "27", v: 4550 },
  { d: "28", v: 6100 },
  { d: "29", v: 6400 },
  { d: "30", v: 5900 },
  { d: "31", v: 6200 },
  { d: "1", v: 5850 },
  { d: "2", v: 5700 },
  { d: "3", v: 6140 },
];

export const boxGroups: BoxGroup[] = [
  { id: "g-hwy", name: "Highway", tone: "navy" },
  { id: "g-local", name: "Local", tone: "ok" },
  { id: "g-shop", name: "Shop", tone: "bad" },
  { id: "g-night", name: "Night", tone: "hold" },
];

export const boxThreads: BoxThread[] = [
  { personId: "p-alvarez", assignedTo: "p-alex", status: "in_progress", groups: ["g-hwy"], tags: ["JIT", "HOS"], deskNote: "Legal lanes only. No extra stop." },
  { personId: "p-kowalski", assignedTo: null, status: "waiting", groups: ["g-hwy"], tags: ["Wait"], deskNote: "Dearborn door 22. Free time ended." },
  { personId: "p-singh", assignedTo: "p-alex", status: "open", groups: ["g-shop"], tags: ["Fuel"], deskNote: "Do not log drive. Brakes." },
  { personId: "p-patel", assignedTo: null, status: "resolved", groups: ["g-hwy"], tags: [], deskNote: "Empty at Brampton." },
  { personId: "p-nguyen", assignedTo: null, status: "new", groups: ["g-hwy"], tags: ["JIT"], deskNote: "" },
  { personId: "p-brar", assignedTo: "p-alex", status: "open", groups: ["g-local"], tags: [], deskNote: "Pickup papers for assigned loads." },
  { personId: "p-okonkwo", assignedTo: null, status: "open", groups: ["g-local", "g-night"], tags: [], deskNote: "" },
  { personId: "p-chen", assignedTo: null, status: "new", groups: ["g-night"], tags: [], deskNote: "Hire pending." },
  { personId: "p-diaz", assignedTo: null, status: "open", groups: ["g-shop"], tags: [], deskNote: "WO-001 brakes." },
];

export const boxActivity: BoxActivity[] = [
  { id: "ba1", personId: "p-alvarez", when: "11:22", who: "Alex Dispatch", detail: "Assigned to Alex Dispatch" },
  { id: "ba2", personId: "p-alvarez", when: "11:23", who: "Alex Dispatch", detail: "Status → In progress" },
  { id: "ba3", personId: "p-alvarez", when: "11:24", who: "Alex Dispatch", detail: "Groups → Highway" },
  { id: "ba4", personId: "p-kowalski", when: "16:05", who: "Alex Dispatch", detail: "Status → Waiting" },
  { id: "ba5", personId: "p-singh", when: "08:02", who: "Alex Dispatch", detail: "Assigned to Alex Dispatch" },
];
