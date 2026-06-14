---
name: Minimal Sanctuary
colors:
  surface: "#f8faf8"
  surface-dim: "#e2e8e2"
  surface-bright: "#ffffff"
  surface-container-lowest: "#ffffff"
  surface-container-low: "#f1f4f0"
  surface-container: "#ecefea"
  surface-container-high: "#e6e9e4"
  surface-container-highest: "#e0e3df"
  on-surface: "#191c1a"
  on-surface-variant: "#404941"
  inverse-surface: "#2d312e"
  inverse-on-surface: "#eff2ed"
  outline: "#707971"
  outline-variant: "#c0c9bf"
  surface-tint: "#94d7a8"
  primary: "#94d7a8"
  on-primary: "#17201a"
  primary-container: "#dff4e5"
  on-primary-container: "#25623a"
  inverse-primary: "#94d7a8"
  secondary: "#66736b"
  on-secondary: "#ffffff"
  secondary-container: "#eef7f1"
  on-secondary-container: "#17201a"
  tertiary: "#605e5c"
  on-tertiary: "#ffffff"
  tertiary-container: "#cbc7c4"
  on-tertiary-container: "#555351"
  error: "#ba1a1a"
  on-error: "#ffffff"
  error-container: "#ffdad6"
  on-error-container: "#93000a"
  primary-fixed: "#aef2c1"
  primary-fixed-dim: "#92d5a6"
  on-primary-fixed: "#00210f"
  on-primary-fixed-variant: "#09522e"
  secondary-fixed: "#eef7f1"
  secondary-fixed-dim: "#dff4e5"
  on-secondary-fixed: "#17201a"
  on-secondary-fixed-variant: "#25623a"
  tertiary-fixed: "#e5e2df"
  tertiary-fixed-dim: "#c9c6c3"
  on-tertiary-fixed: "#1c1b1a"
  on-tertiary-fixed-variant: "#484745"
  background: "#f8faf8"
  on-background: "#191c1a"
  surface-variant: "#e0e3df"
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: "700"
    lineHeight: "1.1"
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: "600"
    lineHeight: "1.2"
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: "600"
    lineHeight: "1.3"
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.6"
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: "600"
    lineHeight: "1.4"
    letterSpacing: 0.05em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: "500"
    lineHeight: "1.4"
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style

This design system embodies a minimal, task-focused sanctuary aesthetic. It targets staff who need to scan residents, candidates, health states, and adoption data quickly, so the UI prioritizes clarity, calm hierarchy, and predictable controls.

The style relies on neutral surfaces, quiet borders, clear type, and a single green brand accent. Decorative warmth is secondary to usability: screens should feel calm, organized, and efficient during repeated daily use.

## Colors

The palette is rooted in clean neutrals with a soft botanical accent.

- **Primary (#94D7A8):** A soft mint green used for primary actions, active states, key highlights, and success states.
- **Surface (#FFFFFF):** Pure white used for cards and grouped controls.
- **Background (#F8FAF8):** A near-white green-tinted canvas that keeps screens light without feeling stark.
- **Neutral (#17201A):** A deep charcoal-green used for typography and high-contrast iconography.

## Typography

This design system uses **Plus Jakarta Sans** exclusively to maintain a cohesive, modern personality. The typography hierarchy is restrained: clear screen titles, compact section labels, and legible body copy. Avoid oversized display treatment inside operational screens.

## Layout & Spacing

The design system utilizes a **fixed-grid** model for desktop (12 columns, 1200px max-width) and a **fluid-grid** for mobile (4 columns). The spacing philosophy is based on an 8pt linear scale to maintain visual rhythm.

Use consistent spacing to support scanning. Keep grouped data close together, use dividers only inside dense lists, and avoid unnecessary nested cards.

## Elevation & Depth

Hierarchy is achieved through **tonal layers**, borders, and spacing.

- **Surface Tiers:** Use the green-tinted background for the base and white for cards or grouped controls.
- **Borders:** Use subtle 1px neutral borders to define grouped content.
- **Shadows:** Avoid decorative shadows unless a modal or overlay requires separation.

## Shapes

The shape language is softly rounded and functional.

- Standard components (buttons, inputs) use a 0.5rem (8px) radius.
- Large containers and cards use a 0.5rem (8px) radius.
- Interactive tags and chips utilize a full pill-shape (100px) to contrast against more structured grid elements.

## Components

- **Buttons:** Primary buttons use Mint Green (#94D7A8) with Neutral text.
- **Cards:** Cards use a pure white background, 8px corner radius, subtle border, and clear internal spacing.
- **Input Fields:** Use a white or near-white fill with a 1px border that shifts to Primary Mint on focus.
- **Chips & Tags:** Pill-shaped with a light green tint for active or available states.
- **Lists:** Favor clear row structure, compact metadata, and predictable tap targets.
- **Featured Curation:** A specialized component for featured articles involving large-scale imagery, overlapping text elements, and the Wood Tone used for pull-quotes.
