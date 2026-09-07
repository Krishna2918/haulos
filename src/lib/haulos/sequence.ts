import type { Order, LockerFile, Paper, Step, Trailer, Truck } from "./types";

export const STEP_LABEL: Record<Step, string> = {
  incomplete: "Incomplete",
  ready: "Ready to assign",
  assigned: "Assigned · pickup papers",
  pickup: "Local pickup",
  highway: "Highway",
  delivery: "Delivery papers",
  done: "Delivered",
};

export function pickupPapers(o: Order): Paper[] {
  return o.papers.filter((p) => p.at === "pickup");
}
export function deliveryPapers(o: Order): Paper[] {
  return o.papers.filter((p) => p.at === "delivery");
}
export function missingPickup(o: Order) {
  return pickupPapers(o).filter((p) => !p.scanned).map((p) => p.name);
}
export function missingDelivery(o: Order) {
  return deliveryPapers(o).filter((p) => !p.scanned).map((p) => p.name);
}

export function orderComplete(o: Order) {
  return Boolean(o.shipper && o.from && o.to && o.rate && o.window);
}

export function canAssign(o: Order, truck?: Truck | null, trailer?: Trailer | null) {
  if (o.step === "incomplete") return "Order is incomplete. Fill shipper, lane, rate.";
  if (truck?.status === "shop") return `${truck.unit} is in shop. Do not dispatch.`;
  if (trailer?.status === "shop") return `${trailer.unit} is in shop. Do not hook.`;
  if (trailer?.status === "loaded" || trailer?.status === "dwell") {
    return `${trailer.unit} still has freight. Drop it first.`;
  }
  if (truck && truck.hoursLeft < 3) return `${truck.unit} only ${truck.hoursLeft} h left. Illegal if this is a second stop.`;
  if (o.step === "assigned") return "Already assigned. Local must scan pickup papers.";
  return null;
}

export function canLeaveYard(o: Order) {
  if (!o.localPicked && missingPickup(o).length) {
    return `Local has not finished pickup. Missing: ${missingPickup(o).join(", ")}`;
  }
  if (missingPickup(o).length) return `Pickup papers missing: ${missingPickup(o).join(", ")}`;
  return null;
}

export function canDeliver(o: Order) {
  if (missingDelivery(o).length) return `Delivery papers missing: ${missingDelivery(o).join(", ")}`;
  return null;
}

export function nextHint(o: Order) {
  if (o.step === "incomplete") return "Fill the rest of the order. Then it can take a Yes.";
  if (o.step === "ready") return "Suggest truck, trailer, local, highway, route. One Yes.";
  if (o.step === "assigned") return `Local scans: ${missingPickup(o).join(", ") || "all in"}`;
  if (o.step === "pickup") return "Highway may leave when pickup papers are in.";
  if (o.step === "highway") return "On the road. Legal lanes only.";
  if (o.step === "delivery") return `Highway scans: ${missingDelivery(o).join(", ") || "all in"}`;
  return "Done. Invoice follows.";
}

export function lockerFor(loadId: string, files: LockerFile[]) {
  return files.filter((f) => f.loadId === loadId);
}

export function detentionDollars(o: Order, now = Date.now()) {
  if (!o.dockAt) return 0;
  const start = new Date(o.dockAt).getTime() + o.freeHours * 3600_000;
  const hrs = Math.max(0, (now - start) / 3600_000);
  return Math.round(hrs * o.waitRate);
}

export function trueNet(o: Order, fuelPerKm: number, driverPerKm: number) {
  const km = o.miles * 1.609;
  const empty = o.emptyKm;
  const fuel = (km + empty) * fuelPerKm;
  const driver = km * driverPerKm;
  return Math.round(o.rate - fuel - driver);
}
