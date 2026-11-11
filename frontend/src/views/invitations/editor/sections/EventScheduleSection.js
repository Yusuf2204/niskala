import React from 'react'
import PropTypes from 'prop-types'
import { CornerOrnaments, SectionHeaderOrnaments, ThemeBatikOverlay } from './ThemeDecorators'

const EventScheduleSection = ({ props = {}, isWeb = true, theme = {} }) => {
  const {
    title = 'Rangkaian Acara',
    subtitle = 'Waktu & Tempat Pelaksanaan',
    events = [],
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
      <ThemeBatikOverlay patternUrl={patternUrl} isWeb={isWeb} opacity={0.26} />
      <CornerOrnaments
        cornerUrl={cornerUrl}
        isWeb={isWeb}
        variant="top"
        opacity={0.58}
        size={isWeb ? 76 : 48}
        offset={isWeb ? 12 : 8}
        animated={isOrnamentAnimated}
      />

      <div className="container position-relative" style={{ maxWidth: isWeb ? '940px' : '100%', zIndex: 2 }}>
        <SectionHeaderOrnaments
          eyebrow="Informasi Acara"
          title={title}
          subtitle={subtitle}
          dividerUrl={dividerUrl}
          isWeb={isWeb}
        />

        {/* Grid of Events */}
        <div
          className={`d-flex ${isWeb ? 'flex-row' : 'flex-column'} justify-content-center align-items-stretch gap-3 mt-4`}
        >
          {events.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="p-4 rounded-3 shadow-sm flex-grow-1 text-center inv-card-framed"
              style={{
                backgroundColor: 'var(--inv-card, #FFFDF9)',
                border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.35))',
                maxWidth: isWeb ? '420px' : '100%',
              }}
            >
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'rgba(197, 160, 89, 0.16)',
                  color: 'var(--inv-primary, #8A6728)',
                  border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.35))',
                  fontSize: '1.2rem',
                }}
              >
                ✦
              </div>
              <h4
                className="font-serif fw-bold mb-2"
                style={{
                  fontFamily: "var(--inv-font-heading, 'Playfair Display', Georgia, serif)",
                  color: 'var(--inv-text, #2B1E16)',
                }}
              >
                {evt.name}
              </h4>
              <div
                className="mx-auto my-2"
                style={{ width: '44px', height: '1.5px', backgroundColor: 'var(--inv-accent, #C5A059)' }}
              />
              <p className="fw-semibold mb-1" style={{ color: 'var(--inv-primary, #8A6728)', fontSize: '0.9rem' }}>
                {evt.date}
              </p>
              <p className="small fw-medium mb-3" style={{ color: 'var(--inv-text, #2B1E16)' }}>
                {evt.time}
              </p>
              <h6 className="fw-bold mb-1" style={{ color: 'var(--inv-text, #2B1E16)' }}>
                {evt.location}
              </h6>
              <p className="small mb-0" style={{ color: 'var(--inv-muted, #6A5342)' }}>
                {evt.address}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

EventScheduleSection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
  theme: PropTypes.object,
}

export default EventScheduleSection

