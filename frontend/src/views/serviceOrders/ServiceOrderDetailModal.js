import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CBadge,
  CButton,
  CSpinner,
  CAlert,
  CFormCheck,
  CFormTextarea,
  CFormLabel,
  CRow,
  CCol,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilExternalLink,
  cilCheckCircle,
  cilPencil,
  cilActionUndo,
  cilXCircle,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { toastSuccess, toastError } from '../../services/toastService'
import {
  SERVICE_TYPE_META,
  ORDER_STATUS_META,
  AUDIT_ACTION_LABELS,
  formatDateTimeId,
  openInvitationPreviewTab,
} from './serviceOrderHelpers'

const ServiceOrderDetailModal = ({
  visible,
  orderId,
  isAdmin,
  onClose,
  onUpdated,
  onOpenAdminAction,
}) => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [publishOnApprove, setPublishOnApprove] = useState(true)
  const [showRevisionForm, setShowRevisionForm] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState('')

  const loadDetail = useCallback(async () => {
    if (!orderId || !visible) return
    setLoading(true)
    try {
      const res = await api.get(`/v1/service-orders/${orderId}`)
      setOrder(res.data.data)
    } catch {
      setOrder(null)
    } finally {
      setLoading(false)
    }
  }, [orderId, visible])

  useEffect(() => {
    if (visible) {
      setShowRevisionForm(false)
      setRevisionNotes('')
      setPublishOnApprove(true)
      loadDetail()
    }
  }, [visible, loadDetail])

  const handleApprove = async () => {
    if (!order) return
    setActionLoading(true)
    try {
      await api.post(`/v1/service-orders/${order.id}/approve`, {
        publish_invitation: Boolean(
          order.invitation && order.invitation.status === 'draft' && publishOnApprove,
        ),
      })
      toastSuccess('Hasil pengerjaan disetujui! Tiket layanan selesai.')
      await loadDetail()
      onUpdated()
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal menyetujui hasil pengerjaan.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSubmitRevision = async (e) => {
    e.preventDefault()
    if (!order || revisionNotes.trim().length < 5) {
      toastError('Tuliskan catatan revisi minimal 5 karakter.')
      return
    }
    setActionLoading(true)
    try {
      await api.post(`/v1/service-orders/${order.id}/request-revision`, {
        revision_notes: revisionNotes.trim(),
      })
      toastSuccess('Permintaan revisi dikirim ke tim admin.')
      setShowRevisionForm(false)
      setRevisionNotes('')
      await loadDetail()
      onUpdated()
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal mengirim permintaan revisi.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!order) return
    setActionLoading(true)
    try {
      await api.post(`/v1/service-orders/${order.id}/cancel`)
      toastSuccess('Tiket layanan dibatalkan.')
      await loadDetail()
      onUpdated()
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal membatalkan tiket.')
    } finally {
      setActionLoading(false)
    }
  }

  const statusMeta = ORDER_STATUS_META[order?.status] || ORDER_STATUS_META.pending_review
  const typeMeta = SERVICE_TYPE_META[order?.service_type] || SERVICE_TYPE_META.full_creation
  const canClientReview = order?.status === 'client_review'
  const canCancel = order && ['pending_review', 'in_progress'].includes(order.status)

  return (
    <CModal visible={visible} onClose={onClose} size="lg" scrollable>
      <CModalHeader>
        <CModalTitle className="fw-bold d-flex align-items-center gap-2 flex-wrap">
          <span>Detail Tiket {order?.order_number || ''}</span>
          {order && (
            <CBadge shape="rounded-pill" className={statusMeta.badgeClass}>
              {statusMeta.label}
            </CBadge>
          )}
        </CModalTitle>
      </CModalHeader>

      <CModalBody>
        {loading || !order ? (
          <div className="text-center py-5">
            <CSpinner color="secondary" />
            <p className="mt-2 small text-body-secondary">Memuat detail tiket...</p>
          </div>
        ) : (
          <>
            {/* Client Review Banner */}
            {canClientReview && (
              <CAlert color="primary" className="border-0 shadow-sm mb-4">
                <div className="fw-bold mb-1">Draf Pratinjau Siap Ditinjau!</div>
                <p className="small mb-3">
                  Tim admin telah menyelesaikan penyusunan undangan Anda. Silakan buka Live Preview
                  untuk memeriksa kesesuaian data, lalu pilih Setujui atau Minta Revisi.
                </p>
                <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                  {order.invitation && (
                    <CButton
                      size="sm"
                      className="btn-niskala-primary d-flex align-items-center gap-1"
                      onClick={() => openInvitationPreviewTab(order.invitation.id)}
                    >
                      <CIcon icon={cilExternalLink} size="sm" /> Buka Live Preview
                    </CButton>
                  )}
                  <CButton
                    size="sm"
                    color="success"
                    className="text-white d-flex align-items-center gap-1"
                    disabled={actionLoading}
                    onClick={handleApprove}
                  >
                    <CIcon icon={cilCheckCircle} size="sm" /> Setujui Hasil
                  </CButton>
                  <CButton
                    size="sm"
                    color="warning"
                    variant="outline"
                    disabled={actionLoading}
                    onClick={() => setShowRevisionForm((prev) => !prev)}
                    className="d-flex align-items-center gap-1"
                  >
                    <CIcon icon={cilActionUndo} size="sm" /> Minta Revisi
                  </CButton>
                </div>

                {order.invitation?.status === 'draft' && (
                  <CFormCheck
                    id="publishOnApproveCheck"
                    label="Sekalian publikasikan undangan ke status Published saat disetujui"
                    checked={publishOnApprove}
                    onChange={(e) => setPublishOnApprove(e.target.checked)}
                    className="small"
                  />
                )}

                {showRevisionForm && (
                  <form onSubmit={handleSubmitRevision} className="mt-3 pt-3 border-top">
                    <CFormLabel className="small fw-semibold">
                      Catatan Revisi untuk Admin
                    </CFormLabel>
                    <CFormTextarea
                      rows={3}
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      placeholder="Jelaskan bagian mana yang perlu diubah..."
                      required
                    />
                    <div className="mt-2 d-flex justify-content-end gap-2">
                      <CButton
                        size="sm"
                        color="secondary"
                        variant="ghost"
                        onClick={() => setShowRevisionForm(false)}
                      >
                        Tutup
                      </CButton>
                      <CButton
                        type="submit"
                        size="sm"
                        className="btn-niskala-gold"
                        disabled={actionLoading}
                      >
                        Kirim Revisi
                      </CButton>
                    </div>
                  </form>
                )}
              </CAlert>
            )}

            {/* Metadata Grid */}
            <CRow className="g-3 mb-4">
              <CCol sm={6}>
                <div className="p-3 rounded panel-card h-100">
                  <small
                    className="text-body-secondary text-uppercase fw-bold d-block mb-1"
                    style={{ fontSize: '0.7rem' }}
                  >
                    Informasi Tiket
                  </small>
                  <div className="small mb-1">
                    <strong>Jenis Layanan:</strong>{' '}
                    <CBadge color={typeMeta.color}>{typeMeta.label}</CBadge>
                  </div>
                  <div className="small mb-1">
                    <strong>Pemohon:</strong> {order.user?.name || '-'} ({order.user?.email || '-'})
                  </div>
                  <div className="small mb-1">
                    <strong>Admin Ditugaskan:</strong>{' '}
                    {order.assigned_admin?.name || (
                      <span className="text-body-secondary fst-italic">Belum ditugaskan</span>
                    )}
                  </div>
                  <div className="small">
                    <strong>Dibuat:</strong> {formatDateTimeId(order.created_at)}
                  </div>
                  {order.completed_at && (
                    <div className="small mt-1">
                      <strong>Selesai:</strong> {formatDateTimeId(order.completed_at)}
                    </div>
                  )}
                </div>
              </CCol>

              <CCol sm={6}>
                <div className="p-3 rounded panel-card h-100">
                  <small
                    className="text-body-secondary text-uppercase fw-bold d-block mb-1"
                    style={{ fontSize: '0.7rem' }}
                  >
                    Undangan Tertaut
                  </small>
                  {order.invitation ? (
                    <>
                      <div className="fw-bold text-body mb-1">{order.invitation.title}</div>
                      <div className="small font-monospace text-body-secondary mb-2">
                        /{order.invitation.slug} •{' '}
                        <span className="text-uppercase">{order.invitation.status}</span>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        <CButton
                          size="sm"
                          color="secondary"
                          variant="outline"
                          onClick={() => openInvitationPreviewTab(order.invitation.id)}
                          className="d-flex align-items-center gap-1"
                        >
                          <CIcon icon={cilExternalLink} size="sm" /> Preview
                        </CButton>
                        <CButton
                          size="sm"
                          className="btn-niskala-gold d-flex align-items-center gap-1"
                          onClick={() => {
                            onClose()
                            navigate(`/invitations/${order.invitation.id}/editor`)
                          }}
                        >
                          <CIcon icon={cilPencil} size="sm" /> Visual Editor
                        </CButton>
                      </div>
                    </>
                  ) : (
                    <div className="small text-body-secondary">
                      Belum ada undangan tertaut pada tiket ini.
                      {isAdmin && !['completed', 'cancelled'].includes(order.status) && (
                        <div className="mt-2">
                          <CButton
                            size="sm"
                            className="btn-niskala-gold"
                            onClick={() => {
                              onClose()
                              onOpenAdminAction(order, 'create_invitation')
                            }}
                          >
                            + Buatkan Draf Undangan Klien
                          </CButton>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CCol>
            </CRow>

            {/* Client & Internal Notes */}
            <div className="mb-3">
              <small
                className="text-body-secondary text-uppercase fw-bold d-block mb-1"
                style={{ fontSize: '0.72rem' }}
              >
                Catatan &amp; Instruksi Pelanggan
              </small>
              <div
                className="p-3 rounded border bg-body-secondary bg-opacity-25 small"
                style={{ whiteSpace: 'pre-wrap' }}
              >
                {order.client_notes || '-'}
              </div>
            </div>

            {isAdmin && (
              <div className="mb-4">
                <small
                  className="text-body-secondary text-uppercase fw-bold d-block mb-1"
                  style={{ fontSize: '0.72rem' }}
                >
                  Catatan Internal Tim Admin
                </small>
                <div
                  className="p-3 rounded border bg-body-secondary bg-opacity-25 small"
                  style={{ whiteSpace: 'pre-wrap' }}
                >
                  {order.admin_notes || (
                    <span className="text-body-secondary fst-italic">
                      Belum ada catatan internal admin.
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Activity Timeline */}
            <div>
              <small
                className="text-body-secondary text-uppercase fw-bold d-block mb-2"
                style={{ fontSize: '0.72rem' }}
              >
                Riwayat Aktivitas Tiket
              </small>
              {Array.isArray(order.timeline) && order.timeline.length > 0 ? (
                <div className="border rounded overflow-hidden">
                  {order.timeline.map((item) => (
                    <div
                      key={item.id}
                      className="px-3 py-2 border-bottom small d-flex justify-content-between align-items-start gap-2"
                    >
                      <div>
                        <div className="fw-semibold text-body">
                          {AUDIT_ACTION_LABELS[item.action] || item.action}
                        </div>
                        <div className="text-body-secondary" style={{ fontSize: '0.78rem' }}>
                          Oleh: {item.actor?.name || 'Sistem'}
                          {item.details?.old_status && item.details?.new_status
                            ? ` • ${item.details.old_status} → ${item.details.new_status}`
                            : ''}
                          {item.details?.revision_notes
                            ? ` • "${item.details.revision_notes}"`
                            : ''}
                        </div>
                      </div>
                      <span
                        className="text-body-secondary text-nowrap"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {formatDateTimeId(item.created_at)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="small text-body-secondary mb-0">
                  Belum ada riwayat aktivitas tercatat.
                </p>
              )}
            </div>
          </>
        )}
      </CModalBody>

      <CModalFooter className="justify-content-between">
        <div>
          {canCancel && order && (
            <CButton
              size="sm"
              color="danger"
              variant="outline"
              disabled={actionLoading}
              onClick={handleCancelOrder}
              className="d-flex align-items-center gap-1"
            >
              <CIcon icon={cilXCircle} size="sm" /> Batalkan Tiket
            </CButton>
          )}
        </div>
        <div className="d-flex gap-2">
          {isAdmin && order && !['completed', 'cancelled'].includes(order.status) && (
            <CButton
              size="sm"
              className="btn-niskala-primary"
              onClick={() => {
                onClose()
                onOpenAdminAction(order, 'status')
              }}
            >
              Kelola Status &amp; Penugasan
            </CButton>
          )}
          <CButton color="secondary" variant="outline" size="sm" onClick={onClose}>
            Tutup
          </CButton>
        </div>
      </CModalFooter>
    </CModal>
  )
}

ServiceOrderDetailModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  orderId: PropTypes.number,
  isAdmin: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onUpdated: PropTypes.func.isRequired,
  onOpenAdminAction: PropTypes.func.isRequired,
}

export default ServiceOrderDetailModal
