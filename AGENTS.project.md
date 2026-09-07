# HaulOS / Fast Fleet / Northline desk

Carrier operating system. Humans oversee. Agents suggest. Not a chatbot.

**Sold name in this preview:** HaulOS. Demo carrier: Northline Freight. Plate: Krishna / CoS Fast Fleet. TruckGPT is a sibling SaaS — never a nav section.

## Rulings (do not reverse)

- No auto-assign, auto-book, or silent money.
- No deploy / live money / live SMS without Krishna. Kill.money starts ON (frozen).
- Driver rates: HR or owner only.
- Papers gate the next step. No paper → no leave, no delivered, no invoice.
- Local pickup before highway when the sequence says so.
- Dual status: truck **and** trailer, always. They are not the same chip.
- Number plate is not on the dispatch board. Plate lives on the Fleet unit file.
- Pennsylvania / Georgetown KY / I-90 Cleveland stay removed. Legal lanes: Ambassador, Blue Water, I-75.
- Dispatcher sees drivers / helpers / local — not HR.
- Helper desk is dock + messages, not dispatch.
- Money desk is owner / backoffice.
- Box is the office inbox. SMS is the driver’s phone. Internal notes never hit the phone.
- Samsara is hours truth. Shop stays shop until DVIR is signed.
- 5-truck demo. 100+ is launch, not this preview.
- Auth/DB stay off (zustand persist). Preview on `0.0.0.0:8080` via `npm run dev` / `startup.sh`. Never kill the preview.

## Live demo (2026-09-05)

Seats: owner Priya, dispatcher Alex, HR Jordan, backoffice Sam, safety Riley, admin IT, drivers Singh/Patel/Alvarez/Kowalski/Nguyen, local Brar, helper Okonkwo, shop Diaz.

Passes: `T-003 / 2202`, `LOCAL / 6606`, `SHOP / 8808`, `HELPER / 7707`. (Dump PINs T-002/0112 are stale.)

Truck status: `loaded | empty | shop | wait`. Trailer status: `hooked | yard | shop | loaded | dwell`. (Dump `on` is stale — use `hooked`.)

Trailers: TR-11 shop (with T-001), TR-12 hooked empty, TR-08 loaded, TR-04 dwell, TR-09 yard, TR-07 yard, TR-06 shop unhooked.

Languages on the phone: EN / PA / FR / ES.

Persist key: `haulos-data-v15`.

## Shipped vs dump

Shipped: role desks, paper-gated sequence, Box + SMS phone, dual status, fleet unit file, DVIR, shop WOs, hire Chen, kill switch, audit, Connect catalog, IFTA draft, detention on L-4403, public track, Needs a Yes, HOS lock on T-003, plate off dispatch.

Not in this preview: add truck/add trailer forms, server persist, live Twilio/DAT/QBO, quoting desk, ACE/ACI transmit, shipper login portal (public track only), yard gate kiosk as a finished product, Mapbox.

## Next if they continue (dump §8)

22 add truck / add trailer → 23 server persist (only if they ask for accounts / cross-device) → 25 SMS vendor is demo-only until Krishna lifts outbound.
