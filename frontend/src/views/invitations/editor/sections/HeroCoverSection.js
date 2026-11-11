import React from 'react'
import PropTypes from 'prop-types'
import { GununganEmblem, JavaneseDivider } from './Ornaments'
import { CornerOrnaments, ThemeBatikOverlay } from './ThemeDecorators'

const HeroCoverSection = ({ props = {}, isWeb = true, onExploreClick, theme = {} }) => {
  const {
    title = 'The Wedding Of',
    primary_names = 'Rama & Shinta',
    date_text = 'Sabtu, 12 Desember 2026',
    quote = 'Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan.',
    bg_image_url = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    open_button_text = 'Buka Undangan',
    guest_greeting_prefix = 'Kepada Yth. Bapak/Ibu/Saudara/i:',
    guestName = '',
    ornament_type = '',
  } = props

  const assets = theme?.assets || {}
  const isOrnamentAnimated = theme?.animation?.ornament_motion !== false
  const gununganUrl = props.ornament_url || props.gunungan_url || assets.gunungan_url || ''
  const dividerUrl = props.divider_url || assets.divider_url || ''
  const cornerUrl = props.corner_url || assets.corner_url || ''
  const patternUrl = props.pattern_url || assets.pattern_url || ''
  const showGunungan = ornament_type === 'gunungan' || Boolean(gununganUrl) || Boolean(theme?.isJavanese)

  return (
    <div
      className="position-relative text-center overflow-hidden d-flex flex-column justify-content-center align-items-center inv-section-framed"
      style={{
        minHeight: isWeb ? '560px' : '480px',
        backgroundImage: `linear-gradient(rgba(36, 27, 21, 0.56), rgba(36, 27, 21, 0.78)), url(${bg_image_url})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FAF6EE',
        padding: isWeb ? '4.25rem 2rem' : '2.75rem 1.25rem',
        borderRadius: isWeb ? '12px' : '0',
      }}
    >
      <ThemeBatikOverlay patternUrl={patternUrl} isWeb={isWeb} opacity={0.18} />
      <CornerOrnaments
        cornerUrl={cornerUrl}
        isWeb={isWeb}
        variant="full"
        opacity={0.58}
        size={isWeb ? 88 : 54}
        offset={isWeb ? 14 : 8}
        animated={isOrnamentAnimated}
      />

      <div className="position-relative" style={{ maxWidth: isWeb ? '720px' : '100%', zIndex: 2 }}>
        {showGunungan && (
          <div className={`mb-3 animate-fade-in ${isOrnamentAnimated ? 'inv-ornament-emblem' : ''}`}>
            {gununganUrl ? (
              <img
                src={gununganUrl}
                alt="Gunungan Wayang"
                style={{
                  width: isWeb ? '68px' : '52px',
                  height: 'auto',
                  filter: 'drop-shadow(0 4px 10px rgba(0, 0, 0, 0.6))',
                }}
              />
            ) : (
              <GununganEmblem
                width={isWeb ? 54 : 44}
                height={isWeb ? 64 : 54}
                color="var(--inv-accent, #C5A059)"
              />
            )}
          </div>
        )}
        <p
          className="text-uppercase tracking-widest mb-2"
          style={{
            letterSpacing: '3px',
            fontSize: isWeb ? '0.92rem' : '0.78rem',
            color: '#E7D4B5',
          }}
        >
          {title}
        </p>
        <h1
          className="my-3 font-serif"
          style={{
            fontFamily: "var(--inv-font-heading, 'Playfair Display', Georgia, serif)",
            fontSize: isWeb ? '3.2rem' : '2.15rem',
            fontWeight: 700,
            color: '#FFFFFF',
            textShadow: '0 2px 12px rgba(0, 0, 0, 0.45)',
            letterSpacing: '1px',
          }}
        >
          {primary_names}
        </h1>
        {dividerUrl ? (
          <div className="mx-auto my-3 inv-divider-wrap" style={{ maxWidth: isWeb ? '240px' : '180px' }}>
            <img src={dividerUrl} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        ) : (
          <div className="my-2">
            <JavaneseDivider color="var(--inv-accent, #C5A059)" width={isWeb ? '200px' : '150px'} />
          </div>
        )}
        <p
          className="mb-3 fst-italic"
          style={{
            fontSize: isWeb ? '1rem' : '0.85rem',
            color: 'rgba(250, 246, 238, 0.92)',
            maxWidth: '540px',
            margin: '0 auto',
          }}
        >
          &quot;{quote}&quot;
        </p>

        <div
          className="p-3 my-3 rounded-3"
          style={{
            backgroundColor: 'rgba(36, 27, 21, 0.56)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(197, 160, 89, 0.45)',
            display: 'inline-block',
          }}
        >
          <small
            className="d-block text-uppercase fw-semibold"
            style={{ color: '#E7D4B5', fontSize: '0.74rem', letterSpacing: '1px' }}
          >
            {guest_greeting_prefix}
          </small>
          <span className="fw-bold" style={{ color: '#FFFFFF', fontSize: '0.95rem' }}>
            {guestName || 'Tamu Undangan'}
          </span>
        </div>

        <div className="mt-2">
          <p
            className="fw-semibold mb-3"
            style={{ color: '#FAF6EE', fontSize: isWeb ? '1.05rem' : '0.9rem' }}
          >
            {date_text}
          </p>
          <button
            type="button"
            onClick={onExploreClick}
            className="btn px-4 py-2 rounded-pill shadow-sm"
            style={{
              backgroundColor: 'var(--inv-accent, #C5A059)',
              color: '#241B15',
              fontWeight: 700,
              border: '1px solid rgba(255, 248, 225, 0.45)',
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
  onExploreClick: PropTypes.func,
  theme: PropTypes.object,
}

export default HeroCoverSection

