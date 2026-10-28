import React from 'react'
import PropTypes from 'prop-types'

const LocationMapSection = ({ props = {}, isWeb = true }) => {
  const {
    title = 'Lokasi & Peta Acara',
    venue_name = 'Grand Ballroom Hotel Mulia',
    address = 'Jl. Asia Afrika, Senayan, Jakarta Pusat, DKI Jakarta',
    maps_embed_url = 'https://maps.google.com/maps?q=Hotel+Mulia+Senayan+Jakarta&t=&z=15&ie=UTF8&iwloc=&output=embed',
    maps_direction_url = 'https://maps.google.com/?q=Hotel+Mulia+Senayan+Jakarta',
    button_label = 'Buka di Google Maps',
  } = props

  return (
    <div
      className="py-5 px-3 text-center"
      style={{
        backgroundColor: '#F1EDE5',
        color: '#34342F',
      }}
    >
      <div className="container" style={{ maxWidth: isWeb ? '840px' : '100%' }}>
        <p
          className="text-uppercase tracking-wider fw-semibold mb-1"
          style={{ color: '#A68B65', fontSize: '0.85rem', letterSpacing: '2px' }}
        >
          Penunjuk Arah
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
        <h5 className="fw-bold mb-1" style={{ color: '#34342F' }}>{venue_name}</h5>
        <p className="small mb-4" style={{ color: 'rgba(52, 52, 47, 0.7)' }}>{address}</p>

        {/* Embedded Map Frame */}
        <div
          className="rounded-3 overflow-hidden shadow-sm mb-3"
          style={{
            height: isWeb ? '340px' : '260px',
            border: '2px solid rgba(166, 139, 101, 0.4)',
            backgroundColor: '#FAF8F5',
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

        <div>
          <a
            href={maps_direction_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn px-4 py-2 rounded-pill shadow-sm"
            style={{
              backgroundColor: '#34342F',
              color: '#F1EDE5',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
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
}

export default LocationMapSection

