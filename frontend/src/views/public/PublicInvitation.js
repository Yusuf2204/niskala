import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import { CSpinner } from '@coreui/react'
import api from '../../services/api'
import InvitationRenderer from './InvitationRenderer'

const PublicInvitation = () => {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const urlGuestName = searchParams.get('to') || ''
  const urlGuestToken = searchParams.get('c') || ''

  const [loading, setLoading] = useState(true)
  const [invitation, setInvitation] = useState(null)
  const [errorStatus, setErrorStatus] = useState(null) // 404 | 500
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false)

  // Fetch invitation data from public endpoint
  useEffect(() => {
    const fetchPublicInvitation = async () => {
      setLoading(true)
      setErrorStatus(null)
      try {
        const res = await api.get(`/v1/public/invitations/${slug}`, {
          params: urlGuestToken ? { c: urlGuestToken } : undefined,
        })
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
  }, [slug, urlGuestToken])

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
          className="btn btn-sm btn-niskala-gold px-4 py-2 rounded-pill"
        >
          Kembali ke Beranda
        </button>
      </div>
    )
  }

  const resolvedGuestName = invitation?.guest_context?.name || urlGuestName
  const resolvedGuestToken = invitation?.guest_context?.token || urlGuestToken

  return (
    <InvitationRenderer
      invitation={invitation}
      guestName={resolvedGuestName}
      guestToken={resolvedGuestToken}
      mode="public"
      isEnvelopeOpen={isEnvelopeOpen}
      onOpenEnvelope={() => setIsEnvelopeOpen(true)}
    />
  )
}

export default PublicInvitation
