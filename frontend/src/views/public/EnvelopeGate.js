import React from 'react'
import PropTypes from 'prop-types'

const EnvelopeGate = ({ isOpen, onOpen, invitation, guestName }) => {
  // Find HeroCover props if available
  const sections = invitation?.content?.sections_data || []
  const heroSection = sections.find((s) => s.type === 'HeroCover')
  const heroProps = heroSection?.props || {}

  const bgImage =
    heroProps.bg_image_url ||
    'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'

  const coupleNames = heroProps.primary_names || invitation?.title || 'Rama & Shinta'
  const dateText = heroProps.date_text || 'Sabtu, 12 Desember 2026'

  return (
    <div
      className={`envelope-gate ${isOpen ? 'open' : ''}`}
      style={{
        backgroundImage: `linear-gradient(rgba(36, 36, 32, 0.65), rgba(36, 36, 32, 0.88)), url(${bgImage})`,
      }}
    >
      <div
        className="text-center px-4"
        style={{
          maxWidth: '520px',
          color: '#F1EDE5',
        }}
      >
        <p
          className="text-uppercase tracking-widest mb-2"
          style={{
            letterSpacing: '4px',
            fontSize: '0.85rem',
            color: '#D8C2A0',
          }}
        >
          The Wedding Celebration
        </p>

        <h1
          className="my-3 font-serif"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '2.6rem',
            fontWeight: 700,
            color: '#FFFFFF',
            textShadow: '0 3px 12px rgba(0,0,0,0.5)',
            letterSpacing: '1px',
          }}
        >
          {coupleNames}
        </h1>

        <div
          className="mx-auto my-3"
          style={{
            width: '60px',
            height: '2px',
            backgroundColor: '#A68B65',
          }}
        />

        <p className="small mb-4" style={{ color: 'rgba(241, 237, 229, 0.85)' }}>
          {dateText}
        </p>

        {/* Guest Greeting Card */}
        <div
          className="p-3 my-4 rounded-3 text-center shadow"
          style={{
            backgroundColor: 'rgba(52, 52, 47, 0.55)',
            backdropFilter: 'blur(6px)',
            border: '1px solid rgba(166, 139, 101, 0.45)',
          }}
        >
          <small
            className="d-block text-uppercase mb-1"
            style={{ color: '#D8C2A0', fontSize: '0.75rem', letterSpacing: '1px' }}
          >
            Kepada Yth. Bapak/Ibu/Saudara/i:
          </small>
          <h4 className="fw-bold mb-2 text-white" style={{ letterSpacing: '0.5px' }}>
            {guestName || 'Tamu Undangan'}
          </h4>
          <p
            className="mb-0 small fst-italic"
            style={{ color: 'rgba(241, 237, 229, 0.8)', fontSize: '0.8rem' }}
          >
            Tanpa mengurangi rasa hormat, kami bermaksud mengundang Anda untuk hadir dan memberikan
            doa restu pada hari bahagia kami.
          </p>
        </div>

        {/* Button to Open */}
        <button
          type="button"
          onClick={onOpen}
          className="btn px-4 py-3 rounded-pill shadow-lg mt-2"
          style={{
            backgroundColor: '#A68B65',
            color: '#FFFFFF',
            fontWeight: 600,
            letterSpacing: '1px',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            fontSize: '0.95rem',
            transition: 'all 0.3s ease',
          }}
        >
          ✉ Buka Undangan
        </button>
      </div>
    </div>
  )
}

EnvelopeGate.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  invitation: PropTypes.object,
  guestName: PropTypes.string,
}

export default EnvelopeGate

