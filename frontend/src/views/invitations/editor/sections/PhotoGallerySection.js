import React from 'react'
import PropTypes from 'prop-types'

const PhotoGallerySection = ({ props = {}, isWeb = true }) => {
  const {
    title = 'Momen Bahagia',
    subtitle = 'Galeri Foto Kenangan & Prewedding',
    images = [],
  } = props

  return (
    <div
      className="py-5 px-3 text-center"
      style={{
        backgroundColor: '#FAF8F5',
        color: '#34342F',
      }}
    >
      <div className="container" style={{ maxWidth: isWeb ? '960px' : '100%' }}>
        <p
          className="text-uppercase tracking-wider fw-semibold mb-1"
          style={{ color: '#A68B65', fontSize: '0.85rem', letterSpacing: '2px' }}
        >
          Dokumentasi
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

        {/* Gallery Grid */}
        <div
          className="row g-3 justify-content-center"
          style={{
            display: 'grid',
            gridTemplateColumns: isWeb ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
            gap: '12px',
          }}
        >
          {images.map((imgUrl, idx) => (
            <div
              key={idx}
              className="rounded-3 overflow-hidden shadow-sm position-relative"
              style={{
                height: isWeb ? '220px' : '160px',
                border: '2px solid rgba(166, 139, 101, 0.25)',
              }}
            >
              <img
                src={imgUrl}
                alt={`Galeri ${idx + 1}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  transition: 'transform 0.3s ease',
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
}

export default PhotoGallerySection
