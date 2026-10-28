import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const CountdownSection = ({ props = {}, isWeb = true }) => {
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

  return (
    <div
      className="py-5 px-3 text-center"
      style={{
        backgroundColor: '#F1EDE5',
        color: '#34342F',
      }}
    >
      <div className="container" style={{ maxWidth: isWeb ? '800px' : '100%' }}>
        <p
          className="text-uppercase tracking-wider fw-semibold mb-1"
          style={{ color: '#A68B65', fontSize: '0.85rem', letterSpacing: '2px' }}
        >
          Save The Date
        </p>
        <h2
          className="font-serif mb-2"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: '#34342F',
            fontSize: isWeb ? '2.2rem' : '1.7rem',
          }}
        >
          {title}
        </h2>
        <p className="text-muted mb-4 small">{description}</p>

        {/* 4 Box Countdown */}
        <div className="d-flex justify-content-center align-items-center gap-2 gap-md-3">
          {[
            { label: 'Hari', value: timeLeft.days },
            { label: 'Jam', value: timeLeft.hours },
            { label: 'Menit', value: timeLeft.minutes },
            { label: 'Detik', value: timeLeft.seconds },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-3 rounded-3 shadow-sm text-center"
              style={{
                backgroundColor: '#FAF8F5',
                border: '1px solid rgba(166, 139, 101, 0.4)',
                minWidth: isWeb ? '100px' : '70px',
              }}
            >
              <div
                className="fw-bold font-serif"
                style={{
                  fontSize: isWeb ? '2rem' : '1.4rem',
                  color: '#34342F',
                  lineHeight: '1.2',
                }}
              >
                {String(item.value).padStart(2, '0')}
              </div>
              <small
                className="text-uppercase fw-semibold"
                style={{ fontSize: '0.7rem', color: '#A68B65', letterSpacing: '1px' }}
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
}

export default CountdownSection

