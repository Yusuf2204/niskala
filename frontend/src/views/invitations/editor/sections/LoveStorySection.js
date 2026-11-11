import React from 'react'
import PropTypes from 'prop-types'
import { SectionHeaderOrnaments, ThemeBatikOverlay } from './ThemeDecorators'

const LoveStorySection = ({ props = {}, isWeb = true, theme = {} }) => {
  const {
    title = 'Kisah Kasih Kami',
    subtitle = 'Perjalanan Menuju Satu Ikatan Suci',
    stories = [],
  } = props

  const assets = theme?.assets || {}
  const dividerUrl = props.divider_url || assets.divider_url || ''
  const patternUrl =
    props.pattern_secondary_url ||
    props.pattern_url ||
    assets.pattern_secondary_url ||
    assets.pattern_url ||
    ''

  return (
    <div
      className="position-relative py-5 px-3 text-center inv-section-framed"
      style={{
        backgroundColor: 'var(--inv-surface, #F3ECE0)',
        color: 'var(--inv-text, #2B1E16)',
      }}
    >
      <ThemeBatikOverlay patternUrl={patternUrl} isWeb={isWeb} opacity={0.28} />

      <div className="container position-relative" style={{ maxWidth: isWeb ? '860px' : '100%', zIndex: 2 }}>
        <SectionHeaderOrnaments
          eyebrow="Cerita Cinta"
          title={title}
          subtitle={subtitle}
          dividerUrl={dividerUrl}
          isWeb={isWeb}
        />

        {/* Timeline Stories */}
        <div
          className={`d-flex ${isWeb ? 'flex-row' : 'flex-column'} justify-content-center align-items-stretch gap-3 mt-4`}
        >
          {stories.map((story, idx) => (
            <div
              key={idx}
              className="p-4 rounded-3 shadow-sm flex-grow-1 text-center inv-card-framed"
              style={{
                backgroundColor: 'var(--inv-card, #FFFDF9)',
                border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.35))',
                maxWidth: isWeb ? '280px' : '100%',
              }}
            >
              <span
                className="badge px-3 py-1 mb-2 rounded-pill"
                style={{
                  backgroundColor: 'var(--inv-dark-bg, #241B15)',
                  color: '#E7D4B5',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                {story.year}
              </span>
              <h5
                className="font-serif fw-bold my-2"
                style={{
                  fontFamily: "var(--inv-font-heading, 'Playfair Display', Georgia, serif)",
                  color: 'var(--inv-text, #2B1E16)',
                }}
              >
                {story.title}
              </h5>
              <p className="small mb-0" style={{ color: 'var(--inv-muted, #6A5342)', lineHeight: 1.6 }}>
                {story.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

LoveStorySection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
  theme: PropTypes.object,
}

export default LoveStorySection

