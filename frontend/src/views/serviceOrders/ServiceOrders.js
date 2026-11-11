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
  CButtonGroup,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilNotes,
  cilPlus,
  cilReload,
  cilExternalLink,
  cilPencil,
  cilZoom,
  cilSettings,
} from '@coreui/icons'
import api from '../../services/api'
import CreateServiceOrderModal from './CreateServiceOrderModal'
import ServiceOrderDetailModal from './ServiceOrderDetailModal'
import AdminOrderActionModal from './AdminOrderActionModal'
import {
  SERVICE_TYPE_META,
  ORDER_STATUS_META,
  formatDateTimeId,
  openInvitationPreviewTab,
} from './serviceOrderHelpers'

const ServiceOrders = () => {
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.user)
  const isAdmin = currentUser?.role?.role_name === 'admin' || currentUser?.role_id === 1

  // Admin can toggle between "admin_queue" and "my_tickets"
  const [viewMode, setViewMode] = useState(isAdmin ? 'admin_queue' : 'my_tickets')
  const [orders, setOrders] = useState([])
  const [summary, setSummary] = useState({
    all: 0,
    pending_review: 0,
    in_progress: 0,
    client_review: 0,
    completed: 0,
    cancelled: 0,
    unassigned: 0,
  })
  const [admins, setAdmins] = useState([])
  const [themes, setThemes] = useState([])
  const [myInvitations, setMyInvitations] = useState([])
  const [loading, setLoading] = useState(false)

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all')
  const [assignedFilter, setAssignedFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })

  // Modals
  const [createOpen, setCreateOpen] = useState(false)
  const [detailOrderId, setDetailOrderId] = useState(null)
  const [adminActionOrder, setAdminActionOrder] = useState(null)
  const [adminActionTab, setAdminActionTab] = useState('status')

  useEffect(() => {
    setViewMode(isAdmin ? 'admin_queue' : 'my_tickets')
  }, [isAdmin])

  const loadOrders = useCallback(async () => {
    setLoading(true)
    try {
      const isQueue = isAdmin && viewMode === 'admin_queue'
      const endpoint = isQueue ? '/v1/admin/service-orders' : '/v1/service-orders'
      const params = {
        page,
        per_page: 15,
      }
      if (statusFilter !== 'all') params.status = statusFilter
      if (serviceTypeFilter !== 'all') params.service_type = serviceTypeFilter
      if (isQueue && assignedFilter !== 'all') params.assigned_admin_id = assignedFilter
      if (searchTerm.trim()) params.search = searchTerm.trim()

      const res = await api.get(endpoint, { params })
      const data = res.data.data || {}
      setSummary(
        data.summary || {
          all: 0,
          pending_review: 0,
          in_progress: 0,
          client_review: 0,
          completed: 0,
          cancelled: 0,
          unassigned: 0,
        },
      )
      if (Array.isArray(data.admins)) {
        setAdmins(data.admins)
      }
      const paginator = data.items || {}
      setOrders(paginator.data || [])
      setPagination({
        current_page: paginator.current_page || 1,
        last_page: paginator.last_page || 1,
        total: paginator.total || 0,
      })
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin, viewMode, page, statusFilter, serviceTypeFilter, assignedFilter, searchTerm])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Load supplementary catalogs (own invitations & active themes for modals)
  useEffect(() => {
    api
      .get('/v1/invitations', { params: { per_page: 50 } })
      .then((res) => setMyInvitations(res.data.data?.data || res.data.data || []))
      .catch(() => setMyInvitations([]))

    if (isAdmin) {
      api
        .get('/v1/themes')
        .then((res) => setThemes(res.data.data || []))
        .catch(() => setThemes([]))
    }
  }, [isAdmin])

  const openAdminAction = (order, tab = 'status') => {
    setAdminActionOrder(order)
    setAdminActionTab(tab)
  }

  const statCards = [
    { label: 'Menunggu Review', value: summary.pending_review || 0, color: 'warning' },
    { label: 'Sedang Dikerjakan', value: summary.in_progress || 0, color: 'info' },
    { label: 'Perlu Review Klien', value: summary.client_review || 0, color: 'primary' },
    { label: 'Selesai', value: summary.completed || 0, color: 'success' },
  ]

  return (
    <div className="service-orders-container">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-body mb-1 d-flex align-items-center gap-2">
            <CIcon icon={cilNotes} className="text-secondary" />
            {isAdmin && viewMode === 'admin_queue'
              ? 'Antrean Layanan Bantuan Admin'
              : 'Layanan Bantuan Pembuatan Undangan'}
          </h4>
          <p className="text-body-secondary small mb-0">
            {isAdmin && viewMode === 'admin_queue'
              ? 'Kelola permintaan bantuan pelanggan, tugaskan admin, edit undangan klien, dan kirim pratinjau.'
              : 'Ajukan bantuan penyusunan atau kurasi undangan digital bersama tim admin Niskala.'}
          </p>
        </div>

        <div className="d-flex flex-wrap align-items-center gap-2">
          {isAdmin && (
            <CButtonGroup size="sm">
              <CButton
                color="secondary"
                variant={viewMode === 'admin_queue' ? undefined : 'outline'}
                onClick={() => {
                  setViewMode('admin_queue')
                  setPage(1)
                }}
              >
                Antrean Admin
              </CButton>
              <CButton
                color="secondary"
                variant={viewMode === 'my_tickets' ? undefined : 'outline'}
                onClick={() => {
                  setViewMode('my_tickets')
                  setPage(1)
                }}
              >
                Tiket Saya
              </CButton>
            </CButtonGroup>
          )}

          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={loadOrders}
            disabled={loading}
            className="d-flex align-items-center gap-1"
          >
            <CIcon icon={cilReload} size="sm" /> Refresh
          </CButton>

          <CButton
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="btn-niskala-gold d-flex align-items-center gap-1"
          >
            <CIcon icon={cilPlus} size="sm" /> Ajukan Bantuan
          </CButton>
        </div>
      </div>

      {/* Summary Cards */}
      <CRow className="g-3 mb-4">
        {statCards.map((card) => (
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
            <CCol md={4}>
              <CFormInput
                size="sm"
                placeholder="Cari nomor SRV, catatan, atau nama..."
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
                <option value="all">Semua Status ({summary.all || 0})</option>
                {Object.entries(ORDER_STATUS_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol sm={6} md={isAdmin && viewMode === 'admin_queue' ? 2 : 3}>
              <CFormSelect
                size="sm"
                value={serviceTypeFilter}
                onChange={(e) => {
                  setServiceTypeFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="all">Semua Layanan</option>
                {Object.entries(SERVICE_TYPE_META).map(([key, meta]) => (
                  <option key={key} value={key}>
                    {meta.label}
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            {isAdmin && viewMode === 'admin_queue' && (
              <CCol md={3}>
                <CFormSelect
                  size="sm"
                  value={assignedFilter}
                  onChange={(e) => {
                    setAssignedFilter(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="all">Semua Admin Penanggung Jawab</option>
                  <option value="unassigned">Belum Ditugaskan ({summary.unassigned || 0})</option>
                  {admins.map((adm) => (
                    <option key={adm.id} value={adm.id}>
                      {adm.name}
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
            )}
          </CRow>
        </CCardBody>
      </CCard>

      {/* Orders Table */}
      <CCard className="border-0 shadow-sm rounded-3 overflow-hidden">
        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="secondary" />
              <p className="mt-2 small text-body-secondary">Memuat daftar tiket layanan...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-5 px-3">
              <CIcon icon={cilNotes} size="xxl" className="text-body-secondary opacity-50 mb-3" />
              <h6 className="fw-bold text-body">Belum Ada Tiket Layanan</h6>
              <p className="small text-body-secondary mx-auto mb-3" style={{ maxWidth: '460px' }}>
                {isAdmin && viewMode === 'admin_queue'
                  ? 'Belum ada permintaan bantuan pelanggan yang sesuai dengan filter.'
                  : 'Anda belum pernah mengajukan permintaan bantuan pembuatan atau kurasi undangan.'}
              </p>
              <CButton size="sm" onClick={() => setCreateOpen(true)} className="btn-niskala-gold">
                + Ajukan Bantuan Sekarang
              </CButton>
            </div>
          ) : (
            <CTable align="middle" responsive hover className="mb-0">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Order ID &amp; Layanan</CTableHeaderCell>
                  {isAdmin && viewMode === 'admin_queue' && (
                    <CTableHeaderCell>Pelanggan</CTableHeaderCell>
                  )}
                  <CTableHeaderCell>Undangan Tertaut</CTableHeaderCell>
                  <CTableHeaderCell>Admin PIC</CTableHeaderCell>
                  <CTableHeaderCell>Status</CTableHeaderCell>
                  <CTableHeaderCell>Dibuat</CTableHeaderCell>
                  <CTableHeaderCell className="text-end" style={{ minWidth: '220px' }}>
                    Tindakan
                  </CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {orders.map((ord) => {
                  const statusMeta =
                    ORDER_STATUS_META[ord.status] || ORDER_STATUS_META.pending_review
                  const typeMeta =
                    SERVICE_TYPE_META[ord.service_type] || SERVICE_TYPE_META.full_creation

                  return (
                    <CTableRow key={ord.id}>
                      <CTableDataCell>
                        <div className="fw-bold font-monospace text-body">{ord.order_number}</div>
                        <CBadge color={typeMeta.color} className="mt-1">
                          {typeMeta.label}
                        </CBadge>
                      </CTableDataCell>

                      {isAdmin && viewMode === 'admin_queue' && (
                        <CTableDataCell>
                          <div className="fw-semibold text-body">{ord.user?.name || '-'}</div>
                          <small className="text-body-secondary">{ord.user?.email || '-'}</small>
                        </CTableDataCell>
                      )}

                      <CTableDataCell>
                        {ord.invitation ? (
                          <div>
                            <div className="fw-semibold text-body">{ord.invitation.title}</div>
                            <small className="text-body-secondary font-monospace">
                              /{ord.invitation.slug} ({ord.invitation.status})
                            </small>
                          </div>
                        ) : (
                          <span className="small text-body-secondary fst-italic">
                            Belum ditautkan
                          </span>
                        )}
                      </CTableDataCell>

                      <CTableDataCell className="small">
                        {ord.assigned_admin?.name || (
                          <span className="text-body-secondary fst-italic">Unassigned</span>
                        )}
                      </CTableDataCell>

                      <CTableDataCell>
                        <CBadge
                          shape="rounded-pill"
                          className={`px-2 py-1 ${statusMeta.badgeClass}`}
                        >
                          {statusMeta.label}
                        </CBadge>
                      </CTableDataCell>

                      <CTableDataCell className="small text-body-secondary">
                        {formatDateTimeId(ord.created_at)}
                      </CTableDataCell>

                      <CTableDataCell className="text-end">
                        <div className="d-flex justify-content-end gap-1 flex-wrap">
                          <CButton
                            size="sm"
                            color="secondary"
                            variant="outline"
                            title="Lihat Detail & Timeline"
                            onClick={() => setDetailOrderId(ord.id)}
                          >
                            <CIcon icon={cilZoom} size="sm" /> Detail
                          </CButton>

                          {ord.invitation && (
                            <CButton
                              size="sm"
                              color="secondary"
                              variant="outline"
                              title="Buka Live Preview (/blank)"
                              onClick={() => openInvitationPreviewTab(ord.invitation.id)}
                            >
                              <CIcon icon={cilExternalLink} size="sm" />
                            </CButton>
                          )}

                          {isAdmin && viewMode === 'admin_queue' && ord.invitation && (
                            <CButton
                              size="sm"
                              color="info"
                              variant="outline"
                              title="Edit Undangan di Visual Editor"
                              onClick={() => navigate(`/invitations/${ord.invitation.id}/editor`)}
                            >
                              <CIcon icon={cilPencil} size="sm" />
                            </CButton>
                          )}

                          {isAdmin &&
                            viewMode === 'admin_queue' &&
                            !['completed', 'cancelled'].includes(ord.status) && (
                              <CButton
                                size="sm"
                                className="btn-niskala-gold"
                                title="Kelola Status / Tugaskan Admin"
                                onClick={() => openAdminAction(ord, 'status')}
                              >
                                <CIcon icon={cilSettings} size="sm" /> Kelola
                              </CButton>
                            )}
                        </div>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Pagination */}
      {pagination.last_page > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 small text-body-secondary">
          <span>
            Halaman {pagination.current_page} dari {pagination.last_page} (Total {pagination.total}{' '}
            tiket)
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

      {/* Modals */}
      <CreateServiceOrderModal
        visible={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadOrders}
        myInvitations={myInvitations}
      />

      <ServiceOrderDetailModal
        visible={Boolean(detailOrderId)}
        orderId={detailOrderId}
        isAdmin={isAdmin}
        onClose={() => setDetailOrderId(null)}
        onUpdated={loadOrders}
        onOpenAdminAction={openAdminAction}
      />

      <AdminOrderActionModal
        visible={Boolean(adminActionOrder)}
        order={adminActionOrder}
        initialTab={adminActionTab}
        admins={admins}
        themes={themes}
        onClose={() => setAdminActionOrder(null)}
        onSuccess={loadOrders}
      />
    </div>
  )
}

export default ServiceOrders
