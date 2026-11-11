import React, { useState, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import EnvelopeGate from './EnvelopeGate'
import FloatingMusicPlayer from './FloatingMusicPlayer'
import FloatingQuickNav from './FloatingQuickNav'
import SECTION_COMPONENTS from '../invitations/editor/sections'
import { resolveInvitationTheme, buildInvitationCssVars } from '../../utils/invitationTheme'
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

/**
 * Reveal section progressively as it enters viewport once the envelope curtain is open.
 */
const SectionRevealSlot = ({
  id,
  sectionId,
  index,
  isEnvelopeOpen,
  motionEnabled,
  registerRef,
  children,
}) => {
  const slotRef = useRef(null)
  const [observedReveal, setObservedReveal] = useState(false)
  const isRevealed =
    !motionEnabled ||
    index === 0 ||
    typeof IntersectionObserver === 'undefined' ||
    (isEnvelopeOpen && observedReveal)

  useEffect(() => {
    if (
      !motionEnabled ||
      index === 0 ||
      !isEnvelopeOpen ||
      typeof IntersectionObserver === 'undefined'
    ) {
      return undefined
    }

    const node = slotRef.current
    if (!node) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            setObservedReveal(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.01, rootMargin: '120px 0px -10px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [isEnvelopeOpen, motionEnabled, index])

  const slotClasses = ['invitation-section-slot', 'inv-reveal-slot']
  if (isRevealed) {
    slotClasses.push('is-revealed')
  }

  return (
    <div
      id={id}
      ref={(el) => {
        slotRef.current = el
        if (registerRef && sectionId) {
          registerRef(sectionId, el)
        }
      }}
      className={slotClasses.join(' ')}
    >
      {children}
    </div>
  )
}

SectionRevealSlot.propTypes = {
  id: PropTypes.string,
  sectionId: PropTypes.string,
  index: PropTypes.number.isRequired,
  isEnvelopeOpen: PropTypes.bool.isRequired,
  motionEnabled: PropTypes.bool.isRequired,
  registerRef: PropTypes.func,
  children: PropTypes.node.isRequired,
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

  const resolvedTheme = useMemo(() => resolveInvitationTheme(invitation), [invitation])
  const themeVars = useMemo(() => buildInvitationCssVars(resolvedTheme), [resolvedTheme])

  const motionEnabled =
    resolvedTheme.animation?.preset !== 'none' &&
    resolvedTheme.animation?.section_reveal !== 'none'

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

  const registerSectionRef = (sectionId, el) => {
    sectionRefs.current[sectionId] = el
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
    <div
      className={rootClasses.join(' ')}
      style={themeVars}
      data-inv-motion={isEnvelopeOpen && motionEnabled ? 'active' : 'off'}
    >
      {/* 1. Fullscreen Opening Envelope Curtain */}
      <EnvelopeGate
        isOpen={isEnvelopeOpen}
        onOpen={handleOpenGate}
        invitation={invitation}
        guestName={guestName}
        theme={resolvedTheme}
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
      <div
        className={sheetClasses.join(' ')}
        data-inv-theme={resolvedTheme.themeStyle}
        data-inv-animation={resolvedTheme.animation?.preset || 'subtle-fade'}
      >
        {sections.length === 0 ? (
          <div className="text-center py-5 px-4" style={{ color: 'var(--inv-muted, #6A5342)' }}>
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
              <SectionRevealSlot
                key={sec.id || `${sec.type}-${index}`}
                id={anchorId}
                sectionId={sec.id}
                index={index}
                isEnvelopeOpen={isEnvelopeOpen}
                motionEnabled={motionEnabled}
                registerRef={registerSectionRef}
              >
                <Component
                  props={{ ...(sec.props || {}), guestName, guestToken }}
                  isWeb={effectiveIsWeb}
                  renderMode={mode}
                  invitationSlug={invitation?.slug}
                  theme={resolvedTheme}
                  onImageClick={(url) => setActiveLightboxImg(url)}
                  onExploreClick={
                    sec.type === 'HeroCover' ? () => handleExploreFromHero(index) : undefined
                  }
                />
              </SectionRevealSlot>
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
