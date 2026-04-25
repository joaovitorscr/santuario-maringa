---
name: Organic Curator
colors:
  surface: "#f7faf5"
  surface-dim: "#d8dbd6"
  surface-bright: "#f7faf5"
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
  surface-tint: "#296a44"
  primary: "#296a44"
  on-primary: "#ffffff"
  primary-container: "#94d7a8"
  on-primary-container: "#1c5f3a"
  inverse-primary: "#92d5a6"
  secondary: "#7f5440"
  on-secondary: "#ffffff"
  secondary-container: "#ffc5ac"
  on-secondary-container: "#7a4f3c"
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
  secondary-fixed: "#ffdbcc"
  secondary-fixed-dim: "#f3baa2"
  on-secondary-fixed: "#311305"
  on-secondary-fixed-variant: "#643d2b"
  tertiary-fixed: "#e5e2df"
  tertiary-fixed-dim: "#c9c6c3"
  on-tertiary-fixed: "#1c1b1a"
  on-tertiary-fixed-variant: "#484745"
  background: "#f7faf5"
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

This design system embodies a "Soft Minimalist" aesthetic with an editorial, curated feel. It targets an audience seeking tranquility, home sanctuary, and mindful living. The UI evokes an emotional response of serenity and warmth, prioritizing high-quality whitespace and organic composition over dense information architecture.

The style leverages subtle tactile cues and a refined editorial layout, blending the cleanliness of modern minimalism with the inviting warmth of natural textures. It avoids clinical coldness by utilizing soft color transitions and intentional, rhythmic typography.

## Colors

The palette is rooted in a botanical and earth-toned foundation.

- **Primary (#94D7A8):** A soft mint green used for brand moments, primary actions, and success states. It represents growth and freshness.
- **Secondary (#B5836D):** A warm wood tone used for accents, secondary buttons, and decorative elements that require a grounding, tactile feel.
- **Surface/Tertiary (#F7F3F0):** A warm parchment off-white used as the primary background to reduce eye strain and enhance the "editorial paper" feel.
- **Neutral (#2D312E):** A deep charcoal-green used for typography and high-contrast iconography, providing better legibility than pure black.

## Typography

This design system uses **Plus Jakarta Sans** exclusively to maintain a cohesive, modern, and welcoming personality. The typography hierarchy follows an editorial logic: large, bold display heads for storytelling, and generous line heights for body copy to ensure a breezy reading experience. Labels use slightly increased letter spacing and a semi-bold weight to distinguish them from prose.

## Layout & Spacing

The design system utilizes a **fixed-grid** model for desktop (12 columns, 1200px max-width) and a **fluid-grid** for mobile (4 columns). The spacing philosophy is based on an 8pt linear scale to maintain visual rhythm.

Generous margins (32px+) and wide gutters (24px) are essential to maintain the "curated" look. Elements should be grouped using "negative space as a separator" rather than heavy lines or dividers whenever possible.

## Elevation & Depth

Hierarchy is achieved through **tonal layers** and **ambient shadows**.

- **Surface Tiers:** Use the tertiary parchment color for the base, with pure white (#FFFFFF) reserved for elevated cards or floating elements.
- **Shadows:** Shadows are extremely diffused (Blur: 20px-40px) with very low opacity (5-8%). They are tinted with the secondary wood tone or primary mint to keep the depth feeling organic rather than synthetic.
- **Glassmorphism:** Use subtle backdrop blurs (10px-15px) for navigation overlays and modals to maintain a sense of environmental depth without breaking the minimal aesthetic.

## Shapes

The shape language is defined by **Rounded** corners, reflecting the organic theme.

- Standard components (buttons, inputs) use a 0.5rem (8px) radius.
- Large containers and cards use a 1rem (16px) radius.
- Interactive tags and chips utilize a full pill-shape (100px) to contrast against more structured grid elements.

## Components

- **Buttons:** Primary buttons use the Mint Green (#94D7A8) with Neutral text. Secondary buttons use a Wood Tone (#B5836D) outline. Transitions should be soft (200ms ease-in-out).
- **Cards:** Cards should have a pure white background, a 16px corner radius, and a soft ambient shadow. Keep padding generous (min 24px).
- **Input Fields:** Use a subtle Tertiary (#F7F3F0) fill with a 1px border that shifts to Primary Mint on focus. Avoid sharp corners.
- **Chips & Tags:** Pill-shaped with a light tint of the secondary color. Use for categories like "Handcrafted," "Sustainable," or "Organic."
- **Lists:** Use wide spacing between items (16px+) and replace standard bullets with custom organic icons or simple Wood Tone dots.
- **Featured Curation:** A specialized component for featured articles involving large-scale imagery, overlapping text elements, and the Wood Tone used for pull-quotes.
