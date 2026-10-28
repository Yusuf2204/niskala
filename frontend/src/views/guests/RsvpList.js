import React from 'react'
import { CCard, CCardBody, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChatBubble, cilArrowRight } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

const RsvpList = () => {
  const navigate = useNavigate()

  return (
    <div className="rsvp-list-container">
      <div className="mb-4">
        <h4 className="fw-bold text-body mb-1 d-flex align-items-center gap-2">
          <CIcon icon={cilChatBubble} className="text-secondary" /> Rekapitulasi RSVP & Doa Restu
        </h4>
        <p className="text-body-secondary small mb-0">
          Pantau status konfirmasi kehadiran tamu (Hadir, Ragu, Tidak Hadir) serta moderasi ucapan doa restu tamu.
        </p>
      </div>

      <CCard className="border-0 shadow-sm rounded-3 py-5 text-center">
        <CCardBody>
          <CIcon icon={cilChatBubble} size="xxl" className="text-body-secondary opacity-50 mb-3" />
          <h5 className="fw-bold text-body">Rekapitulasi RSVP & Moderasi Ucapan (PRD 05)</h5>
          <p className="text-body-secondary small mx-auto" style={{ maxWidth: '500px' }}>
            Data konfirmasi kehadiran dan ucapan doa dari tamu yang mengisi formulir publik akan
            terekap otomatis secara real-time di halaman ini.
          </p>
          <CButton
            size="sm"
            onClick={() => navigate('/invitations/list')}
            className="btn-niskala-gold"
          >
            Lihat Daftar Undangan <CIcon icon={cilArrowRight} className="ms-1" />
          </CButton>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default RsvpList

