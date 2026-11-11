import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import api from '../../services/api'
import InvitationRenderer from './InvitationRenderer'
import { readPreviewSnapshot, subscribePreviewUpdates } from './previewSync'

const formatSyncTime = (epochMs) => {
  try {
    return new Date(epochMs).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  } catch {
    return ''
  }
}

const applySnapshotToInvitation = (inv, snapshot) => {
  if (!inv || !snapshot) return inv
  return {
    ...inv,
    content: {
      ...(inv.content || {}),
      sections_data: snapshot.sections_data,
      music_url: snapshot.music_url || '',
      settings: snapshot.settings || inv.content?.settings || {},
    },
  }
}

const PreviewInvitation = () => {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const initialViewport = searchParams.get('viewport') === 'mobile' ? 'mobile' : 'web'
  const isOpenedFromLiveEditor = searchParams.get('live') === '1'

  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)

  const [viewportMode, setViewportMode] = useState(initialViewport)
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false)
  const [guestName, setGuestName] = useState(() => searchParams.get('to') || '')
  const [syncSource, setSyncSource] = useState('db') // 'db' | 'live'
  const [lastSyncTime, setLastSyncTime] = useState('')

  const handleIncomingSnapshot = useCallback((snapshot) => {
    setInvitation((prev) => applySnapshotToInvitation(prev, snapshot))
    setSyncSource('live')
    if (snapshot?.updatedAt) {
      setLastSyncTime(formatSyncTime(snapshot.updatedAt))
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchInvitation = async () => {
      setLoading(true)
      setErrorMessage(null)
      try {
        const res = await api.get(`/v1/invitations/${id}`)
        if (!isMounted) return

        let data = res.data.data
        const dbUpdatedMs = Math.max(
          Date.parse(data?.content?.updated_at || '') || 0,
          Date.parse(data?.updated_at || '') || 0,
        )

        const localSnapshot = readPreviewSnapshot(id)
        const snapshotAgeMs = localSnapshot?.updatedAt
          ? Date.now() - localSnapshot.updatedAt
          : Infinity
        const shouldUseSnapshot =
          localSnapshot &&
          ((isOpenedFromLiveEditor && snapshotAgeMs < 2 * 60 * 60 * 1000) ||
            (localSnapshot.updatedAt && localSnapshot.updatedAt > dbUpdatedMs))

        if (shouldUseSnapshot) {
          data = applySnapshotToInvitation(data, localSnapshot)
          setSyncSource('live')
          setLastSyncTime(formatSyncTime(localSnapshot.updatedAt))
        } else {
          setSyncSource('db')
        }

        setInvitation(data)
        if (data?.title) {
          document.title = `Preview: ${data.title} — Niskala`
        }
      } catch (err) {
        if (!isMounted) return
        setErrorMessage(
          err.response?.data?.message ||
            'Anda tidak memiliki akses ke undangan ini atau undangan tidak ditemukan.',
        )
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (id) {
      fetchInvitation()
    }

    return () => {
      isMounted = false
    }
  }, [id, isOpenedFromLiveEditor])

  useEffect(() => {
    if (!id) return undefined
    return subscribePreviewUpdates(id, handleIncomingSnapshot)
  }, [id, handleIncomingSnapshot])

  if (loading) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center vh-100"
        style={{ backgroundColor: '#242420', color: '#D8C2A0' }}
      >
        <CSpinner style={{ color: '#A68B65', width: '3rem', height: '3rem' }} />
        <p className="mt-3 small text-uppercase" style={{ letterSpacing: '2px' }}>
          Memuat Live Preview...
        </p>
      </div>
    )
  }

  if (errorMessage || !invitation) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center vh-100 px-4 text-center"
        style={{ backgroundColor: '#242420', color: '#F1EDE5' }}
      >
        <h2 className="font-serif fw-bold mb-2" style={{ color: '#D8C2A0' }}>
          Preview Tidak Tersedia
        </h2>
        <p className="small mb-4" style={{ maxWidth: '440px', color: 'rgba(241, 237, 229, 0.78)' }}>
          {errorMessage}
        </p>
        <button
          type="button"
          onClick={() => navigate('/invitations')}
          className="btn btn-sm btn-niskala-gold px-4 py-2 rounded-pill"
        >
          Kembali ke Undangan
        </button>
      </div>
    )
  }

  const statusLabel = invitation.status === 'published' ? 'Published Preview' : 'Draft Preview'

  return (
    <>
      <div className="preview-floating-bar" role="region" aria-label="Kontrol Live Preview">
        <div className="preview-bar-group">
          <span
            className={`preview-status-pill ${invitation.status === 'published' ? 'published' : ''}`}
          >
            {statusLabel}
          </span>
          <span className="preview-bar-title d-none d-sm-inline">{invitation.title}</span>
          <span className="preview-sync-badge d-none d-lg-inline">
            {syncSource === 'live'
              ? `● Live Editor${lastSyncTime ? ` (${lastSyncTime})` : ''}`
              : '● Data Tersimpan'}
          </span>
        </div>

        <div className="preview-bar-group">
          <div className="d-flex align-items-center gap-1">
            <button
              type="button"
              className={`preview-btn ${viewportMode === 'web' ? 'active' : ''}`}
              onClick={() => setViewportMode('web')}
              title="Tampilan Web Desktop"
            >
              Web
            </button>
            <button
              type="button"
              className={`preview-btn ${viewportMode === 'mobile' ? 'active' : ''}`}
              onClick={() => setViewportMode('mobile')}
              title="Simulasi Layar Ponsel 390px"
            >
              Mobile 390px
            </button>
          </div>

          <input
            type="text"
            className="preview-guest-input d-none d-md-block"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            placeholder="Uji nama tamu (?to=)"
            aria-label="Nama tamu untuk simulasi sapaan"
          />

          <button
            type="button"
            className={`preview-btn ${isEnvelopeOpen ? 'active' : ''}`}
            onClick={() => setIsEnvelopeOpen((prev) => !prev)}
            title={isEnvelopeOpen ? 'Tutup kembali tirai amplop' : 'Lewati tirai amplop'}
          >
            {isEnvelopeOpen ? 'Reset Amplop' : 'Buka Amplop'}
          </button>

          <button
            type="button"
            className="preview-btn"
            onClick={() => navigate(`/invitations/${id}/editor`)}
            title="Buka halaman Visual Editor"
          >
            Editor
          </button>
        </div>
      </div>

      <InvitationRenderer
        invitation={invitation}
        guestName={guestName}
        mode="preview"
        viewportMode={viewportMode}
        isEnvelopeOpen={isEnvelopeOpen}
        onOpenEnvelope={() => setIsEnvelopeOpen(true)}
      />
    </>
  )
}

export default PreviewInvitation
