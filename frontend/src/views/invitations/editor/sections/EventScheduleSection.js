import React from 'react'
import PropTypes from 'prop-types'

const EventScheduleSection = ({ props = {}, isWeb = true }) => {
  const {
    title = 'Rangkaian Acara',
    subtitle = 'Waktu & Tempat Pelaksanaan',
    events = [],
  } = props

  return (
    <div
      className="py-5 px-3 text-center"
      style={{
        backgroundColor: '#FAF8F5',
        color: '#34342F',
      }}
    >
      <div className="container" style={{ maxWidth: isWeb ? '940px' : '100%' }}>
        <p
          className="text-uppercase tracking-wider fw-semibold mb-1"
          style={{ color: '#A68B65', fontSize: '0.85rem', letterSpacing: '2px' }}
        >
          Informasi Acara
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
        <p className="text-muted mb-4 small">{subtitle}</p>

        {/* Grid of Events */}
        <div
          className={`d-flex ${isWeb ? 'flex-row' : 'flex-column'} justify-content-center align-items-stretch gap-3`}
        >
          {events.map((evt, idx) => (
            <div
              key={evt.id || idx}
              className="p-4 rounded-3 shadow-sm flex-grow-1 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(166, 139, 101, 0.3)',
                maxWidth: isWeb ? '420px' : '100%',
              }}
            >
              <div
                className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'rgba(166, 139, 101, 0.15)',
                  color: '#A68B65',
                  fontSize: '1.2rem',
                }}
              >
                ✦
              </div>
              <h4
                className="font-serif fw-bold mb-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#34342F' }}
              >
                {evt.name}
              </h4>
              <div
                className="mx-auto my-2"
                style={{ width: '40px', height: '1.5px', backgroundColor: '#A68B65' }}
              />
              <p className="fw-semibold mb-1" style={{ color: '#A68B65', fontSize: '0.9rem' }}>
                {evt.date}
              </p>
              <p className="small fw-medium mb-3" style={{ color: '#34342F' }}>{evt.time}</p>
              <h6 className="fw-bold mb-1" style={{ color: '#34342F' }}>{evt.location}</h6>
              <p className="small mb-0" style={{ color: 'rgba(52, 52, 47, 0.7)' }}>{evt.address}</p>
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
}

export default EventScheduleSection

