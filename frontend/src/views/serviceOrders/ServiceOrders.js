import React from 'react'
import { CCard, CCardBody, CButton } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilNotes, cilArrowRight } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

const ServiceOrders = () => {
  const navigate = useNavigate()

  return (
    <div className="service-orders-container">
      <div className="mb-4">
        <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
          <CIcon icon={cilNotes} className="text-secondary" /> Layanan Bantuan Pembuatan Undangan
        </h4>
        <p className="text-muted small mb-0">
          Sistem tiket bantuan khusus bagi pelanggan yang menginginkan bantuan tim admin untuk menyusun undangan.
        </p>
      </div>

      <CCard className="border-0 shadow-sm rounded-3 py-5 text-center">
        <CCardBody>
          <CIcon icon={cilNotes} size="xxl" className="text-muted opacity-50 mb-3" />
          <h5 className="fw-bold text-dark">Pusat Layanan Bantuan (PRD 06)</h5>
          <p className="text-muted small mx-auto" style={{ maxWidth: '500px' }}>
            Pelanggan dapat memesan layanan bantuan pembuatan undangan digital, dan tim admin dapat
            mengelola status tiket pengerjaan melalui modul ini.
          </p>
          <CButton
            color="dark"
            size="sm"
            onClick={() => navigate('/invitations/list')}
            style={{ backgroundColor: '#34342F' }}
          >
            Lihat Daftar Undangan <CIcon icon={cilArrowRight} className="ms-1" />
          </CButton>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default ServiceOrders
