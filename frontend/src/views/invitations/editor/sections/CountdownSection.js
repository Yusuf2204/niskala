import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { SectionHeaderOrnaments, ThemeBatikOverlay } from './ThemeDecorators'

const CountdownSection = ({ props = {}, isWeb = true, theme = {} }) => {
  const {
    title = 'Menghitung Hari Bahagia',
    target_date = '2026-12-12T09:00:00',
    description = 'Tiada yang lebih membahagiakan selain kehadiran Anda di hari istimewa kami.',
  } = props

  const [timeLeft, setTimeLeft] = useState({
    days: 45,
    hours: 12,
    minutes: 30,
    seconds: 15,
  })

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(target_date).getTime() - new Date().getTime()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        })
      }
    }

    calculateTime()
    const timer = setInterval(calculateTime, 1000)
    return () => clearInterval(timer)
  }, [target_date])

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

      <div className="container position-relative" style={{ maxWidth: isWeb ? '800px' : '100%', zIndex: 2 }}>
        <SectionHeaderOrnaments
          eyebrow="Save The Date"
          title={title}
          subtitle={description}
          dividerUrl={dividerUrl}
          isWeb={isWeb}
        />

        {/* 4 Box Countdown */}
        <div className="d-flex justify-content-center align-items-center gap-2 gap-md-3 mt-4">
          {[
            { label: 'Hari', value: timeLeft.days },
            { label: 'Jam', value: timeLeft.hours },
            { label: 'Menit', value: timeLeft.minutes },
            { label: 'Detik', value: timeLeft.seconds },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-3 shadow-sm text-center inv-card-framed"
              style={{
                backgroundColor: 'var(--inv-card, #FFFDF9)',
                border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.42))',
                minWidth: isWeb ? '104px' : '70px',
              }}
            >
              <div
                className="fw-bold font-serif"
                style={{
                  fontFamily: "var(--inv-font-heading, 'Playfair Display', Georgia, serif)",
                  fontSize: isWeb ? '2rem' : '1.4rem',
                  color: 'var(--inv-text, #2B1E16)',
                  lineHeight: '1.2',
                }}
              >
                {String(item.value).padStart(2, '0')}
              </div>
              <small
                className="text-uppercase fw-semibold"
                style={{ fontSize: '0.7rem', color: 'var(--inv-primary, #8A6728)', letterSpacing: '1px' }}
              >
                {item.label}
              </small>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

CountdownSection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
  theme: PropTypes.object,
}

export default CountdownSection

