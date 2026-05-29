// tokens.js — design tokens (spacing · radius · typography).
//
// Single source of truth that replaces the ad-hoc magic numbers previously
// scattered through inline styles. The same scale is mirrored as CSS custom
// properties in src/index.css (--space-*, --radius-*, --text-*) so both the
// JS layer and any future CSS can speak the same language.
//
// Half-step font sizes that existed in the prototype (13.5, 14.5, 12.5 …) were
// rationalised to the nearest integer step — a sub-pixel change that improves
// crispness while removing arbitrary values.

// SPACING — 4px base grid (Tailwind-style). Unit n → n*4px, with .5 half-steps.
// Use for padding, margin and gap.
export const space = {
  0: 0,
  px: 1,
  0.5: 2,
  1: 4,
  1.5: 6,
  2: 8,
  2.5: 10,
  3: 12,
  3.5: 14,
  4: 16,
  4.5: 18,
  5: 20,
  5.5: 22,
  6: 24,
  7: 28,
  8: 32,
  10: 40,
};

// RADIUS — corner rounding scale.
export const radius = {
  sm: 6,
  md: 8,
  lg: 11,
  xl: 13,
  '2xl': 16,
  pill: 999,
};

// FONT SIZE — px.
export const font = {
  xs: 12,    // micro labels, captions
  sm: 13,    // secondary text
  base: 14,  // body
  md: 15,    // emphasised body / inputs
  lg: 16,    // large controls
  xl: 17,    // section titles
  '2xl': 18, // sheet / dialog titles
  '3xl': 24, // large figures
  hero: 42,  // hero balance
};

// FONT WEIGHT
export const weight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};
