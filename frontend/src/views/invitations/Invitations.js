import React, { useEffect, useState, useMemo } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CButton,
  CBadge,
  CSpinner,
  CFormInput,
  CButtonGroup,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilEnvelopeClosed,
  cilPlus,
  cilReload,
  cilPencil,
  cilTrash,
  cilExternalLink,
  cilCheckCircle,
  cilFolder,
  cilSearch,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { toastSuccess, toastError } from '../../services/toastService'

const Invitations = () => {
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteId, setDeleteId] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const navigate = useNavigate()

  const fetchInvitations = async () => {
    setLoading(true)
    try {
      const res = await api.get('/v1/invitations')
      const items = res.data.data?.data || res.data.data || []
      setInvitations(items)
    } catch {
      setInvitations([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInvitations()
  }, [])

  const filteredInvitations = useMemo(() => {
    return invitations.filter((inv) => {
      const matchStatus = statusFilter === 'all' || inv.status === statusFilter
      const matchSearch =
        !searchTerm ||
        inv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.slug?.toLowerCase().includes(searchTerm.toLowerCase())
      return matchStatus && matchSearch
    })
  }, [invitations, statusFilter, searchTerm])

  const counts = useMemo(() => {
    return {
      all: invitations.length,
      draft: invitations.filter((i) => i.status === 'draft').length,
      published: invitations.filter((i) => i.status === 'published').length,
      archived: invitations.filter((i) => i.status === 'archived').length,
    }
  }, [invitations])

  const handlePublish = async (id) => {
    setActionLoading(true)
    try {
      await api.post(`/v1/invitations/${id}/publish`)
      toastSuccess('Undangan berhasil dipublikasikan!')
      fetchInvitations()
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal memublikasikan undangan.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleArchive = async (id) => {
    setActionLoading(true)
    try {
      await api.post(`/v1/invitations/${id}/archive`)
      toastSuccess('Undangan berhasil diarsipkan.')
      fetchInvitations()
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal mengarsipkan undangan.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteId) return
    setActionLoading(true)
    try {
      await api.delete(`/v1/invitations/${deleteId}`)
      toastSuccess('Undangan berhasil dihapus.')
      setDeleteId(null)
      fetchInvitations()
    } catch {
      toastError('Gagal menghapus undangan.')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'published':
        return (
          <CBadge color="success" shape="rounded-pill" className="px-2 py-1">
            Published
          </CBadge>
        )
      case 'archived':
        return (
          <CBadge color="secondary" shape="rounded-pill" className="px-2 py-1">
            Archived
          </CBadge>
        )
      default:
        return (
          <CBadge
            shape="rounded-pill"
            className="px-2 py-1"
            style={{ backgroundColor: '#D4A373', color: '#242420' }}
          >
            Draft
          </CBadge>
        )
    }
  }

  return (
    <div className="invitations-container">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-body mb-1 d-flex align-items-center gap-2">
            <CIcon icon={cilEnvelopeClosed} className="text-secondary" /> Daftar Undangan Digital
          </h4>
          <p className="text-body-secondary mb-0 small">
            Kelola seluruh undangan pernikahan, ulang tahun, dan acara spesial Anda dalam satu panel.
          </p>
        </div>
        <div className="d-flex gap-2">
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={fetchInvitations}
            disabled={loading}
          >
            <CIcon icon={cilReload} className="me-1" /> Refresh
          </CButton>
          <CButton
            size="sm"
            onClick={() => navigate('/invitations/create')}
            className="btn-niskala-gold"
          >
            <CIcon icon={cilPlus} className="me-1" /> + Buat Undangan Baru
          </CButton>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <CRow className="g-3 mb-4">
        <CCol xs={6} md={3}>
          <CCard className="border-0 shadow-sm rounded-3">
            <CCardBody className="p-3 text-center">
              <span className="small text-body-secondary d-block mb-1">Total Undangan</span>
              <h3 className="fw-bold mb-0 text-body">{counts.all}</h3>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} md={3}>
          <CCard className="border-0 shadow-sm rounded-3">
            <CCardBody className="p-3 text-center">
              <span className="small text-muted d-block mb-1">Draft / Proses</span>
              <h3 className="fw-bold mb-0 text-warning">{counts.draft}</h3>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} md={3}>
          <CCard className="border-0 shadow-sm rounded-3">
            <CCardBody className="p-3 text-center">
              <span className="small text-muted d-block mb-1">Live / Published</span>
              <h3 className="fw-bold mb-0 text-success">{counts.published}</h3>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={6} md={3}>
          <CCard className="border-0 shadow-sm rounded-3">
            <CCardBody className="p-3 text-center">
              <span className="small text-muted d-block mb-1">Diarsipkan</span>
              <h3 className="fw-bold mb-0 text-secondary">{counts.archived}</h3>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Filter Tabs & Search */}
      <CCard className="border-0 shadow-sm rounded-3 mb-4">
        <CCardBody className="p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <CButtonGroup size="sm" role="group">
              <CButton
                color={statusFilter === 'all' ? 'dark' : 'light'}
                onClick={() => setStatusFilter('all')}
              >
                Semua ({counts.all})
              </CButton>
              <CButton
                color={statusFilter === 'draft' ? 'dark' : 'light'}
                onClick={() => setStatusFilter('draft')}
              >
                Draft ({counts.draft})
              </CButton>
              <CButton
                color={statusFilter === 'published' ? 'dark' : 'light'}
                onClick={() => setStatusFilter('published')}
              >
                Published ({counts.published})
              </CButton>
              <CButton
                color={statusFilter === 'archived' ? 'dark' : 'light'}
                onClick={() => setStatusFilter('archived')}
              >
                Archived ({counts.archived})
              </CButton>
            </CButtonGroup>

            <div style={{ maxWidth: '260px' }} className="w-100 position-relative">
              <CFormInput
                size="sm"
                type="text"
                placeholder="Cari judul atau slug..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CCardBody>
      </CCard>

      {/* Main Table */}
      <CCard className="border-0 shadow-sm rounded-3 overflow-hidden">
        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="secondary" />
              <p className="mt-2 text-muted small">Memuat daftar undangan...</p>
            </div>
          ) : filteredInvitations.length === 0 ? (
            <div className="text-center py-5">
              <CIcon icon={cilFolder} size="xxl" className="text-body-secondary opacity-50 mb-3" />
              <h6 className="fw-bold text-body">Belum Ada Undangan</h6>
              <p className="text-body-secondary small mb-3">
                Mulai buat undangan digital pertama Anda dengan memilih tema pilihan.
              </p>
              <CButton
                size="sm"
                onClick={() => navigate('/invitations/create')}
                className="btn-niskala-gold"
              >
                + Buat Undangan Sekarang
              </CButton>
            </div>
          ) : (
            <CTable align="middle" responsive hover className="mb-0">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Judul & Slug</CTableHeaderCell>
                  <CTableHeaderCell>Tema Desain</CTableHeaderCell>
                  <CTableHeaderCell>Kategori</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Tanggal Dibuat</CTableHeaderCell>
                  <CTableHeaderCell className="text-end" style={{ minWidth: '220px' }}>
                    Tindakan
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {filteredInvitations.map((inv) => (
                  <CTableRow key={inv.id}>
                    <CTableDataCell>
                      <div className="fw-bold text-body">{inv.title}</div>
                      <small className="text-body-secondary d-flex align-items-center gap-1 font-monospace">
                        /{inv.slug}
                      </small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <span className="fw-semibold text-body-secondary">
                        {inv.theme?.name || 'Tema Standar'}
                      </span>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge color="secondary" className="border text-body">
                        {inv.event_type || 'wedding'}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell>{getStatusBadge(inv.status)}</CTableDataCell>
                    <CTableDataCell className="small text-body-secondary">
                      {new Date(inv.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <div className="d-flex justify-content-end gap-1">
                        {/* Buka Editor Visual */}
                        <CButton
                          color="secondary"
                          size="sm"
                          variant="outline"
                          title="Buka Visual Editor"
                          onClick={() => navigate(`/invitations/${inv.id}/editor`)}
                          className="text-body"
                        >
                          <CIcon icon={cilPencil} size="sm" /> Editor
                        </CButton>

                        {/* Publish jika masih draft */}
                        {inv.status === 'draft' && (
                          <CButton
                            color="success"
                            size="sm"
                            variant="outline"
                            title="Publikasikan Undangan"
                            onClick={() => handlePublish(inv.id)}
                            disabled={actionLoading}
                          >
                            <CIcon icon={cilCheckCircle} size="sm" /> Publish
                          </CButton>
                        )}

                        {/* Buka Publik */}
                        {inv.status === 'published' && (
                          <CButton
                            color="info"
                            size="sm"
                            variant="outline"
                            title="Buka Undangan Web Publik"
                            onClick={() => window.open(`/#/p/${inv.slug}`, '_blank')}
                          >
                            <CIcon icon={cilExternalLink} size="sm" /> Publik
                          </CButton>
                        )}

                        {/* Hapus */}
                        <CButton
                          color="danger"
                          size="sm"
                          variant="ghost"
                          title="Hapus Undangan"
                          onClick={() => setDeleteId(inv.id)}
                        >
                          <CIcon icon={cilTrash} size="sm" />
                        </CButton>
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Modal Konfirmasi Hapus */}
      <CModal visible={!!deleteId} onClose={() => setDeleteId(null)}>
        <CModalHeader>
          <CModalTitle className="fw-bold">Konfirmasi Hapus Undangan</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <p className="mb-0 text-muted">
            Apakah Anda yakin ingin menghapus undangan ini? Tindakan ini tidak dapat dibatalkan
            dan seluruh konten sections terkait akan terhapus.
          </p>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setDeleteId(null)}>
            Batal
          </CButton>
          <CButton color="danger" onClick={handleConfirmDelete} disabled={actionLoading}>
            {actionLoading ? 'Menghapus...' : 'Ya, Hapus'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Invitations

