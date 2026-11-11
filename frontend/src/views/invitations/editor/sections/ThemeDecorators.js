import React from 'react'
import PropTypes from 'prop-types'
import { GununganEmblem, JavaneseDivider } from './Ornaments'
import { getStaggerStyle } from '../../../../utils/invitationTheme'

const CORNER_POSITIONS = [
  { key: 'tl', style: { top: 0, left: 0 }, transform: 'none' },
  { key: 'tr', style: { top: 0, right: 0 }, transform: 'scaleX(-1)' },
  { key: 'bl', style: { bottom: 0, left: 0 }, transform: 'scaleY(-1)' },
  { key: 'br', style: { bottom: 0, right: 0 }, transform: 'scale(-1, -1)' },
]

/**
 * Symmetrical corner scrollwork overlay for themed cards and sections.
 */
export const CornerOrnaments = ({
  cornerUrl = '',
  isWeb = true,
  variant = 'full',
  opacity = 0.75,
  size,
  offset = 10,
  animated = false,
}) => {
  if (!cornerUrl) return null

  const dimension = size || (isWeb ? 82 : 52)
  const corners = variant === 'top' ? CORNER_POSITIONS.slice(0, 2) : CORNER_POSITIONS

  return (
    <div
      aria-hidden="true"
      className={`inv-corners-layer ${animated ? 'inv-ornament-float' : ''}`}
      style={{
        position: 'absolute',
        inset: `${offset}px`,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      {corners.map((corner) => (
        <img
          key={corner.key}
          src={cornerUrl}
          alt=""
          loading="lazy"
          style={{
            position: 'absolute',
            ...corner.style,
            width: `${dimension}px`,
            height: `${dimension}px`,
            transform: corner.transform,
            opacity,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      ))}
    </div>
  )
}

CornerOrnaments.propTypes = {
  cornerUrl: PropTypes.string,
  isWeb: PropTypes.bool,
  variant: PropTypes.oneOf(['full', 'top']),
  opacity: PropTypes.number,
  size: PropTypes.number,
  offset: PropTypes.number,
  animated: PropTypes.bool,
}

/**
 * Tiled batik pattern background layer preserving high text readability.
 */
export const ThemeBatikOverlay = ({ patternUrl = '', isWeb = true, opacity = 0.45 }) => {
  if (!patternUrl) return null

  const tileSize = isWeb ? '120px 120px' : '92px 92px'

  return (
    <div
      aria-hidden="true"
      className="inv-batik-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("${patternUrl}")`,
        backgroundRepeat: 'repeat',
        backgroundSize: tileSize,
        opacity,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}

ThemeBatikOverlay.propTypes = {
  patternUrl: PropTypes.string,
  isWeb: PropTypes.bool,
  opacity: PropTypes.number,
}

/**
 * Consistent themed header block with eyebrow, serif heading, and Keraton divider.
 */
export const SectionHeaderOrnaments = ({
  eyebrow,
  title,
  subtitle,
  dividerUrl = '',
  isWeb = true,
  accentColor = 'var(--inv-primary, #8A6728)',
  titleColor = 'var(--inv-text, #2B1E16)',
  subtitleColor = 'var(--inv-muted, #6A5342)',
}) => {
  return (
    <div className="mb-4 position-relative" style={{ zIndex: 2 }}>
      {eyebrow && (
        <p
          className="text-uppercase fw-semibold mb-1 inv-stagger-item"
          style={{
            ...getStaggerStyle(0),
            color: accentColor,
            fontSize: isWeb ? '0.8rem' : '0.72rem',
            letterSpacing: '2.5px',
          }}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className="font-serif fw-bold mb-2 inv-stagger-item"
        style={{
          ...getStaggerStyle(1),
          fontFamily: 'var(--inv-font-heading, Georgia, serif)',
          color: titleColor,
          fontSize: isWeb ? '2.15rem' : '1.65rem',
        }}
      >
        {title}
      </h2>
      {dividerUrl ? (
        <div
          className="mx-auto my-2 inv-divider-wrap inv-divider-unfold"
          style={{ ...getStaggerStyle(2), maxWidth: isWeb ? '230px' : '170px' }}
        >
          <img src={dividerUrl} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </div>
      ) : (
        <div className="inv-divider-unfold" style={getStaggerStyle(2)}>
          <JavaneseDivider color={accentColor} width={isWeb ? '200px' : '150px'} />
        </div>
      )}
      {subtitle && (
        <p
          className="mx-auto mb-0 small inv-stagger-item"
          style={{
            ...getStaggerStyle(3),
            maxWidth: '620px',
            color: subtitleColor,
            lineHeight: 1.65,
            fontSize: isWeb ? '0.94rem' : '0.84rem',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

SectionHeaderOrnaments.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  dividerUrl: PropTypes.string,
  isWeb: PropTypes.bool,
  accentColor: PropTypes.string,
  titleColor: PropTypes.string,
  subtitleColor: PropTypes.string,
}

/**
 * Joglo arch portrait wrapper applying SVG frame overlay without obstructing faces.
 */
export const JogloPortraitFrame = ({ photoUrl, alt, frameUrl = '', isWeb = true }) => {
  if (!frameUrl) {
    return (
      <div
        className="mx-auto rounded-circle overflow-hidden shadow-sm mb-3"
        style={{
          width: isWeb ? '180px' : '144px',
          height: isWeb ? '180px' : '144px',
          border: '4px solid var(--inv-accent, #C5A059)',
        }}
      >
        <img
          src={photoUrl}
          alt={alt}
          loading="lazy"
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
        />
      </div>
    )
  }

  return (
    <div
      className="mx-auto position-relative mb-3 inv-joglo-portrait"
      style={{
        width: isWeb ? '210px' : '172px',
        height: isWeb ? '277px' : '227px',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '10.5%',
          right: '13%',
          bottom: '7.5%',
          left: '13%',
          borderRadius: '48% 48% 6px 6px / 34% 34% 6px 6px',
          overflow: 'hidden',
          backgroundColor: 'var(--inv-surface, #F3ECE0)',
          boxShadow: 'inset 0 2px 12px rgba(43, 30, 22, 0.16)',
        }}
      >
        <img
          src={photoUrl}
          alt={alt}
          loading="lazy"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
          }}
        />
      </div>
      <img
        src={frameUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 2,
          filter: 'drop-shadow(0 4px 10px rgba(74, 53, 37, 0.22))',
        }}
      />
    </div>
  )
}

JogloPortraitFrame.propTypes = {
  photoUrl: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  frameUrl: PropTypes.string,
  isWeb: PropTypes.bool,
}

/**
 * Shared theme preview banner showing MinIO SVG thumbnail with graceful fallback to swatch + emblem.
 */
export const ThemePreviewBanner = ({ theme, height = '160px', subtitle = '', badge = null }) => {
  const palette = theme?.default_config?.palette || {}
  const typography = theme?.default_config?.typography || {}
  const hasGunungan =
    theme?.slug === 'adat-jawa' || theme?.default_config?.assets?.ornament === 'gunungan'

  return (
    <div
      style={{
        height,
        background: palette.bg || palette.background || '#FAF6EE',
        borderBottom: '1px solid rgba(197, 160, 89, 0.3)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        color: palette.text || '#2B1E16',
        padding: '1rem',
        overflow: 'hidden',
      }}
    >
      {hasGunungan && (
        <div className="mb-2" style={{ position: 'relative', zIndex: 1 }}>
          <GununganEmblem
            width={38}
            height={46}
            color={palette.accent || palette.primary || '#C5A059'}
          />
        </div>
      )}
      <span
        style={{
          position: 'relative',
          zIndex: 1,
          fontFamily: typography.heading_font || typography.heading || "'Playfair Display', serif",
          fontSize: '1.3rem',
          fontWeight: 'bold',
          letterSpacing: '0.05em',
          color: palette.secondary || palette.text || '#4A3525',
        }}
      >
        {theme?.name}
      </span>
      {subtitle && (
        <span
          className="small mt-1 px-2 py-0.5 rounded-pill"
          style={{
            position: 'relative',
            zIndex: 1,
            fontSize: '0.72rem',
            backgroundColor: 'rgba(197, 160, 89, 0.18)',
            color: palette.secondary || palette.text || '#4A3525',
            fontWeight: 600,
          }}
        >
          {subtitle}
        </span>
      )}
      {theme?.thumbnail && (
        <img
          src={theme.thumbnail}
          alt={theme.name}
          loading="lazy"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 2,
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none'
          }}
        />
      )}
      {badge && (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3 }}>
          {badge}
        </div>
      )}
    </div>
  )
}

ThemePreviewBanner.propTypes = {
  theme: PropTypes.object,
  height: PropTypes.string,
  subtitle: PropTypes.string,
  badge: PropTypes.node,
}
