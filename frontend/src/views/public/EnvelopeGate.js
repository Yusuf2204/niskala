import React from 'react'
import PropTypes from 'prop-types'
import { resolveInvitationTheme } from '../../utils/invitationTheme'
import { GununganEmblem, JavaneseDivider } from '../invitations/editor/sections/Ornaments'
import { CornerOrnaments, ThemeBatikOverlay } from '../invitations/editor/sections/ThemeDecorators'

const EnvelopeGate = ({ isOpen, onOpen, invitation, guestName, theme }) => {
  const resolvedTheme = theme || resolveInvitationTheme(invitation)
  const { assets = {}, animation = {}, isJavanese = false } = resolvedTheme

  const sections = invitation?.content?.sections_data || []
  const heroSection = sections.find((s) => s.type === 'HeroCover')
  const heroProps = heroSection?.props || {}

  const bgImage =
    heroProps.bg_image_url ||
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80'

  const coverTitle = heroProps.title || 'Undangan Pernikahan'
  const coupleNames = heroProps.primary_names || invitation?.title || 'Rama & Shinta'
  const dateText = heroProps.date_text || 'Sabtu, 12 Desember 2026'
  const greetingPrefix = heroProps.guest_greeting_prefix || 'Kepada Yth. Bapak/Ibu/Saudara/i:'
  const buttonText = heroProps.open_button_text || 'Buka Undangan'

  const ornamentUrl = heroProps.ornament_url || assets.gunungan_url || ''
  const cornerUrl = heroProps.corner_url || assets.corner_url || ''
  const dividerUrl = heroProps.divider_url || assets.divider_url || ''
  const patternUrl = heroProps.bg_pattern_url || assets.pattern_url || ''
  const ornamentMotion = Boolean(animation?.ornament_motion)

  return (
    <div
      className={`envelope-gate ${isOpen ? 'open' : ''}`}
      data-inv-gate={animation?.gate_style || 'slide-up'}
      style={{
        backgroundImage: `linear-gradient(rgba(36, 27, 21, 0.72), rgba(36, 27, 21, 0.90)), url(${bgImage})`,
      }}
    >
      <ThemeBatikOverlay patternUrl={patternUrl} opacity={0.18} />

      <div className="envelope-stage">
        <div className="envelope-pocket">
          <div className="envelope-flap" aria-hidden="true" />

          <button
            type="button"
            className="envelope-seal"
            onClick={onOpen}
            aria-label={buttonText}
            title={buttonText}
          >
            <GununganEmblem width={24} height={30} color="#241B15" />
          </button>

          <div
            className="envelope-letter"
            style={{
              backgroundColor: 'rgba(36, 27, 21, 0.42)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <CornerOrnaments
              cornerUrl={cornerUrl}
              isWeb={false}
              size={54}
              offset={10}
              opacity={0.78}
              animated={ornamentMotion}
            />

            <div className="position-relative" style={{ zIndex: 2 }}>
              {(isJavanese || ornamentUrl) && (
                <div className="mb-2 env-enter" style={{ '--env-i': 0 }}>
                  <span className={ornamentMotion ? 'inv-ornament-emblem' : 'd-inline-block'}>
                    {ornamentUrl ? (
                      <img
                        src={ornamentUrl}
                        alt="Ornamen Pembuka"
                        style={{ width: '52px', height: 'auto' }}
                      />
                    ) : (
                      <GununganEmblem width={42} height={52} color="#D4AF37" />
                    )}
                  </span>
                </div>
              )}

              <p
                className="text-uppercase mb-2 env-enter"
                style={{
                  '--env-i': 1,
                  letterSpacing: '3.5px',
                  fontSize: '0.78rem',
                  color: '#E5CFA3',
                  fontWeight: 600,
                }}
              >
                {coverTitle}
              </p>

              <h1
                className="my-2 font-serif env-enter"
                style={{
                  '--env-i': 2,
                  fontFamily: 'var(--inv-font-heading, Georgia, serif)',
                  fontSize: 'clamp(1.9rem, 4.4vw, 2.65rem)',
                  fontWeight: 700,
                  color: '#F5EFE6',
                  textShadow: '0 3px 12px rgba(0,0,0,0.45)',
                  letterSpacing: '0.8px',
                }}
              >
                {coupleNames}
              </h1>

              <div className="env-enter" style={{ '--env-i': 3 }}>
                {dividerUrl ? (
                  <div className="mx-auto my-2" style={{ maxWidth: '200px' }}>
                    <img src={dividerUrl} alt="" style={{ width: '100%', height: 'auto' }} />
                  </div>
                ) : (
                  <JavaneseDivider color="#D4AF37" width="160px" />
                )}
              </div>

              <p
                className="small mb-3 env-enter"
                style={{ '--env-i': 4, color: 'rgba(245, 239, 230, 0.88)' }}
              >
                {dateText}
              </p>

              {/* Guest Greeting Card */}
              <div
                className="p-3 my-3 rounded-3 text-center env-enter"
                style={{
                  '--env-i': 5,
                  backgroundColor: 'rgba(255, 253, 249, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.42)',
                }}
              >
                <small
                  className="d-block text-uppercase mb-1"
                  style={{ color: '#E5CFA3', fontSize: '0.72rem', letterSpacing: '1px' }}
                >
                  {greetingPrefix}
                </small>
                <h4 className="fw-bold mb-2" style={{ color: '#F5EFE6', letterSpacing: '0.4px' }}>
                  {guestName || 'Tamu Undangan'}
                </h4>
                <p
                  className="mb-0 small fst-italic"
                  style={{
                    color: 'rgba(245, 239, 230, 0.84)',
                    fontSize: '0.8rem',
                    lineHeight: 1.55,
                  }}
                >
                  Tanpa mengurangi rasa hormat, kami bermaksud mengundang Anda untuk hadir dan
                  memberikan doa restu pada hari bahagia kami.
                </p>
              </div>

              <button
                type="button"
                onClick={onOpen}
                className="btn px-4 py-2 rounded-pill shadow-lg mt-2 envelope-open-btn env-enter"
                style={{
                  '--env-i': 6,
                  backgroundColor: 'var(--inv-accent, #C5A059)',
                  color: '#241B15',
                  fontWeight: 700,
                  letterSpacing: '0.6px',
                  border: '1px solid rgba(255, 242, 206, 0.5)',
                  fontSize: '0.92rem',
                }}
              >
                ✉ {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

EnvelopeGate.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onOpen: PropTypes.func.isRequired,
  invitation: PropTypes.object,
  guestName: PropTypes.string,
  theme: PropTypes.object,
}

export default EnvelopeGate
