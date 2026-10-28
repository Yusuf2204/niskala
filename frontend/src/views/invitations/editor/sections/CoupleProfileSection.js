import React from 'react'
import PropTypes from 'prop-types'

const CoupleProfileSection = ({ props = {}, isWeb = true }) => {
  const {
    section_title = 'Mempelai Pria & Wanita',
    quote = 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan syukuran pernikahan putra-putri kami:',
    groom_name = 'Rama Wijaya, S.Kom.',
    groom_parents = 'Putra pertama dari Bpk. Danu Wijaya & Ibu Maya Kartika',
    groom_photo = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    groom_instagram = '@ramawijaya',
    bride_name = 'Shinta Dewi, S.E.',
    bride_parents = 'Putri kedua dari Bpk. Surya Pratama & Ibu Ratna Sari',
    bride_photo = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    bride_instagram = '@shintadewi',
  } = props

  return (
    <div
      className="py-5 px-3 text-center"
      style={{
        backgroundColor: '#FAF8F5',
        color: '#34342F',
      }}
    >
      <div className="container" style={{ maxWidth: isWeb ? '900px' : '100%' }}>
        <p
          className="text-uppercase tracking-wider fw-semibold mb-1"
          style={{ color: '#A68B65', fontSize: '0.85rem', letterSpacing: '2px' }}
        >
          Pasangan Mempelai
        </p>
        <h2
          className="font-serif mb-3"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: '#34342F',
            fontSize: isWeb ? '2.2rem' : '1.7rem',
          }}
        >
          {section_title}
        </h2>
        <p
          className="mx-auto mb-5 text-muted"
          style={{ maxWidth: '620px', fontSize: isWeb ? '0.95rem' : '0.85rem' }}
        >
          {quote}
        </p>

        <div
          className={`d-flex ${isWeb ? 'flex-row' : 'flex-column'} align-items-center justify-content-center gap-4`}
        >
          {/* Mempelai Pria */}
          <div className="flex-grow-1" style={{ maxWidth: isWeb ? '360px' : '100%' }}>
            <div
              className="mx-auto rounded-circle overflow-hidden shadow-sm mb-3"
              style={{
                width: isWeb ? '180px' : '140px',
                height: isWeb ? '180px' : '140px',
                border: '4px solid #A68B65',
              }}
            >
              <img
                src={groom_photo}
                alt={groom_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h4
              className="fw-bold mb-1 font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#34342F' }}
            >
              {groom_name}
            </h4>
            <p className="text-muted small mb-2">{groom_parents}</p>
            {groom_instagram && (
              <span
                className="badge px-3 py-1 rounded-pill"
                style={{
                  backgroundColor: '#F1EDE5',
                  color: '#A68B65',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid rgba(166,139,101,0.3)',
                }}
              >
                Instagram {groom_instagram}
              </span>
            )}
          </div>

          {/* Pemisah Simbol & */}
          <div
            className="my-2 my-md-0 d-flex align-items-center justify-content-center"
            style={{ minWidth: '60px' }}
          >
            <span
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: isWeb ? '3rem' : '2.2rem',
                color: '#A68B65',
                fontStyle: 'italic',
              }}
            >
              &amp;
            </span>
          </div>

          {/* Mempelai Wanita */}
          <div className="flex-grow-1" style={{ maxWidth: isWeb ? '360px' : '100%' }}>
            <div
              className="mx-auto rounded-circle overflow-hidden shadow-sm mb-3"
              style={{
                width: isWeb ? '180px' : '140px',
                height: isWeb ? '180px' : '140px',
                border: '4px solid #A68B65',
              }}
            >
              <img
                src={bride_photo}
                alt={bride_name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <h4
              className="fw-bold mb-1 font-serif"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#34342F' }}
            >
              {bride_name}
            </h4>
            <p className="text-muted small mb-2">{bride_parents}</p>
            {bride_instagram && (
              <span
                className="badge px-3 py-1 rounded-pill"
                style={{
                  backgroundColor: '#F1EDE5',
                  color: '#A68B65',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid rgba(166,139,101,0.3)',
                }}
              >
                Instagram {bride_instagram}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

CoupleProfileSection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
}

export default CoupleProfileSection

