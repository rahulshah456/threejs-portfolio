import type { CSSProperties } from 'react';
import type { CSSInterface } from '../utils/interfaces';

// Base layout styles — applied inline via style prop.
// Only includes properties NOT overridden by @media breakpoints.
export const base: CSSInterface = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    position: 'relative',
    width: '100%',
    maxWidth: '100%',
    fontWeight: 300,
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  header: {
    display: 'flex',
    gap: '0.75em',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: '0.85em',
  },
  label: {
    fontWeight: 700,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    opacity: 0.5,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  tag: {
    borderRadius: '999px',
    cursor: 'default',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
  },
};

// Theme palettes — set as CSS custom properties on the card element so
// pseudo-class rules in index.css can reference them via var().
interface BentoThemePalette {
  cardBg: string;
  cardBorder: string;
  cardText: string;
  labelColor: string;
  tagBg: string;
  tagBorder: string;
  tagColor: string;
  tagBgHover: string;
  tagBorderHover: string;
  tagTextHover: string;
  cardHoverShadow: string;
  cardGlowShadow: string;
  glowAccentRgb: string;
}

export const darkTheme: BentoThemePalette = {
  cardBg: '#120f17',
  cardBorder: 'rgba(212, 160, 23, 0.12)',
  cardText: 'rgba(255, 255, 255, 0.82)',
  labelColor: 'rgba(212, 160, 23, 0.9)',
  tagBg: 'rgba(212, 160, 23, 0.07)',
  tagBorder: 'rgba(212, 160, 23, 0.22)',
  tagColor: 'rgba(255, 255, 255, 0.82)',
  tagBgHover: 'rgba(212, 160, 23, 0.18)',
  tagBorderHover: 'rgba(212, 160, 23, 0.55)',
  tagTextHover: '#fff',
  cardHoverShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
  cardGlowShadow: '0 4px 20px rgba(0, 0, 0, 0.4), 0 0 30px rgba(212, 160, 23, 0.15)',
  glowAccentRgb: '212, 160, 23',
};

export const lightTheme: BentoThemePalette = {
  cardBg: '#fdf8f5',
  cardBorder: 'rgba(155, 25, 10, 0.18)',
  cardText: 'rgba(30, 10, 5, 0.78)',
  labelColor: 'rgba(165, 30, 10, 0.88)',
  tagBg: 'rgba(195, 45, 20, 0.07)',
  tagBorder: 'rgba(155, 25, 10, 0.25)',
  tagColor: 'rgba(35, 10, 5, 0.72)',
  tagBgHover: 'rgba(195, 45, 20, 0.18)',
  tagBorderHover: 'rgba(155, 25, 10, 0.6)',
  tagTextHover: 'rgba(20, 5, 2, 0.92)',
  cardHoverShadow: '0 8px 25px rgba(155, 80, 60, 0.15)',
  cardGlowShadow: '0 4px 20px rgba(155, 25, 10, 0.1), 0 0 30px rgba(195, 45, 20, 0.12)',
  glowAccentRgb: '195, 45, 20',
};

// Helper — builds the full card inline style object from a theme palette.
// All CSS custom properties set here cascade to pseudo-elements and children.
export const buildCardStyle = (theme: BentoThemePalette, glowColor: string): CSSProperties =>
  ({
    ...base.card,
    '--card-bg': theme.cardBg,
    '--card-border': theme.cardBorder,
    '--card-text': theme.cardText,
    '--label-color': theme.labelColor,
    '--tag-bg': theme.tagBg,
    '--tag-border': theme.tagBorder,
    '--tag-color': theme.tagColor,
    '--tag-bg-hover': theme.tagBgHover,
    '--tag-border-hover': theme.tagBorderHover,
    '--tag-text-hover': theme.tagTextHover,
    '--glow-color': glowColor,
    '--glow-accent-rgb': theme.glowAccentRgb,
    '--card-hover-shadow': theme.cardHoverShadow,
    '--card-glow-shadow': theme.cardGlowShadow,
  }) as CSSProperties;
