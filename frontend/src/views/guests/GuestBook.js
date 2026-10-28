import React from 'react'
import { CCard, CCardBody, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilArrowRight } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

const GuestBook = () => {
  const navigate = useNavigate()

  return (
    <div className="guestbook-container">
      <div className="mb-4">
        <h4 className="fw-bold text-body mb-1 d-flex align-items-center gap-2">
          <CIcon icon={cilPeople} className="text-secondary" /> Buku Tamu Undangan
        </h4>
        <p className="text-body-secondary small mb-0">
          Modul manajemen daftar nama tamu, pengelompokan kategori (VIP/Keluarga), dan generator tautan personal undangan.
        </p>
      </div>

      <CCard className="border-0 shadow-sm rounded-3 py-5 text-center">
        <CCardBody>
          <CIcon icon={cilPeople} size="xxl" className="text-body-secondary opacity-50 mb-3" />
          <h5 className="fw-bold text-body">Manajemen Buku Tamu (PRD 05)</h5>
          <p className="text-body-secondary small mx-auto" style={{ maxWidth: '500px' }}>
            Fitur pengelolaan daftar tamu personalisasi per undangan dan ekspor/impor Excel akan aktif
            setelah modul Visual Editor (PRD 03) selesai diimplementasikan.
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

export default GuestBook

