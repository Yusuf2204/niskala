import React, { useState, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import EnvelopeGate from './EnvelopeGate'
import FloatingMusicPlayer from './FloatingMusicPlayer'
import FloatingQuickNav from './FloatingQuickNav'
import SECTION_COMPONENTS from '../invitations/editor/sections'
import {
  resolveInvitationTheme,
  buildInvitationCssVars,
  getSlideEffectForSection,
} from '../../utils/invitationTheme'
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
  slideEffect = 'editorial-rise',
  isEnvelopeOpen,
  motionEnabled,
  registerRef,
  children,
}) => {
  const slotRef = useRef(null)
  const [viewportPos, setViewportPos] = useState('below')

  const effectiveViewportPos =
    !motionEnabled || index === 0 || typeof IntersectionObserver === 'undefined'
      ? 'in'
      : !isEnvelopeOpen
        ? 'below'
        : viewportPos

  const isRevealed = effectiveViewportPos !== 'below'

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
          if (entry.isIntersecting) {
            setViewportPos('in')
            return
          }
          if (entry.boundingClientRect.bottom <= 0 || entry.boundingClientRect.top < 0) {
            setViewportPos('above')
          } else {
            setViewportPos('below')
          }
        })
      },
      { threshold: 0.01, rootMargin: '0px 0px -24px 0px' },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [isEnvelopeOpen, motionEnabled, index])

  const slotClasses = ['invitation-section-slot', 'invitation-card-slot', 'inv-reveal-slot']
  if (isRevealed) {
    slotClasses.push('is-revealed')
  }
  if (effectiveViewportPos === 'below') {
    slotClasses.push('is-below-view')
  } else if (effectiveViewportPos === 'above') {
    slotClasses.push('is-above-view')
  } else {
    slotClasses.push('is-in-view')
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
      data-inv-slide-effect={slideEffect}
    >
      {children}
    </div>
  )
}

SectionRevealSlot.propTypes = {
  id: PropTypes.string,
  sectionId: PropTypes.string,
  index: PropTypes.number.isRequired,
  slideEffect: PropTypes.string,
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
  const [activeAnchorId, setActiveAnchorId] = useState('')
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  )

  const audioRef = useRef(null)
  const sectionRefs = useRef({})
  const progressBarRef = useRef(null)
  const switchTimersRef = useRef(new Map())

  useEffect(() => {
    const timers = switchTimersRef.current
    return () => {
      timers.forEach((timerId) => window.clearTimeout(timerId))
      timers.clear()
    }
  }, [])

  const anchorIds = useMemo(() => {
    const secs = invitation?.content?.sections_data || []
    const seen = new Set()
    const ids = []
    secs.forEach((sec) => {
      const mapped = SECTION_ANCHOR_MAP[sec.type]
      if (mapped && !seen.has(mapped)) {
        seen.add(mapped)
        ids.push(mapped)
      }
    })
    return ids
  }, [invitation])

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

  // Track top scroll progress hairline & active QuickNav section via rAF
  useEffect(() => {
    if (!isEnvelopeOpen || typeof window === 'undefined') return undefined

    let rafId = null

    const updateScrollTelemetry = () => {
      rafId = null
      const docEl = document.documentElement
      const maxScroll = Math.max(docEl.scrollHeight - window.innerHeight, 0)
      const ratio = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${ratio.toFixed(4)})`
      }

      const threshold = window.innerHeight * 0.45
      let currentAnchor = ''
      for (let i = 0; i < anchorIds.length; i += 1) {
        const el = document.getElementById(anchorIds[i])
        if (el && el.getBoundingClientRect().top <= threshold) {
          currentAnchor = anchorIds[i]
        }
      }
      if (maxScroll > 0 && window.scrollY >= maxScroll - 30 && anchorIds.length > 0) {
        currentAnchor = anchorIds[anchorIds.length - 1]
      }
      setActiveAnchorId((prev) => (prev === currentAnchor ? prev : currentAnchor))
    }

    const scheduleTelemetry = () => {
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(updateScrollTelemetry)
    }

    scheduleTelemetry()
    window.addEventListener('scroll', scheduleTelemetry, { passive: true })
    window.addEventListener('resize', scheduleTelemetry, { passive: true })

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
      window.removeEventListener('scroll', scheduleTelemetry)
      window.removeEventListener('resize', scheduleTelemetry)
    }
  }, [isEnvelopeOpen, anchorIds])

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

  const triggerSlideSwitch = (targetEl) => {
    if (!targetEl || !motionEnabled || typeof window === 'undefined') return
    const prevTimer = switchTimersRef.current.get(targetEl)
    if (prevTimer) {
      window.clearTimeout(prevTimer)
    }
    targetEl.classList.remove('inv-slide-switching')
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        if (targetEl.isConnected) {
          targetEl.classList.add('inv-slide-switching')
        }
      })
    })
    const timerId = window.setTimeout(() => {
      targetEl.classList.remove('inv-slide-switching')
      switchTimersRef.current.delete(targetEl)
    }, 860)
    switchTimersRef.current.set(targetEl, timerId)
  }

  const handleNavigateToAnchor = (anchorId) => {
    const targetEl = document.getElementById(anchorId)
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      triggerSlideSwitch(targetEl)
    }
  }

  const handleExploreFromHero = (currentIdx) => {
    const nextSec = sections[currentIdx + 1]
    const targetEl = nextSec ? sectionRefs.current[nextSec.id] : null
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      triggerSlideSwitch(targetEl)
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

  const sheetClasses = ['invitation-sheet', 'invitation-canvas-isolated', 'invitation-card-stack']
  if (mode === 'preview') {
    if (viewportMode === 'mobile') {
      sheetClasses.push('viewport-mobile', 'is-mobile-stack')
    } else {
      sheetClasses.push('viewport-web')
    }
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

      {/* 3. Top Scroll Progress & Floating Controls */}
      {isEnvelopeOpen && (
        <>
          {motionEnabled && (
            <div className="inv-scroll-progress-track" aria-hidden="true">
              <div ref={progressBarRef} className="inv-scroll-progress-bar" />
            </div>
          )}
          {musicUrl && (
            <FloatingMusicPlayer isPlaying={isPlayingMusic} onToggle={handleToggleMusic} />
          )}
          <FloatingQuickNav
            availableSections={sections}
            activeSectionId={isEnvelopeOpen ? activeAnchorId : ''}
            onSelectSection={handleNavigateToAnchor}
          />
        </>
      )}

      {/* 4. Central Invitation Sheet */}
      <div
        className={sheetClasses.join(' ')}
        data-inv-theme={resolvedTheme.themeStyle}
        data-inv-animation={resolvedTheme.animation?.preset || 'subtle-fade'}
      >
        {sections.length === 0 ? (
          <div
            className="text-center py-5 px-4 rounded-4"
            style={{
              backgroundColor: 'var(--inv-bg, #FAF8F5)',
              color: 'var(--inv-muted, #6A5342)',
              border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.34))',
            }}
          >
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
                slideEffect={getSlideEffectForSection(sec.type)}
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
