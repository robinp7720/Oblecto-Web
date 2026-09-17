# Oblecto Web UI Design Guide

## Direction

A cinematic, library-first browsing experience inspired by streaming services. Keep the Oblecto identity: original cloud/play mark and turquoise wordmark, a near-black canvas, prominent artwork, clear playback actions, and compact horizontal media rows. Avoid dashboard statistics, glass panels, ornamental gradients, and oversized rounded containers in browsing views.

## Tokens

Use the CSS variables in `src/App.vue`:

- Canvas: `--color-bg-1` (`#141414`).
- Surfaces: `--color-surface` (`#1c1c1c`) and `--color-surface-card` (`#202020`).
- Text: `--color-text` (`#f5f5f1`), `--color-text-muted` (`#bcbcbc`), and `--color-text-faint` (`#999999`).
- Brand colors, sampled from `images/logomark.png`: turquoise `#68e0dc`, deep blue `#096f93`, orange `#f15a24`, coral `#ff734d`.
- Accent: `--color-accent` (brand orange) for progress and selected states; turquoise for navigation and labels; coral with dark text for primary playback actions.
- Typography: Arial / Helvetica / system sans-serif for body and display text. Use bold weight and tight tracking for hero titles.
- Corners: 4px controls and artwork, 6px panels, 8px dialogs.
- Page gutters: `--page-gutter`, responsive from 20px to 80px.

## Browsing

- Compact, sticky top navigation; account menu holds settings, playback device selection, and sign out.
- Home features library artwork with dark readability gradients. Use a coral primary Play button and a gray More Info button.
- `MediaShelf` provides horizontal scroll snapping, touch scrolling, keyboard arrows, and previous/next controls with disabled boundary states.
- Movies and episodes use landscape artwork in shelves; shows retain their posters. Library grids retain poster cards; search results use the same horizontal shelves.
- Missing movie fanart falls back to the poster, then a title tile. Never fabricate catalog entries.
- Loading, error/retry, and empty-library states remain part of the home experience.

## Accessibility and motion

- Give all search fields and icon controls accessible names.
- Keep playback buttons separate from details links.
- Reveal card actions on hover, keyboard focus, and touch devices.
- Use visible keyboard focus, a skip-to-content link, and descriptive row controls.
- Respect reduced motion for transitions and row scrolling.
- Keep mobile navigation scrollable and media content within the viewport.

## Other screens

Carry the same neutral surfaces, typography, and Oblecto brand accents through sign-in, discovery, libraries, settings, and legacy detail dialogs using shared tokens. Keep user-facing copy focused on finding and watching their collection.

## Detail pages

Movie, show, and episode pages share `MediaDetailHero` and `details.sass`: artwork fades into the app canvas, titles and synopsis sit directly on the background, and playback remains visible on touch devices. Metadata and files use plain sections beneath the hero. TV shows use a season selector and episode rows with playback, details links, options, and live progress. Missing artwork must never block the title or actions. Detail requests show loading, empty, and retry states and discard stale responses after navigation.
