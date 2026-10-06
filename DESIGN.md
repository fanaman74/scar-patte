---
name: Scar-Patte
description: A warm pet-grooming site in the Good Company watercolor world
colors:
  forest: "#073d29"
  paper: "#f8ecd2"
  pink: "#ff8194"
  sunshine: "#ffcc35"
  ink: "#10291f"
typography:
  display:
    fontFamily: "DynaPuff, sans-serif"
    fontSize: "clamp(48px, 6.6vw, 96px)"
    fontWeight: 700
    letterSpacing: "-0.04em"
  body:
    fontFamily: "DM, Arial, sans-serif"
    fontSize: "16px"
    lineHeight: 1.35
  handwritten:
    fontFamily: "PatrickHand, cursive"
rounded:
  pill: "99px"
  detail: "18px"
spacing:
  page-inset: "36px"
  mobile-hero-inset: "22px"
components:
  button-primary:
    backgroundColor: "{colors.forest}"
    textColor: "#fff8e9"
    rounded: "{rounded.pill}"
    padding: "10px 24px"
    height: "48px"
  button-ticket:
    backgroundColor: "{colors.sunshine}"
    textColor: "{colors.forest}"
    rounded: "{rounded.pill}"
    padding: "10px 24px"
---

# Design System: Scar-Patte

## Overview

Creative north star: the Good Company watercolor pet world. Preserve the reference's chunky forest-green lettering, cream paper, pink watercolor hero, yellow sun disc, photographic pet cutouts, appointment ticket, care cards and garden reveal. The user explicitly requested close replication, so stylistic fidelity governs refinement.

Reference and asset provenance: https://www.aashishthakuri.com/projects/goodcompany/ . Reference photography is illustrative; it is not salon photography. No independently approved comp was supplied.

## Colors

Forest green carries headlines, controls and outlines; cream supplies the page and ticket paper. Pink and sunshine yellow are large authored surfaces. The care cards repeat yellow, pink and deep green with watercolor assets. Ink is the reading color. Preserve contrast between cream lettering and green surfaces.

## Typography

DynaPuff supplies the rounded display voice and wordmark. Self-hosted DM Sans (CSS family `DM`) carries body and interface text; Patrick Hand is available for the handwritten reference details. Desktop hero type uses the clamp in the tokens; at 700px and below it becomes `clamp(35px, 8.7vw, 60px)`. The desktop paragraph is capped at 37vw to clear the pet art.

## Layout

Desktop pairs hero copy with pet cutouts and an overlapping ticket, then three care cards, a photograph/copy pair, garden strip and two-column contact section. At 700px the page stacks those groups, moves the ticket below the pets and exposes a themed menu button. Secondary breakpoint: 950px. Page width is capped at 1330px with 36px side insets on desktop.

## Elevation & Depth

Cutouts overlap their surrounding paper and imagery. The service-detail overlay uses `0 10px 30px #073d2930`; the mobile navigation uses `0 14px 28px #073d292d`. Preserve the reference's material outlines and subtle inset treatment.

## Shapes

Organic paper edges, cutout pet contours, ticket notches, rounded small controls and thought bubbles define the world. The yellow circle is the pet scene's backing disc. It does not replace the animals' alpha contours.

## Components

The ticket chooses dog, cat or both and a care category. Submission writes a discussion prompt in the contact section, scrolls there and focuses the telephone link. Care-card arrows reveal details with an action that also leads to the salon contact. Mobile navigation toggles in place; Escape closes it and open care details.

Motion includes the hanging brand tag, hero arrival, card lift/rotation, soft section arrival and garden animals/thought bubbles. Main arrival easing is `cubic-bezier(.16,1,.3,1)`. Reduced-motion rules remove animation and transitions and expose garden content. Selection, scrollbar colors, link underline offsets and visible keyboard outlines use the palette.

## Do's and Don'ts

- Preserve the chosen reference world when making local fixes.
- Keep real French copy readable and clear of overlapping pet art.
- Keep appointment actions truthful: a phone discussion, with no invented reservation confirmation.
- Treat services and reference photography as illustrative until confirmed by the salon.
- Verify motion in an ordinary browser session; capture-mode screenshots establish settled layout only.
