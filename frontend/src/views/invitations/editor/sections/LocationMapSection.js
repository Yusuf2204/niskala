import React from 'react'
import PropTypes from 'prop-types'
import { SectionHeaderOrnaments, ThemeBatikOverlay } from './ThemeDecorators'
import { getStaggerStyle } from '../../../../utils/invitationTheme'

const LocationMapSection = ({ props = {}, isWeb = true, theme = {} }) => {
  const {
    title = 'Lokasi & Peta Acara',
    venue_name = 'Grand Ballroom Hotel Mulia',
    address = 'Jl. Asia Afrika, Senayan, Jakarta Pusat, DKI Jakarta',
    maps_embed_url = 'https://maps.google.com/maps?q=Hotel+Mulia+Senayan+Jakarta&t=&z=15&ie=UTF8&iwloc=&output=embed',
    maps_direction_url = 'https://maps.google.com/?q=Hotel+Mulia+Senayan+Jakarta',
    button_label = 'Buka di Google Maps',
  } = props

  const assets = theme?.assets || {}
  const dividerUrl = props.divider_url || assets.divider_url || ''
  const patternUrl = props.pattern_url || assets.pattern_url || ''

  return (
    <div
      className="position-relative py-5 px-3 text-center inv-section-framed"
      style={{
        backgroundColor: 'var(--inv-bg, #FAF6EE)',
        color: 'var(--inv-text, #2B1E16)',
      }}
    >
      <ThemeBatikOverlay patternUrl={patternUrl} isWeb={isWeb} opacity={0.2} />

      <div className="container position-relative" style={{ maxWidth: isWeb ? '840px' : '100%', zIndex: 2 }}>
        <SectionHeaderOrnaments
          eyebrow="Penunjuk Arah"
          title={title}
          dividerUrl={dividerUrl}
          isWeb={isWeb}
        />

        <div className="inv-stagger-item" style={getStaggerStyle(2, 95)}>
          <h5 className="fw-bold mb-1" style={{ color: 'var(--inv-text, #2B1E16)' }}>
            {venue_name}
          </h5>
          <p className="small mb-4" style={{ color: 'var(--inv-muted, #6A5342)' }}>
            {address}
          </p>
        </div>

        {/* Embedded Map Frame */}
        <div
          className="rounded-3 overflow-hidden shadow-sm mb-4 inv-stagger-item"
          style={{
            ...getStaggerStyle(3, 95),
            height: isWeb ? '340px' : '260px',
            border: '2px solid var(--inv-border, rgba(197, 160, 89, 0.45))',
            backgroundColor: 'var(--inv-card, #FFFDF9)',
          }}
        >
          <iframe
            src={maps_embed_url}
            title={title}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="inv-stagger-item" style={getStaggerStyle(4, 95)}>
          <a
            href={maps_direction_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn px-4 py-2 rounded-pill shadow-sm"
            style={{
              backgroundColor: 'var(--inv-dark-bg, #241B15)',
              color: '#FAF6EE',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: '1px solid var(--inv-accent, #C5A059)',
            }}
          >
            📍 {button_label}
          </a>
        </div>
      </div>
    </div>
  )
}

LocationMapSection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
  theme: PropTypes.object,
}

export default LocationMapSection

