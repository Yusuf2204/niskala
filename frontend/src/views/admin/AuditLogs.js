import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilHistory, cilReload, cilZoom } from '@coreui/icons'
import api from '../../services/api'
import { AUDIT_ACTION_LABELS, formatDateTimeId } from '../serviceOrders/serviceOrderHelpers'

const AuditLogs = () => {
  const currentUser = useSelector((state) => state.user)
  const isAdmin = currentUser?.role?.role_name === 'admin' || currentUser?.role_id === 1

  const [logs, setLogs] = useState([])
  const [availableActions, setAvailableActions] = useState([])
  const [loading, setLoading] = useState(false)

  const [actionFilter, setActionFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [selectedLog, setSelectedLog] = useState(null)

  const loadLogs = useCallback(async () => {
    if (!isAdmin) return
    setLoading(true)
    try {
      const params = { page, per_page: 25 }
      if (actionFilter !== 'all') params.action = actionFilter
      if (searchTerm.trim()) params.search = searchTerm.trim()
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const res = await api.get('/v1/admin/audit-logs', { params })
      const data = res.data.data || {}
      setAvailableActions(data.available_actions || [])
      const paginator = data.items || {}
      setLogs(paginator.data || [])
      setPagination({
        current_page: paginator.current_page || 1,
        last_page: paginator.last_page || 1,
        total: paginator.total || 0,
      })
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [isAdmin, page, actionFilter, searchTerm, dateFrom, dateTo])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  if (!isAdmin) {
    return (
      <CAlert color="danger" className="my-4">
        Akses ditolak. Riwayat audit hanya dapat diakses oleh Administrator.
      </CAlert>
    )
  }

  return (
    <div className="audit-logs-container">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-body mb-1 d-flex align-items-center gap-2">
            <CIcon icon={cilHistory} className="text-secondary" /> Audit Trail &amp; Log Operasional
          </h4>
          <p className="text-body-secondary small mb-0">
            Catatan kronologis perubahan tiket layanan, penugasan admin, serta modifikasi undangan
            pelanggan.
          </p>
        </div>

        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          onClick={loadLogs}
          disabled={loading}
          className="d-flex align-items-center gap-1"
        >
          <CIcon icon={cilReload} size="sm" /> Refresh
        </CButton>
      </div>

      {/* Filters */}
      <CCard className="border-0 shadow-sm mb-4 rounded-3">
        <CCardBody className="py-3">
          <CRow className="g-2 align-items-center">
            <CCol md={4}>
              <CFormInput
                size="sm"
                placeholder="Cari aktor, email, aksi, target, atau IP..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPage(1)
                }}
              />
            </CCol>
            <CCol md={4}>
              <CFormSelect
                size="sm"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value)
                  setPage(1)
                }}
              >
                <option value="all">Semua Aksi</option>
                {availableActions.map((act) => (
                  <option key={act} value={act}>
                    {AUDIT_ACTION_LABELS[act] || act} ({act})
                  </option>
                ))}
              </CFormSelect>
            </CCol>
            <CCol xs={6} md={2}>
              <CFormInput
                size="sm"
                type="date"
                title="Dari Tanggal"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value)
                  setPage(1)
                }}
              />
            </CCol>
            <CCol xs={6} md={2}>
              <CFormInput
                size="sm"
                type="date"
                title="Sampai Tanggal"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value)
                  setPage(1)
                }}
              />
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>

      {/* Logs Table */}
      <CCard className="border-0 shadow-sm rounded-3 overflow-hidden">
        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="secondary" />
              <p className="mt-2 small text-body-secondary">Memuat audit logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-5">
              <p className="small text-body-secondary mb-0">
                Belum ada entri audit yang sesuai filter.
              </p>
            </div>
          ) : (
            <CTable align="middle" responsive hover className="mb-0">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell>Waktu</CTableHeaderCell>
                  <CTableHeaderCell>Pelaku (Actor)</CTableHeaderCell>
                  <CTableHeaderCell>Aksi</CTableHeaderCell>
                  <CTableHeaderCell>Target</CTableHeaderCell>
                  <CTableHeaderCell>IP Address</CTableHeaderCell>
                  <CTableHeaderCell className="text-end">Detail</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {logs.map((log) => {
                  const shortTarget = log.target_type ? log.target_type.split('\\').pop() : '-'

                  return (
                    <CTableRow key={log.id}>
                      <CTableDataCell className="small text-body-secondary text-nowrap">
                        {formatDateTimeId(log.created_at)}
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-semibold text-body">{log.user?.name || '-'}</div>
                        <small className="text-body-secondary">
                          {log.user?.email || '-'} •{' '}
                          <span className="text-uppercase">
                            {log.user?.role?.role_name || 'user'}
                          </span>
                        </small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-semibold small text-body">
                          {AUDIT_ACTION_LABELS[log.action] || log.action}
                        </div>
                        <CBadge color="secondary" className="font-monospace mt-1">
                          {log.action}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="small font-monospace">
                        {shortTarget} #{log.target_id}
                      </CTableDataCell>
                      <CTableDataCell className="small font-monospace text-body-secondary">
                        {log.ip_address || '-'}
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CButton
                          size="sm"
                          color="secondary"
                          variant="outline"
                          onClick={() => setSelectedLog(log)}
                        >
                          <CIcon icon={cilZoom} size="sm" /> Metadata
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {pagination.last_page > 1 && (
        <div className="d-flex justify-content-between align-items-center mt-3 small text-body-secondary">
          <span>
            Halaman {pagination.current_page} dari {pagination.last_page} (Total {pagination.total}{' '}
            log)
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

      {/* Details Modal */}
      <CModal visible={Boolean(selectedLog)} onClose={() => setSelectedLog(null)} size="lg">
        <CModalHeader>
          <CModalTitle className="fw-bold">Detail Audit #{selectedLog?.id}</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedLog && (
            <>
              <div className="small mb-3">
                <div>
                  <strong>Aksi:</strong>{' '}
                  <span className="font-monospace">{selectedLog.action}</span>
                </div>
                <div>
                  <strong>Pelaku:</strong> {selectedLog.user?.name} ({selectedLog.user?.email})
                </div>
                <div>
                  <strong>Target:</strong>{' '}
                  <span className="font-monospace">
                    {selectedLog.target_type} #{selectedLog.target_id}
                  </span>
                </div>
                <div>
                  <strong>Waktu:</strong> {formatDateTimeId(selectedLog.created_at)} •{' '}
                  <strong>IP:</strong> {selectedLog.ip_address || '-'}
                </div>
              </div>
              <pre
                className="p-3 rounded border bg-body-secondary small mb-0 overflow-auto"
                style={{ maxHeight: '360px' }}
              >
                {JSON.stringify(selectedLog.details || {}, null, 2)}
              </pre>
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => setSelectedLog(null)}
          >
            Tutup
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default AuditLogs
