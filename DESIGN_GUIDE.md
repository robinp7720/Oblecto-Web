# Oblecto Web UI Design Guide

This guide documents the updated design tokens and styling patterns for the Oblecto Web UI. Use these tokens and patterns for new components to keep the interface cohesive.

## Design Direction
- **Mood:** cinematic dusk, warm graphite, copper highlights.
- **Surfaces:** glassy panels with soft borders and deep shadows.
- **Motion:** subtle lift on hover, fade/slide on entry; no jittery micro-animations.

## Typography
- **Body:** `"Space Grotesk"` (primary), fallback `"Work Sans"`.
- **Display/Headings:** `"Fraunces"` for section headers and hero titles.
- **Letter spacing:** small positive tracking for navigation and UI labels.

## Core Colors

### Backgrounds
- **App Gradient:**
  - Start: `#6e605f`
  - Mid: `#4b4850`
  - End: `#1d262f`
  - Usage: `#app` background.
- **Modal Backdrop:**
  - `linear-gradient(180deg, #5d5353 0%, #3d3a42 45%, #1b242d 100%)`

### Surfaces
- **Surface Base:** `#3b3437`
- **Surface Strong:** `#453d40`
- **Surface Card (glass):** `rgba(45, 39, 43, 0.9)`
- **Surface Glass:** `rgba(36, 30, 33, 0.72)`

### Text
- **Primary:** `#f4f1ee`
- **Muted:** `rgba(244, 241, 238, 0.72)`
- **Faint:** `rgba(244, 241, 238, 0.55)`

### Accent
- **Copper:** `#d9813c`
- **Copper Highlight:** `#f2a154`
- **Copper Soft:** `rgba(217, 129, 60, 0.35)`

### Borders & Shadows
- **Border:** `rgba(255, 255, 255, 0.12)`
- **Border Strong:** `rgba(255, 255, 255, 0.22)`
- **Soft Shadow:** `0 12px 30px rgba(16, 12, 14, 0.35)`
- **Strong Shadow:** `0 18px 40px rgba(16, 12, 14, 0.6)`

## Radii
- **Small:** `8px`
- **Medium:** `12px`
- **Large:** `18px`
- **Pill:** `999px` (buttons, badges, search)

## Component Patterns

### Navigation Bar
- Height: `64px`
- Background: dark glass gradient with blur
- Text: uppercase, letter-spaced, accent hover

### List Containers
- Title uses display font, subtle divider line under titles.

### Media Cards (Movies, Series, Episodes)
- Rounded corners (`14px`), soft shadow, lift on hover.
- Action overlays use top-to-bottom dark gradient.
- Progress bars use the copper accent.

### Watch Panel
- Glassy panel with border and strong shadow.
- Tabs show active state via copper underline.

### Forms & Inputs
- Inputs: translucent surface (`rgba(255,255,255,0.12)`) with soft focus glow.
- Buttons: pill style, copper gradient for primary actions.

## Motion
- Hover lift: `transform: translateY(-3px)` on cards.
- Use subtle opacity and transform transitions (0.2s).

## Implementation Notes
- Use CSS variables from `App.vue` for tokens (colors, fonts, radii, shadows).
- Avoid legacy `Roboto` usage; use the body and display fonts instead.
- Favor glass surfaces and borders over flat dark panels.
