# Oblecto Web UI Design Guide

This guide documents the design tokens and styling patterns observed in the Oblecto Web application. Use this as a reference when creating new components or pages to ensure visual consistency.

## Colors

### Backgrounds
- **Global App Gradient:**
  - Start: `#696060` (0%)
  - Middle: `#55535b` (36%)
  - End: `#28343b` (100%)
  - Usage: `App.vue` background.

- **Panel/Card Background:**
  - Base: `#696060`
  - Usage: Used for content containers like movie info cards and modals.

- **Navigation Bar:**
  - Base: `color.adjust(#696060, $lightness: -20%)` (approx `#544d4d`)
  - Usage: Top navigation bar background.

### Text
- **Primary Text:** `#eee` (approx white)
- **Secondary/Muted Text:** `rgba(250, 240, 240, 0.6)`
- **Paragraph Text:** `rgba(250, 240, 240, 0.9)`

### Interface Elements
- **Borders/Separators:** `rgba(0,0,0,0.5)` (used for `<hr>`)
- **Buttons (General):**
  - Background: `rgba(0,0,0,0.5)`
  - Border: `rgba(0,0,0,0.8) 1px solid`
  - Text: `rgba(255,255,255,0.5)`
  - Hover: `rgba(0,0,0,0.9)`

## Typography

- **Font Family:** `Roboto`, sans-serif (imported in `index.html` and referenced in `NavBar.vue`).
- **Headings:**
  - `h2`: Font size `1.2em`, margin `0 0 5px`.
- **Body:** Standard font size `1em`.

## Layout & Spacing

- **Border Radius:** `3px` (consistently used for buttons, cards, inputs).
- **Shadows:**
  - Standard Shadow: `0 2px 5px 2px rgba(darken(#696060, 20), 0.75)`
  - Used on: Info cards, modals, navigation bar.

## Components

### Cards (`.info`, `.movie`)
- Background: `#696060`
- Border Radius: `3px`
- Box Shadow: Standard Shadow.
- Padding: `20px` (content), `40px` (bottom).

### Modals (`.v--modal`)
- Inherit the global app gradient background.

### Input Fields
- Background: `rgba(255, 255, 255, 0.3)`
- Border Radius: `3px`
- Border: `none`
- Padding: `5px`

## Settings Page Specifics (Target)
To align the settings page, we should:
1. Use the **Standard Shadow** and **Border Radius** for the settings sidebar and content cards.
2. Use the **Global Gradient** or **Panel Background** (`#696060`) instead of the flat dark grays (`#303030`).
3. Match button styles to the semi-transparent dark style found elsewhere.
