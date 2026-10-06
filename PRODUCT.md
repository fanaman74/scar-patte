# Scar-Patte

A French, English and Dutch grooming website for Scar-Patte in Vilvoorde. Visitors select their pet and service in the hero ticket, then continue to the bottom appointment form with these selections prefilled. Contact details, pet name, preferred date/time and optional needs are stored in D1. The salon must confirm availability, suitability and price. The language switch updates content, accessible labels, metadata and dynamic appointment messages, remembers the choice locally, and supports `?lang=fr`, `?lang=en` and `?lang=nl`.

The requested scope is close replication of the style and animation world of [Good Company](https://www.aashishthakuri.com/projects/goodcompany/), adapted to Scar-Patte. That reference is the visual authority; no separate approved composition exists.

Contact: 0492 92 71 32 (`tel:+32492927132`), verified against the supplied [Google Maps listing](https://www.google.com/maps?cid=5130435621918933500) on 2026-10-06. The listing gives Steenstraat 74, 1800 Vilvoorde. Location handoff uses that listing.

The care categories and descriptions are illustrative and need salon confirmation. All reference raster imagery has been replaced with free stock imagery. See IMAGE-SOURCES.md for provenance and licensing. All photographs are illustrative free stock; none are presented as this salon’s premises or clients.

Delivery: Worker in `dist/server/`, assets in `dist/client/`, source pages in `web/`. Review evidence: settled desktop (1265px) and mobile (375px) screenshots on 2026-10-06, plus the shipped HTML, CSS and JavaScript. The visual disposition is ship for preview. These captures disable animation and force eager images, so they establish settled layout rather than motion timing or a complete accessibility audit.

The `/admin` page and data API enforce owner email authorization through platform-authenticated headers and the Sites runtime `ADMIN_EMAIL` allowlist. Requests are paginated and statuses are new, contacted, confirmed or closed. No automatic email is sent. The local preview database and test identity are never deployed.
