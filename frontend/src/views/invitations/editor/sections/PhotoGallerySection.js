import React from 'react'
import PropTypes from 'prop-types'
import { CornerOrnaments, SectionHeaderOrnaments, ThemeBatikOverlay } from './ThemeDecorators'
import { getStaggerStyle } from '../../../../utils/invitationTheme'

const PhotoGallerySection = ({ props = {}, isWeb = true, onImageClick, theme = {} }) => {
  const {
    title = 'Momen Bahagia',
    subtitle = 'Galeri Foto Kenangan & Prewedding',
    images = [],
  } = props

  const assets = theme?.assets || {}
  const isOrnamentAnimated = theme?.animation?.ornament_motion !== false
  const dividerUrl = props.divider_url || assets.divider_url || ''
  const cornerUrl = props.corner_url || assets.corner_url || ''
  const patternUrl = props.pattern_url || assets.pattern_url || ''

  return (
    <div
      className="position-relative py-5 px-3 text-center inv-section-framed"
      style={{
        backgroundColor: 'var(--inv-bg, #FAF6EE)',
        color: 'var(--inv-text, #2B1E16)',
      }}
    >
      <ThemeBatikOverlay patternUrl={patternUrl} isWeb={isWeb} opacity={0.22} />
      <CornerOrnaments
        cornerUrl={cornerUrl}
        isWeb={isWeb}
        variant="top"
        opacity={0.55}
        size={isWeb ? 74 : 46}
        offset={isWeb ? 12 : 8}
        animated={isOrnamentAnimated}
      />

      <div className="container position-relative" style={{ maxWidth: isWeb ? '960px' : '100%', zIndex: 2 }}>
        <SectionHeaderOrnaments
          eyebrow="Dokumentasi"
          title={title}
          subtitle={subtitle}
          dividerUrl={dividerUrl}
          isWeb={isWeb}
        />

        {/* Gallery Grid */}
        <div
          className="row g-3 justify-content-center mt-2"
          style={{
            display: 'grid',
            gridTemplateColumns: isWeb ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          {images.map((imgUrl, idx) => (
            <div
              key={idx}
              className="rounded-3 overflow-hidden shadow-sm position-relative inv-gallery-tile inv-zoom-tile"
              style={{
                ...getStaggerStyle(idx + 1, 75, 10),
                height: isWeb ? '220px' : '160px',
                border: '2px solid var(--inv-border, rgba(197, 160, 89, 0.4))',
                cursor: onImageClick ? 'pointer' : 'default',
              }}
              onClick={() => onImageClick && onImageClick(imgUrl)}
              title={onImageClick ? 'Klik untuk memperbesar' : undefined}
            >
              <img
                src={imgUrl}
                alt={`Galeri ${idx + 1}`}
                loading="lazy"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.35s ease',
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

PhotoGallerySection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
  onImageClick: PropTypes.func,
  theme: PropTypes.object,
}

export default PhotoGallerySection

