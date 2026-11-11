export const DEFAULT_INVITATION_PALETTE = {
  bg: '#FAF8F5',
  surface: '#F1EDE5',
  card: '#FFFFFF',
  primary: '#8A6728',
  secondary: '#34342F',
  text: '#34342F',
  muted: 'rgba(52, 52, 47, 0.7)',
  accent: '#C5A059',
  dark_bg: '#242420',
  border: 'rgba(166, 139, 101, 0.35)',
}

export const DEFAULT_INVITATION_TYPOGRAPHY = {
  heading: "'Playfair Display', Georgia, serif",
  body: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
}

export const DEFAULT_INVITATION_ANIMATION = {
  preset: 'subtle-fade',
  gate_style: 'slide-up',
  section_reveal: 'fade-up',
  ornament_motion: false,
}

const normalizeThemeStyle = (rawStyle, themeSlug) => {
  const candidate = String(rawStyle || themeSlug || 'standard')
    .trim()
    .toLowerCase()
  if (candidate === 'jawa') return 'adat-jawa'
  return candidate || 'standard'
}

const sanitizeCssUrl = (url) => {
  if (!url || typeof url !== 'string') return ''
  return url.replace(/["'()\\\r\n]/g, '')
}

/**
 * Resolve normalized visual configuration by merging theme defaults and invitation settings.
 */
export const resolveInvitationTheme = (invitation) => {
  const themeConfig = invitation?.theme?.default_config || {}
  const settings = invitation?.content?.settings || {}

  const rawPalette = {
    ...(themeConfig.palette || {}),
    ...(settings.palette || settings.colors || {}),
  }

  const rawTypography = {
    ...(themeConfig.typography || {}),
    ...(settings.typography || {}),
  }

  const assets = {
    ...(themeConfig.assets || {}),
    ...(settings.assets || {}),
  }

  const animation = {
    ...DEFAULT_INVITATION_ANIMATION,
    ...(themeConfig.animation || {}),
    ...(settings.animation || {}),
  }

  const themeStyle = normalizeThemeStyle(
    settings.theme_style || themeConfig.theme_style,
    invitation?.theme?.slug,
  )

  const palette = {
    bg: rawPalette.bg || rawPalette.background || DEFAULT_INVITATION_PALETTE.bg,
    surface: rawPalette.surface || DEFAULT_INVITATION_PALETTE.surface,
    card: rawPalette.card || DEFAULT_INVITATION_PALETTE.card,
    primary: rawPalette.primary || DEFAULT_INVITATION_PALETTE.primary,
    secondary: rawPalette.secondary || DEFAULT_INVITATION_PALETTE.secondary,
    text: rawPalette.text || DEFAULT_INVITATION_PALETTE.text,
    muted: rawPalette.muted || DEFAULT_INVITATION_PALETTE.muted,
    accent: rawPalette.accent || DEFAULT_INVITATION_PALETTE.accent,
    dark_bg: rawPalette.dark_bg || DEFAULT_INVITATION_PALETTE.dark_bg,
    border: rawPalette.border || DEFAULT_INVITATION_PALETTE.border,
  }

  const typography = {
    heading: rawTypography.heading || rawTypography.heading_font || DEFAULT_INVITATION_TYPOGRAPHY.heading,
    body: rawTypography.body || rawTypography.body_font || DEFAULT_INVITATION_TYPOGRAPHY.body,
  }

  return {
    slug: invitation?.theme?.slug || '',
    themeStyle,
    isJavanese: themeStyle === 'adat-jawa',
    palette,
    typography,
    assets,
    animation,
  }
}

/**
 * Build CSS custom properties for .public-invitation-root and .invitation-canvas-isolated.
 */
export const buildInvitationCssVars = (resolvedTheme) => {
  if (!resolvedTheme) return undefined
  const { palette = {}, typography = {}, assets = {} } = resolvedTheme

  const patternUrl = sanitizeCssUrl(assets.pattern_url)
  const patternSecondaryUrl = sanitizeCssUrl(assets.pattern_secondary_url || assets.pattern_url)

  return {
    '--inv-bg': palette.bg,
    '--inv-surface': palette.surface,
    '--inv-card': palette.card,
    '--inv-primary': palette.primary,
    '--inv-secondary': palette.secondary,
    '--inv-text': palette.text,
    '--inv-muted': palette.muted,
    '--inv-accent': palette.accent,
    '--inv-dark-bg': palette.dark_bg,
    '--inv-border': palette.border,
    '--inv-font-heading': typography.heading,
    '--inv-font-body': typography.body,
    '--inv-pattern-url': patternUrl ? `url("${patternUrl}")` : 'none',
    '--inv-pattern-secondary-url': patternSecondaryUrl ? `url("${patternSecondaryUrl}")` : 'none',
  }
}

export const SECTION_SLIDE_EFFECTS = {
  HeroCover: 'hero-handoff',
  CoupleProfile: 'converge-split',
  CountdownTimer: 'stagger-rise',
  EventSchedule: 'card-elevate',
  TraditionAccordion: 'fold-reveal',
  AccordionSection: 'fold-reveal',
  LocationMap: 'editorial-rise',
  LoveStory: 'stagger-rise',
  PhotoGallery: 'zoom-gallery',
  GiftRegistry: 'card-elevate',
  RsvpSection: 'editorial-rise',
  RsvpForm: 'editorial-rise',
  FooterSection: 'editorial-rise',
}

/**
 * Resolve GPU-composited slide reveal choreography variant for a given section type.
 */
export const getSlideEffectForSection = (sectionType, fallback = 'editorial-rise') =>
  SECTION_SLIDE_EFFECTS[sectionType] || fallback

/**
 * Build bounded inline CSS custom property for sequential child stagger delays.
 */
export const getStaggerStyle = (index = 0, stepMs = 85, maxSteps = 8) => ({
  '--inv-stagger-i': Math.min(Math.max(Number(index) || 0, 0), maxSteps),
  '--inv-stagger-step': `${stepMs}ms`,
})
