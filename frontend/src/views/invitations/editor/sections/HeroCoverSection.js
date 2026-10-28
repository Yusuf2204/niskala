import React from 'react'
import PropTypes from 'prop-types'

const HeroCoverSection = ({ props = {}, isWeb = true }) => {
  const {
    title = 'The Wedding Of',
    primary_names = 'Rama & Shinta',
    date_text = 'Sabtu, 12 Desember 2026',
    quote = 'Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.',
    bg_image_url = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    open_button_text = 'Buka Undangan',
    guest_greeting_prefix = 'Kepada Yth. Bapak/Ibu/Saudara/i:',
  } = props

  return (
    <div
      className="position-relative text-center overflow-hidden d-flex flex-column justify-content-center align-items-center"
      style={{
        minHeight: isWeb ? '540px' : '480px',
        backgroundImage: `linear-gradient(rgba(52, 52, 47, 0.45), rgba(52, 52, 47, 0.65)), url(${bg_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#F1EDE5',
        padding: isWeb ? '4rem 2rem' : '2.5rem 1rem',
        borderRadius: isWeb ? '12px' : '0',
      }}
    >
      <div style={{ maxWidth: isWeb ? '720px' : '100%', zIndex: 2 }}>
        <p
          className="text-uppercase tracking-widest mb-2"
          style={{
            letterSpacing: '3px',
            fontSize: isWeb ? '0.95rem' : '0.8rem',
            color: '#D8C2A0',
          }}
        >
          {title}
        </p>
        <h1
          className="my-3 font-serif"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: isWeb ? '3.2rem' : '2.2rem',
            fontWeight: 700,
            color: '#FFFFFF',
            textShadow: '0 2px 10px rgba(0,0,0,0.35)',
            letterSpacing: '1px',
          }}
        >
          {primary_names}
        </h1>
        <div
          className="mx-auto my-3"
          style={{
            width: '80px',
            height: '2px',
            backgroundColor: '#A68B65',
          }}
        />
        <p
          className="mb-3 fst-italic"
          style={{
            fontSize: isWeb ? '1rem' : '0.85rem',
            color: 'rgba(241, 237, 229, 0.9)',
            maxWidth: '520px',
            margin: '0 auto',
          }}
        >
          &quot;{quote}&quot;
        </p>

        <div
          className="p-3 my-3 rounded-3"
          style={{
            backgroundColor: 'rgba(52, 52, 47, 0.4)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(166, 139, 101, 0.35)',
            display: 'inline-block',
          }}
        >
          <small
            className="d-block text-muted text-uppercase"
            style={{ color: '#D8C2A0', fontSize: '0.75rem' }}
          >
            {guest_greeting_prefix}
          </small>
          <span className="fw-bold" style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>
            Tamu Undangan
          </span>
        </div>

        <div className="mt-2">
          <p
            className="fw-semibold mb-3"
            style={{ color: '#F1EDE5', fontSize: isWeb ? '1.05rem' : '0.9rem' }}
          >
            {date_text}
          </p>
          <button
            type="button"
            className="btn px-4 py-2 rounded-pill shadow-sm"
            style={{
              backgroundColor: '#A68B65',
              color: '#FFFFFF',
              fontWeight: 600,
              border: 'none',
              letterSpacing: '0.5px',
            }}
          >
            ✉ {open_button_text}
          </button>
        </div>
      </div>
    </div>
  )
}

HeroCoverSection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
}

export default HeroCoverSection
