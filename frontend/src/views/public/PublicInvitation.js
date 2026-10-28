import React, { useState, useEffect, useRef } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import api from '../../services/api'
import EnvelopeGate from './EnvelopeGate'
import FloatingMusicPlayer from './FloatingMusicPlayer'
import FloatingQuickNav from './FloatingQuickNav'
import SECTION_COMPONENTS from '../invitations/editor/sections'
import './public.scss'

const PublicInvitation = () => {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const guestName = searchParams.get('to') || ''

  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState(null)
  const [errorStatus, setErrorStatus] = useState(null) // 404 | 500

  // Interaction State
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false)
  const [isPlayingMusic, setIsPlayingMusic] = useState(false)
  const [activeLightboxImg, setActiveLightboxImg] = useState(null)

  const audioRef = useRef(null)

  // Fetch invitation data from public endpoint
  useEffect(() => {
    const fetchPublicInvitation = async () => {
      setLoading(true)
      setErrorStatus(null)
      try {
        const res = await api.get(`/v1/public/invitations/${slug}`)
        const data = res.data.data
        setInvitation(data)

        if (data?.title) {
          document.title = `${data.title} — Niskala`
        }
      } catch (err) {
        setErrorStatus(err.response?.status || 404)
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchPublicInvitation()
    }
  }, [slug])

  // Handle Open Envelope
  const handleOpenInvitation = () => {
    setIsEnvelopeOpen(true)

    // Trigger music playback upon user gesture
    if (audioRef.current && invitation?.content?.music_url) {
      audioRef.current
        .play()
        .then(() => setIsPlayingMusic(true))
        .catch(() => setIsPlayingMusic(false))
    }
  }

  // Toggle Music
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

  if (loading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center vh-100"
        style={{ backgroundColor: '#242420', color: '#D8C2A0' }}
      >
        <CSpinner style={{ color: '#A68B65', width: '3rem', height: '3rem' }} />
        <p className="mt-3 small tracking-widest text-uppercase" style={{ letterSpacing: '2px' }}>
          Memuat Undangan...
        </p>
      </div>
    )
  }

  if (errorStatus === 404 || !invitation) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center vh-100 px-4 text-center"
        style={{ backgroundColor: '#242420', color: '#F1EDE5' }}
      >
        <div
          className="rounded-circle d-flex align-items-center justify-content-center mb-4"
          style={{
            width: '80px',
            height: '80px',
            backgroundColor: 'rgba(166, 139, 101, 0.2)',
            color: '#A68B65',
            fontSize: '2rem',
          }}
        >
          ✦
        </div>
        <h2 className="font-serif fw-bold mb-2" style={{ color: '#D8C2A0' }}>
          Undangan Tidak Ditemukan
        </h2>
        <p className="small mb-4 text-muted" style={{ maxWidth: '420px', color: 'rgba(241, 237, 229, 0.7)' }}>
          Undangan dengan alamat ini belum tersedia, masih dalam status draf, atau tautan yang Anda
          buka tidak valid.
        </p>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="btn btn-sm px-4 py-2 rounded-pill"
          style={{ backgroundColor: '#A68B65', color: '#FFFFFF', fontWeight: 600 }}
        >
          Kembali ke Beranda
        </button>
      </div>
    )
  }

  const sections = invitation?.content?.sections_data || []
  const musicUrl = invitation?.content?.music_url

  // Map each section type to an anchor ID for navigation
  const getSectionAnchorId = (type) => {
    switch (type) {
      case 'CoupleProfile':
        return 'sec-couple'
      case 'EventSchedule':
        return 'sec-schedule'
      case 'LocationMap':
        return 'sec-location'
      case 'PhotoGallery':
        return 'sec-gallery'
      case 'RsvpSection':
      case 'RsvpForm':
        return 'sec-rsvp'
      default:
        return undefined
    }
  }

  return (
    <div className="public-invitation-root">
      {/* 1. Fullscreen Opening Envelope Curtain */}
      <EnvelopeGate
        isOpen={isEnvelopeOpen}
        onOpen={handleOpenInvitation}
        invitation={invitation}
        guestName={guestName}
      />

      {/* 2. Hidden Audio Element */}
      {musicUrl && (
        <audio
          ref={audioRef}
          src={musicUrl}
          loop
          preload="auto"
          onEnded={() => setIsPlayingMusic(false)}
        />
      )}

      {/* 3. Floating Controls (appear once envelope is open) */}
      {isEnvelopeOpen && (
        <>
          {musicUrl && (
            <FloatingMusicPlayer isPlaying={isPlayingMusic} onToggle={handleToggleMusic} />
          )}
          <FloatingQuickNav availableSections={sections} />
        </>
      )}

      {/* 4. Central Invitation Sheet (Mobile-First / Centered Desktop Column) */}
      <div className="invitation-sheet invitation-canvas-isolated">
        {sections.map((sec) => {
          const Component = SECTION_COMPONENTS[sec.type]
          if (!Component) return null

          const anchorId = getSectionAnchorId(sec.type)

          return (
            <div key={sec.id} id={anchorId}>
              <Component props={sec.props || {}} isWeb={false} />
            </div>
          )
        })}
      </div>

      {/* 5. Lightbox Modal for Photo Gallery */}
      {activeLightboxImg && (
        <div
          className="lightbox-overlay"
          onClick={() => setActiveLightboxImg(null)}
        >
          <button
            type="button"
            className="lightbox-close"
            onClick={() => setActiveLightboxImg(null)}
          >
            &times;
          </button>
          <img
            src={activeLightboxImg}
            alt="Perbesar Foto"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

export default PublicInvitation
