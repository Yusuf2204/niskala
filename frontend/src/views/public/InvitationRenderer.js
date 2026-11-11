import React, { useState, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import EnvelopeGate from './EnvelopeGate'
import FloatingMusicPlayer from './FloatingMusicPlayer'
import FloatingQuickNav from './FloatingQuickNav'
import SECTION_COMPONENTS from '../invitations/editor/sections'
import './public.scss'

const SECTION_ANCHOR_MAP = {
  CoupleProfile: 'sec-couple',
  EventSchedule: 'sec-schedule',
  TraditionAccordion: 'sec-tradition',
  AccordionSection: 'sec-tradition',
  LocationMap: 'sec-location',
  PhotoGallery: 'sec-gallery',
  LoveStory: 'sec-story',
  GiftRegistry: 'sec-gift',
  RsvpSection: 'sec-rsvp',
  RsvpForm: 'sec-rsvp',
}

const buildInvitationCssVars = (settings) => {
  if (!settings || typeof settings !== 'object') return undefined
  const palette = settings.palette || settings.colors || {}
  const typography = settings.typography || {}
  const vars = {}

  if (palette.bg) vars['--inv-bg'] = palette.bg
  if (palette.surface) vars['--inv-surface'] = palette.surface
  if (palette.primary) vars['--inv-primary'] = palette.primary
  if (palette.secondary) vars['--inv-secondary'] = palette.secondary
  if (palette.text) vars['--inv-text'] = palette.text
  if (palette.accent) vars['--inv-accent'] = palette.accent
  if (typography.heading) vars['--inv-font-heading'] = typography.heading
  if (typography.body) vars['--inv-font-body'] = typography.body

  return Object.keys(vars).length > 0 ? vars : undefined
}

const InvitationRenderer = ({
  invitation,
  guestName = '',
  guestToken = '',
  mode = 'public',
  viewportMode = 'web',
  isEnvelopeOpen = false,
  onOpenEnvelope,
}) => {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)
  const [activeLightboxImg, setActiveLightboxImg] = useState(null)
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  )

  const audioRef = useRef(null)
  const sectionRefs = useRef({})

  // Track responsive width in public mode so desktop views use full layout
  useEffect(() => {
    if (mode !== 'public') return undefined
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [mode])

  // Prevent background page scroll while EnvelopeGate covers the viewport
  useEffect(() => {
    document.body.style.overflow = isEnvelopeOpen ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [isEnvelopeOpen])

  // Pause audio if preview resets the envelope curtain back to closed
  useEffect(() => {
    if (!isEnvelopeOpen && audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause()
    }
  }, [isEnvelopeOpen])

  const sections = invitation?.content?.sections_data || []
  const musicUrl = invitation?.content?.music_url || ''
  const themeStyle = useMemo(
    () => buildInvitationCssVars(invitation?.content?.settings),
    [invitation?.content?.settings],
  )

  const effectiveIsWeb = mode === 'preview' ? viewportMode === 'web' : windowWidth >= 768

  const handleOpenGate = () => {
    if (onOpenEnvelope) {
      onOpenEnvelope()
    }
    if (audioRef.current && musicUrl) {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => setIsPlayingMusic(false))
    }
  }

  const handleToggleMusic = () => {
    if (!audioRef.current) return
    if (isPlayingMusic) {
      audioRef.current.pause()
      setIsPlayingMusic(false)
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => setIsPlayingMusic(false))
    }
  }

  const handleExploreFromHero = (currentIdx) => {
    const nextSec = sections[currentIdx + 1]
    const targetEl = nextSec ? sectionRefs.current[nextSec.id] : null
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const rootClasses = ['public-invitation-root']
  if (mode === 'preview') {
    rootClasses.push('has-preview-bar')
    if (viewportMode === 'mobile') {
      rootClasses.push('is-mobile-viewport')
    }
  }

  const sheetClasses = ['invitation-sheet', 'invitation-canvas-isolated']
  if (mode === 'preview') {
    sheetClasses.push(viewportMode === 'mobile' ? 'viewport-mobile' : 'viewport-web')
  }

  const seenAnchors = new Set()

  return (
    <div className={rootClasses.join(' ')} style={themeStyle}>
      {/* 1. Fullscreen Opening Envelope Curtain */}
      <EnvelopeGate
        isOpen={isEnvelopeOpen}
        onOpen={handleOpenGate}
        invitation={invitation}
        guestName={guestName}
      />

      {/* 2. Background Audio Element */}
      {musicUrl && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="auto"
          onPlay={() => setIsPlayingMusic(true)}
          onPause={() => setIsPlayingMusic(false)}
          onEnded={() => setIsPlayingMusic(false)}
        />
      )}

      {/* 3. Floating Controls (visible when envelope curtain is open) */}
      {isEnvelopeOpen && (
        <>
          {musicUrl && (
            <FloatingMusicPlayer isPlaying={isPlayingMusic} onToggle={handleToggleMusic} />
          )}
          <FloatingQuickNav availableSections={sections} />
        </>
      )}

      {/* 4. Central Invitation Sheet */}
      <div className={sheetClasses.join(' ')}>
        {sections.length === 0 ? (
          <div className="text-center py-5 px-4" style={{ color: 'rgba(52, 52, 47, 0.7)' }}>
            Belum ada section konten pada undangan ini.
          </div>
        ) : (
          sections.map((sec, index) => {
            const Component = SECTION_COMPONENTS[sec.type]
            if (!Component) return null

            const mappedAnchor = SECTION_ANCHOR_MAP[sec.type]
            let anchorId
            if (mappedAnchor && !seenAnchors.has(mappedAnchor)) {
              anchorId = mappedAnchor
              seenAnchors.add(mappedAnchor)
            }

            return (
              <div
                key={sec.id || `${sec.type}-${index}`}
                id={anchorId}
                ref={(el) => {
                  if (sec.id) {
                    sectionRefs.current[sec.id] = el
                  }
                }}
                className="invitation-section-slot"
              >
                <Component
                  props={{ ...(sec.props || {}), guestName, guestToken }}
                  isWeb={effectiveIsWeb}
                  renderMode={mode}
                  invitationSlug={invitation?.slug}
                  onImageClick={(url) => setActiveLightboxImg(url)}
                  onExploreClick={
                    sec.type === 'HeroCover' ? () => handleExploreFromHero(index) : undefined
                  }
                />
              </div>
            )
          })
        )}
      </div>

      {/* 5. Lightbox Modal for Photo Gallery */}
      {activeLightboxImg && (
        <div className="lightbox-overlay" onClick={() => setActiveLightboxImg(null)}>
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setActiveLightboxImg(null)}
            aria-label="Tutup foto"
          >
            &times;
          </button>
          <img src={activeLightboxImg} alt="Perbesar Foto" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}

InvitationRenderer.propTypes = {
  invitation: PropTypes.object.isRequired,
  guestName: PropTypes.string,
  guestToken: PropTypes.string,
  mode: PropTypes.oneOf(['public', 'preview']),
  viewportMode: PropTypes.oneOf(['web', 'mobile']),
  isEnvelopeOpen: PropTypes.bool,
  onOpenEnvelope: PropTypes.func,
}

export default InvitationRenderer
