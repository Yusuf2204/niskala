import React from 'react'
import PropTypes from 'prop-types'

const LoveStorySection = ({ props = {}, isWeb = true }) => {
  const {
    title = 'Kisah Kasih Kami',
    subtitle = 'Perjalanan Menuju Satu Ikatan Suci',
    stories = [],
  } = props

  return (
    <div
      className="py-5 px-3 text-center"
      style={{
        backgroundColor: '#F1EDE5',
        color: '#34342F',
      }}
    >
      <div className="container" style={{ maxWidth: isWeb ? '860px' : '100%' }}>
        <p
          className="text-uppercase tracking-wider fw-semibold mb-1"
          style={{ color: '#A68B65', fontSize: '0.85rem', letterSpacing: '2px' }}
        >
          Cerita Cinta
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

        {/* Timeline Stories */}
        <div
          className={`d-flex ${isWeb ? 'flex-row' : 'flex-column'} justify-content-center align-items-stretch gap-3`}
        >
          {stories.map((story, idx) => (
            <div
              key={idx}
              className="p-4 rounded-3 shadow-sm flex-grow-1 text-center"
              style={{
                backgroundColor: '#FAF8F5',
                border: '1px solid rgba(166, 139, 101, 0.3)',
                maxWidth: isWeb ? '280px' : '100%',
              }}
            >
              <span
                className="badge px-3 py-1 mb-2 rounded-pill"
                style={{
                  backgroundColor: '#34342F',
                  color: '#D8C2A0',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              >
                {story.year}
              </span>
              <h5
                className="font-serif fw-bold my-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#34342F' }}
              >
                {story.title}
              </h5>
              <p className="text-muted small mb-0">{story.text}</p>
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
}

export default LoveStorySection

