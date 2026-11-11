import React, { useEffect, useState, useCallback, useRef } from 'react'
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
  CFormLabel,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilChatBubble, cilReload, cilCloudDownload, cilPeople, cilSearch } from '@coreui/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import { toastSuccess, toastError } from '../../services/toastService'
import { ATTENDANCE_LABELS, ATTENDANCE_COLORS, formatDateTimeId } from './guestHelpers'

const EMPTY_SUMMARY = {
  total_submissions: 0,
  attending_count: 0,
  not_attending_count: 0,
  tentative_count: 0,
  total_attending_pax: 0,
  hidden_count: 0,
}

const RsvpList = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [invitations, setInvitations] = useState([])
  const [selectedInvitationId, setSelectedInvitationId] = useState(
    () => searchParams.get('invitationId') || '',
  )
  const initialQueryIdRef = useRef(searchParams.get('invitationId'))
  const [loadingInvitations, setLoadingInvitations] = useState(true)

  const [rsvps, setRsvps] = useState([])
  const [invitationDetail, setInvitationDetail] = useState(null)
  const [summary, setSummary] = useState(EMPTY_SUMMARY)
  const [loadingRsvps, setLoadingRsvps] = useState(false)

  const [statusFilter, setStatusFilter] = useState('all')
  const [visibilityFilter, setVisibilityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [moderatingId, setModeratingId] = useState(null)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchInvitations = async () => {
      setLoadingInvitations(true)
      try {
        const res = await api.get('/v1/invitations', { params: { per_page: 100 } })
        const list = res.data?.data?.data || []
        setInvitations(list)

        if (list.length > 0) {
          const queryId = initialQueryIdRef.current
          const exists = list.some((inv) => String(inv.id) === String(queryId))
          setSelectedInvitationId(exists ? String(queryId) : String(list[0].id))
        }
      } catch {
        toastError('Gagal memuat daftar undangan.')
      } finally {
        setLoadingInvitations(false)
      }
    }

    fetchInvitations()
  }, [])

  const fetchRsvps = useCallback(async () => {
    if (!selectedInvitationId) return
    setLoadingRsvps(true)
    try {
      const res = await api.get(`/v1/invitations/${selectedInvitationId}/rsvps`, {
        params: {
          per_page: 100,
          attendance_status: statusFilter !== 'all' ? statusFilter : undefined,
          is_hidden: visibilityFilter !== 'all' ? visibilityFilter : undefined,
          search: searchTerm.trim() || undefined,
        },
      })
      const payload = res.data?.data || {}
      setInvitationDetail(payload.invitation || null)
      setSummary(payload.summary || EMPTY_SUMMARY)
      setRsvps(payload.items?.data || [])
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal memuat data RSVP.')
      setRsvps([])
    } finally {
      setLoadingRsvps(false)
    }
  }, [selectedInvitationId, statusFilter, visibilityFilter, searchTerm])

  useEffect(() => {
    fetchRsvps()
  }, [fetchRsvps])

  const handleSelectInvitation = (newId) => {
    setSelectedInvitationId(newId)
    setSearchParams(newId ? { invitationId: newId } : {})
  }

  const handleToggleModerate = async (rsvp) => {
    if (!selectedInvitationId) return
    setModeratingId(rsvp.id)
    try {
      const nextHidden = !rsvp.is_hidden
      await api.put(`/v1/invitations/${selectedInvitationId}/rsvps/${rsvp.id}/moderate`, {
        is_hidden: nextHidden,
      })
      toastSuccess(
        nextHidden ? 'Ucapan disembunyikan dari publik.' : 'Ucapan ditampilkan kembali ke publik.',
      )
      fetchRsvps()
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal memperbarui status moderasi.')
    } finally {
      setModeratingId(null)
    }
  }

  const handleExportCsv = async () => {
    if (!selectedInvitationId) return
    setExporting(true)
    try {
      const res = await api.get(`/v1/invitations/${selectedInvitationId}/rsvps/export`, {
        responseType: 'blob',
      })
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' })
      const downloadUrl = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = downloadUrl
      anchor.download = `rsvp-${invitationDetail?.slug || selectedInvitationId}.csv`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(downloadUrl)
      toastSuccess('File CSV rekap RSVP berhasil diunduh.')
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal mengekspor data RSVP.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="rsvp-list-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-body mb-1 d-flex align-items-center gap-2">
            <CIcon icon={cilChatBubble} className="text-secondary" /> Rekapitulasi RSVP &amp; Doa
            Restu
          </h4>
          <p className="text-body-secondary small mb-0">
            Pantau konfirmasi kehadiran tamu, jumlah perkiraan hadir, moderasi ucapan, dan ekspor
            CSV.
          </p>
        </div>

        {selectedInvitationId && (
          <div className="d-flex gap-2 flex-wrap">
            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              className="text-body"
              onClick={() => navigate(`/guests/list?invitationId=${selectedInvitationId}`)}
            >
              <CIcon icon={cilPeople} size="sm" className="me-1" /> Buku Tamu
            </CButton>
            <CButton
              size="sm"
              className="btn-niskala-gold"
              onClick={handleExportCsv}
              disabled={exporting}
            >
              <CIcon icon={cilCloudDownload} size="sm" className="me-1" />
              {exporting ? 'Mengunduh...' : 'Ekspor CSV'}
            </CButton>
          </div>
        )}
      </div>

      {/* Selector Undangan & Summary Cards */}
      <CCard className="mb-3 border-0 shadow-sm rounded-3">
        <CCardBody className="py-3">
          {loadingInvitations ? (
            <div className="d-flex align-items-center gap-2 text-body-secondary small">
              <CSpinner size="sm" /> Memuat daftar undangan...
            </div>
          ) : invitations.length === 0 ? (
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span className="text-body-secondary small">
                Anda belum memiliki undangan untuk dipantau.
              </span>
              <CButton
                size="sm"
                className="btn-niskala-gold"
                onClick={() => navigate('/invitations/create')}
              >
                Buat Undangan Baru
              </CButton>
            </div>
          ) : (
            <CRow className="g-3 align-items-end">
              <CCol lg={4}>
                <CFormLabel className="small fw-semibold text-body mb-1">Pilih Undangan</CFormLabel>
                <CFormSelect
                  size="sm"
                  value={selectedInvitationId}
                  onChange={(e) => handleSelectInvitation(e.target.value)}
                >
                  {invitations.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.title} ({inv.status})
                    </option>
                  ))}
                </CFormSelect>
              </CCol>
              <CCol lg={8}>
                <CRow className="g-2">
                  <CCol xs={6} sm={3}>
                    <div className="p-2 rounded border text-center">
                      <div className="small text-body-secondary">Hadir</div>
                      <div className="fw-bold fs-5 text-success">{summary.attending_count}</div>
                      <small className="text-body-secondary">
                        ({summary.total_attending_pax} pax)
                      </small>
                    </div>
                  </CCol>
                  <CCol xs={6} sm={3}>
                    <div className="p-2 rounded border text-center">
                      <div className="small text-body-secondary">Ragu-ragu</div>
                      <div className="fw-bold fs-5 text-warning">{summary.tentative_count}</div>
                      <small className="text-body-secondary">konfirmasi</small>
                    </div>
                  </CCol>
                  <CCol xs={6} sm={3}>
                    <div className="p-2 rounded border text-center">
                      <div className="small text-body-secondary">Tidak Hadir</div>
                      <div className="fw-bold fs-5 text-danger">{summary.not_attending_count}</div>
                      <small className="text-body-secondary">konfirmasi</small>
                    </div>
                  </CCol>
                  <CCol xs={6} sm={3}>
                    <div className="p-2 rounded border text-center">
                      <div className="small text-body-secondary">Disembunyikan</div>
                      <div className="fw-bold fs-5 text-body">{summary.hidden_count}</div>
                      <small className="text-body-secondary">
                        dari {summary.total_submissions} total
                      </small>
                    </div>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          )}
        </CCardBody>
      </CCard>

      {/* Filter & Tabel RSVP */}
      {selectedInvitationId && (
        <CCard className="border-0 shadow-sm rounded-3">
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div className="d-flex gap-2 flex-wrap align-items-center">
                <CFormSelect
                  size="sm"
                  style={{ width: '155px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Kehadiran</option>
                  <option value="attending">Hadir</option>
                  <option value="tentative">Ragu-ragu</option>
                  <option value="not_attending">Tidak Hadir</option>
                </CFormSelect>

                <CFormSelect
                  size="sm"
                  style={{ width: '165px' }}
                  value={visibilityFilter}
                  onChange={(e) => setVisibilityFilter(e.target.value)}
                >
                  <option value="all">Semua Visibilitas</option>
                  <option value="false">Ditampilkan di Publik</option>
                  <option value="true">Disembunyikan</option>
                </CFormSelect>

                <div className="position-relative" style={{ width: '240px' }}>
                  <CFormInput
                    size="sm"
                    placeholder="Cari nama atau isi ucapan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ paddingLeft: '28px' }}
                  />
                  <CIcon
                    icon={cilSearch}
                    size="sm"
                    className="position-absolute top-50 translate-middle-y text-body-secondary"
                    style={{ left: '9px' }}
                  />
                </div>
              </div>

              <CButton
                color="secondary"
                variant="outline"
                size="sm"
                className="text-body"
                onClick={fetchRsvps}
                disabled={loadingRsvps}
              >
                <CIcon icon={cilReload} size="sm" className="me-1" /> Muat Ulang
              </CButton>
            </div>

            {loadingRsvps ? (
              <div className="text-center py-5">
                <CSpinner color="secondary" />
                <p className="mt-2 small text-body-secondary">Memuat rekap RSVP...</p>
              </div>
            ) : rsvps.length === 0 ? (
              <div className="text-center py-5 text-body-secondary">
                Belum ada konfirmasi RSVP maupun ucapan dari tamu pada filter ini.
              </div>
            ) : (
              <CTable hover responsive align="middle" className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Tamu</CTableHeaderCell>
                    <CTableHeaderCell>Kehadiran</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Pax</CTableHeaderCell>
                    <CTableHeaderCell>Ucapan &amp; Doa Restu</CTableHeaderCell>
                    <CTableHeaderCell>Status Publik</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Moderasi</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {rsvps.map((rsvp) => (
                    <CTableRow key={rsvp.id}>
                      <CTableDataCell>
                        <div className="fw-semibold text-body">{rsvp.guest_name}</div>
                        <small className="text-body-secondary">
                          {rsvp.guest?.category ? `${rsvp.guest.category} • ` : ''}
                          {formatDateTimeId(rsvp.created_at)}
                        </small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={ATTENDANCE_COLORS[rsvp.attendance_status] || 'secondary'}>
                          {ATTENDANCE_LABELS[rsvp.attendance_status] || rsvp.attendance_status}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-center fw-semibold">
                        {rsvp.pax_count}
                      </CTableDataCell>
                      <CTableDataCell style={{ maxWidth: '340px' }}>
                        <span className="small text-body" style={{ whiteSpace: 'pre-line' }}>
                          {rsvp.message || <em className="text-body-secondary">(Tanpa ucapan)</em>}
                        </span>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={rsvp.is_hidden ? 'secondary' : 'info'}>
                          {rsvp.is_hidden ? 'Disembunyikan' : 'Ditampilkan'}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <CButton
                          color={rsvp.is_hidden ? 'success' : 'secondary'}
                          size="sm"
                          variant="outline"
                          className={rsvp.is_hidden ? '' : 'text-body'}
                          disabled={moderatingId === rsvp.id}
                          onClick={() => handleToggleModerate(rsvp)}
                        >
                          {moderatingId === rsvp.id
                            ? 'Memproses...'
                            : rsvp.is_hidden
                              ? 'Tampilkan'
                              : 'Sembunyikan'}
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            )}
          </CCardBody>
        </CCard>
      )}
    </div>
  )
}

export default RsvpList
