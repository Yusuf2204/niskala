import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CButton,
  CBadge,
  CSpinner,
  CFormInput,
  CFormSelect,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilFolder,
  cilReload,
  cilPencil,
  cilExternalLink,
  cilPeople,
  cilChatBubble,
  cilCheckCircle,
} from '@coreui/icons'
import api from '../../services/api'
import { toastSuccess, toastError } from '../../services/toastService'
import { openInvitationPreviewTab, formatDateTimeId } from '../serviceOrders/serviceOrderHelpers'

const AdminInvitations = () => {
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.user)
  const isAdmin = currentUser?.role?.role_name === 'admin' || currentUser?.role_id === 1

  const [invitations, setInvitations] = useState([])
  const [summary, setSummary] = useState({ all: 0, draft: 0, published: 0, archived: 0 })
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  const [statusFilter, setStatusFilter] = useState('all')
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })

  const loadAdminInvitations = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    try {
      const params = { page, per_page: 15 }
      if (statusFilter !== 'all') params.status = statusFilter
      if (eventTypeFilter !== 'all') params.event_type = eventTypeFilter
      if (searchTerm.trim()) params.search = searchTerm.trim()

      const res = await api.get('/v1/admin/invitations', { params })
      const data = res.data.data || {}
      setSummary(data.summary || { all: 0, draft: 0, published: 0, archived: 0 })
      const paginator = data.items || {}
      setInvitations(paginator.data || [])
      setPagination({
        current_page: paginator.current_page || 1,
        last_page: paginator.last_page || 1,
        total: paginator.total || 0,
      })
    } catch {
      setInvitations([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin, page, statusFilter, eventTypeFilter, searchTerm])

  useEffect(() => {
    loadAdminInvitations()
  }, [loadAdminInvitations])

  const handlePublish = async (id) => {
    setActionLoading(true)
    try {
      await api.post(`/v1/invitations/${id}/publish`)
      toastSuccess('Undangan pelanggan berhasil dipublikasikan.')
      loadAdminInvitations()
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal memublikasikan undangan.')
    } finally {
      setActionLoading(false)
    }
  }

  if (!isAdmin) {
    return (
      <CAlert color="danger" className="my-4">
        Akses ditolak. Halaman ini hanya tersedia untuk tim Administrator.
      </CAlert>
    )
  }

  return (
    <div className="admin-invitations-container">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-body mb-1 d-flex align-items-center gap-2">
            <CIcon icon={cilFolder} className="text-secondary" /> Semua Undangan Pelanggan
          </h4>
          <p className="text-body-secondary small mb-0">
            Pantau seluruh undangan digital di platform, pemilik akun, status tayang, dan kolaborasi
            editor.
          </p>
        </div>

        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          onClick={loadAdminInvitations}
          disabled={loading}
          className="d-flex align-items-center gap-1"
        >
          <CIcon icon={cilReload} size="sm" /> Refresh
        </CButton>
      </div>

      {/* Summary */}
      <CRow className="g-3 mb-4">
        {[
          { label: 'Total Undangan', value: summary.all, color: 'primary' },
          { label: 'Draft', value: summary.draft, color: 'warning' },
          { label: 'Published', value: summary.published, color: 'success' },
          { label: 'Archived', value: summary.archived, color: 'secondary' },
        ].map((card) => (
          <CCol xs={6} lg={3} key={card.label}>
            <CCard
              className={`h-100 border-start border-start-4 border-start-${card.color} shadow-sm`}
            >
              <CCardBody className="py-3">
                <div className="small text-body-secondary mb-1">{card.label}</div>
                <div className="fs-4 fw-bold text-body">{card.value}</div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>

      {/* Filters */}
      <CCard className="border-0 shadow-sm mb-4 rounded-3">
        <CCardBody className="py-3">
          <CRow className="g-2 align-items-center">
            <CCol md={5}>
              <CFormInput
                size="sm"
                placeholder="Cari judul, slug, nama pemilik, atau email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
              />
            </CCol>
            <CCol sm={6} md={3}>
              <CFormSelect
                size="sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="all">Semua Status ({summary.all})</option>
                <option value="draft">Draft ({summary.draft})</option>
                <option value="published">Published ({summary.published})</option>
                <option value="archived">Archived ({summary.archived})</option>
              </CFormSelect>
            </CCol>
            <CCol sm={6} md={4}>
              <CFormSelect
                size="sm"
                value={eventTypeFilter}
                onChange={(e) => {
                  setEventTypeFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="all">Semua Kategori Acara</option>
                <option value="wedding">Wedding</option>
                <option value="birthday">Birthday</option>
                <option value="general">General</option>
              </CFormSelect>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Table */}
      <CCard className="border-0 shadow-sm rounded-3 overflow-hidden">
        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="secondary" />
              <p className="mt-2 small text-body-secondary">Memuat undangan pelanggan...</p>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-5">
              <p className="small text-body-secondary mb-0">
                Tidak ada undangan yang cocok dengan filter.
              </p>
            </div>
          ) : (
            <CTable align="middle" responsive hover className="mb-0">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Judul &amp; Slug</CTableHeaderCell>
                  <CTableHeaderCell>Pemilik (Pelanggan)</CTableHeaderCell>
                  <CTableHeaderCell>Tema</CTableHeaderCell>
                  <CTableHeaderCell>Statistik</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Dibuat</CTableHeaderCell>
                  <CTableHeaderCell className="text-end" style={{ minWidth: '240px' }}>
                    Tindakan
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {invitations.map((inv) => (
                  <CTableRow key={inv.id}>
                    <CTableDataCell>
                      <div className="fw-bold text-body">{inv.title}</div>
                      <small className="font-monospace text-body-secondary">/{inv.slug}</small>
                    </CTableDataCell>
                    <CTableDataCell>
                      <div className="fw-semibold text-body">{inv.user?.name || '-'}</div>
                      <small className="text-body-secondary">{inv.user?.email || '-'}</small>
                    </CTableDataCell>
                    <CTableDataCell className="small">
                      <div>{inv.theme?.name || 'Tema Standar'}</div>
                      <CBadge color="secondary" className="text-uppercase mt-1">
                        {inv.event_type}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="small text-body-secondary">
                      <div>{inv.guests_count ?? 0} Tamu</div>
                      <div>
                        {inv.rsvps_count ?? 0} RSVP • {inv.service_orders_count ?? 0} Tiket
                      </div>
                    </CTableDataCell>
                    <CTableDataCell>
                      <CBadge
                        shape="rounded-pill"
                        color={
                          inv.status === 'published'
                            ? 'success'
                            : inv.status === 'archived'
                              ? 'secondary'
                              : 'warning'
                        }
                        className="text-uppercase px-2 py-1"
                      >
                        {inv.status}
                      </CBadge>
                    </CTableDataCell>
                    <CTableDataCell className="small text-body-secondary">
                      {formatDateTimeId(inv.created_at)}
                    </CTableDataCell>
                    <CTableDataCell className="text-end">
                      <div className="d-flex justify-content-end gap-1 flex-wrap">
                        <CButton
                          size="sm"
                          color="secondary"
                          variant="outline"
                          title="Edit di Visual Editor"
                          onClick={() => navigate(`/invitations/${inv.id}/editor`)}
                        >
                          <CIcon icon={cilPencil} size="sm" /> Editor
                        </CButton>
                        <CButton
                          size="sm"
                          color="secondary"
                          variant="outline"
                          title="Buka Live Preview (/blank)"
                          onClick={() => openInvitationPreviewTab(inv.id)}
                        >
                          <CIcon icon={cilExternalLink} size="sm" />
                        </CButton>
                        <CButton
                          size="sm"
                          color="secondary"
                          variant="outline"
                          title="Kelola Buku Tamu"
                          onClick={() => navigate(`/guests/list?invitation_id=${inv.id}`)}
                        >
                          <CIcon icon={cilPeople} size="sm" />
                        </CButton>
                        <CButton
                          size="sm"
                          color="secondary"
                          variant="outline"
                          title="Rekap RSVP & Doa"
                          onClick={() => navigate(`/guests/rsvp?invitation_id=${inv.id}`)}
                        >
                          <CIcon icon={cilChatBubble} size="sm" />
                        </CButton>
                        {inv.status === 'draft' && (
                          <CButton
                            size="sm"
                            color="success"
                            variant="outline"
                            disabled={actionLoading}
                            title="Publikasikan Undangan"
                            onClick={() => handlePublish(inv.id)}
                          >
                            <CIcon icon={cilCheckCircle} size="sm" />
                          </CButton>
                        )}
                      </div>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {pagination.last_page > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 small text-body-secondary">
          <span>
            Halaman {pagination.current_page} dari {pagination.last_page} (Total {pagination.total}{' '}
            undangan)
          </span>
          <div className="d-flex gap-2">
            <CButton
              size="sm"
              color="secondary"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Sebelumnya
            </CButton>
            <CButton
              size="sm"
              color="secondary"
              variant="outline"
              disabled={page >= pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
            </CButton>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminInvitations
