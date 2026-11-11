import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormLabel,
  CFormSelect,
  CFormTextarea,
  CFormInput,
  CFormCheck,
  CButton,
  CSpinner,
  CNav,
  CNavItem,
  CNavLink,
} from '@coreui/react'
import api from '../../services/api'
import { toastSuccess, toastError } from '../../services/toastService'
import { ALLOWED_ADMIN_TRANSITIONS, ORDER_STATUS_META } from './serviceOrderHelpers'

const AdminOrderActionModal = ({
  visible,
  order,
  initialTab = 'status',
  admins = [],
  themes = [],
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [submitting, setSubmitting] = useState(false)

  // Status & notes state
  const [status, setStatus] = useState('in_progress')
  const [adminNotes, setAdminNotes] = useState('')
  const [invitationId, setInvitationId] = useState('')
  const [clientInvitations, setClientInvitations] = useState([])

  // Assignment state
  const [assignedAdminId, setAssignedAdminId] = useState('')
  const [startProgress, setStartProgress] = useState(true)

  // Create draft invitation state
  const [invTitle, setInvTitle] = useState('')
  const [invThemeId, setInvThemeId] = useState('')
  const [invEventType, setInvEventType] = useState('wedding')
  const [invDate, setInvDate] = useState('')
  const [invLocation, setInvLocation] = useState('')

  useEffect(() => {
    if (!visible || !order) return

    setActiveTab(initialTab)
    setStatus(order.status || 'pending_review')
    setAdminNotes(order.admin_notes || '')
    setInvitationId(order.invitation_id ? String(order.invitation_id) : '')
    setAssignedAdminId(order.assigned_admin_id ? String(order.assigned_admin_id) : '')
    setStartProgress(order.status === 'pending_review')

    setInvTitle(order.user?.name ? `Undangan ${order.user.name}` : 'Undangan Digital Baru')
    setInvThemeId(themes[0]?.id ? String(themes[0].id) : '')
    setInvEventType('wedding')
    setInvDate('')
    setInvLocation('')

    api
      .get('/v1/admin/invitations', { params: { user_id: order.user_id, per_page: 50 } })
      .then((res) => setClientInvitations(res.data.data?.items?.data || []))
      .catch(() => setClientInvitations([]))
  }, [visible, order, initialTab, themes])

  if (!order) return null

  const allowedStatuses = ALLOWED_ADMIN_TRANSITIONS[order.status] || [order.status]

  const handleSaveStatus = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.put(`/v1/admin/service-orders/${order.id}/status`, {
        status,
        admin_notes: adminNotes,
        invitation_id: invitationId ? Number(invitationId) : null,
      })
      toastSuccess('Status tiket & catatan admin berhasil diperbarui.')
      onSuccess()
      onClose()
    } catch (err) {
      const msg =
        err.response?.data?.errors?.invitation_id?.[0] ||
        err.response?.data?.errors?.status?.[0] ||
        err.response?.data?.message ||
        'Gagal memperbarui status tiket.'
      toastError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveAssignment = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.put(`/v1/admin/service-orders/${order.id}/assign`, {
        assigned_admin_id: assignedAdminId ? Number(assignedAdminId) : null,
        start_progress: Boolean(startProgress),
      })
      toastSuccess('Penugasan admin berhasil diperbarui.')
      onSuccess()
      onClose()
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal memperbarui penugasan.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateClientInvitation = async (e) => {
    e.preventDefault()
    if (!invTitle.trim()) {
      toastError('Judul undangan wajib diisi.')
      return
    }

    setSubmitting(true)
    try {
      await api.post(`/v1/admin/service-orders/${order.id}/create-invitation`, {
        title: invTitle.trim(),
        theme_id: invThemeId ? Number(invThemeId) : null,
        event_type: invEventType,
        event_title: invEventType === 'wedding' ? 'Akad Nikah & Resepsi' : 'Acara Utama',
        event_date: invDate || undefined,
        location_name: invLocation || undefined,
      })
      toastSuccess('Draf undangan berhasil dibuat atas nama pelanggan dan ditautkan.')
      onSuccess()
      onClose()
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal membuat draf undangan klien.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-bold">Kelola Tiket {order.order_number}</CModalTitle>
      </CModalHeader>
      <CModalBody>
        <CNav variant="tabs" className="mb-3">
          <CNavItem>
            <CNavLink
              active={activeTab === 'status'}
              onClick={() => setActiveTab('status')}
              role="button"
            >
              Status &amp; Tautan Undangan
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeTab === 'assign'}
              onClick={() => setActiveTab('assign')}
              role="button"
            >
              Penugasan Admin
            </CNavLink>
          </CNavItem>
          {!order.invitation_id && !['completed', 'cancelled'].includes(order.status) && (
            <CNavItem>
              <CNavLink
                active={activeTab === 'create_invitation'}
                onClick={() => setActiveTab('create_invitation')}
                role="button"
              >
                + Buat Undangan Klien
              </CNavLink>
            </CNavItem>
          )}
        </CNav>

        {activeTab === 'status' && (
          <CForm onSubmit={handleSaveStatus}>
            <div className="mb-3">
              <CFormLabel className="fw-semibold small">Status Pengerjaan</CFormLabel>
              <CFormSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                {allowedStatuses.map((st) => (
                  <option key={st} value={st}>
                    {ORDER_STATUS_META[st]?.label || st} ({st})
                  </option>
                ))}
              </CFormSelect>
            </div>

            <div className="mb-3">
              <CFormLabel className="fw-semibold small">Undangan Pelanggan Tertaut</CFormLabel>
              <CFormSelect value={invitationId} onChange={(e) => setInvitationId(e.target.value)}>
                <option value="">-- Belum Tertaut --</option>
                {clientInvitations.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.title} (/{inv.slug} — {inv.status})
                  </option>
                ))}
              </CFormSelect>
            </div>

            <div className="mb-3">
              <CFormLabel className="fw-semibold small">Catatan Internal Tim Admin</CFormLabel>
              <CFormTextarea
                rows={4}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Catatan internal pengerjaan, progres desain, atau hal yang perlu dicek..."
              />
            </div>

            <CModalFooter className="px-0 pb-0">
              <CButton color="secondary" variant="outline" onClick={onClose} disabled={submitting}>
                Batal
              </CButton>
              <CButton type="submit" className="btn-niskala-gold" disabled={submitting}>
                {submitting ? <CSpinner size="sm" className="me-1" /> : null}
                Simpan Status
              </CButton>
            </CModalFooter>
          </CForm>
        )}

        {activeTab === 'assign' && (
          <CForm onSubmit={handleSaveAssignment}>
            <div className="mb-3">
              <CFormLabel className="fw-semibold small">Pilih Admin Penanggung Jawab</CFormLabel>
              <CFormSelect
                value={assignedAdminId}
                onChange={(e) => setAssignedAdminId(e.target.value)}
              >
                <option value="">-- Belum Ditugaskan --</option>
                {admins.map((adm) => (
                  <option key={adm.id} value={adm.id}>
                    {adm.name} ({adm.email})
                  </option>
                ))}
              </CFormSelect>
            </div>

            {order.status === 'pending_review' && (
              <CFormCheck
                id="startProgressCheck"
                className="mb-3 small"
                label="Otomatis ubah status menjadi Sedang Dikerjakan (in_progress)"
                checked={startProgress}
                onChange={(e) => setStartProgress(e.target.checked)}
              />
            )}

            <CModalFooter className="px-0 pb-0">
              <CButton color="secondary" variant="outline" onClick={onClose} disabled={submitting}>
                Batal
              </CButton>
              <CButton type="submit" className="btn-niskala-gold" disabled={submitting}>
                {submitting ? <CSpinner size="sm" className="me-1" /> : null}
                Simpan Penugasan
              </CButton>
            </CModalFooter>
          </CForm>
        )}

        {activeTab === 'create_invitation' && (
          <CForm onSubmit={handleCreateClientInvitation}>
            <p className="small text-body-secondary">
              Draf undangan akan dibuat atas nama <strong>{order.user?.name}</strong> (
              {order.user?.email}) dan otomatis ditautkan ke tiket ini agar bisa langsung disunting
              di Visual Editor.
            </p>
            <div className="mb-3">
              <CFormLabel className="fw-semibold small">Judul Undangan</CFormLabel>
              <CFormInput value={invTitle} onChange={(e) => setInvTitle(e.target.value)} required />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <CFormLabel className="fw-semibold small">Tema Desain</CFormLabel>
                <CFormSelect value={invThemeId} onChange={(e) => setInvThemeId(e.target.value)}>
                  <option value="">-- Tema Standar --</option>
                  {themes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <div className="col-md-6">
                <CFormLabel className="fw-semibold small">Kategori Acara</CFormLabel>
                <CFormSelect value={invEventType} onChange={(e) => setInvEventType(e.target.value)}>
                  <option value="wedding">Pernikahan (wedding)</option>
                  <option value="birthday">Ulang Tahun (birthday)</option>
                  <option value="general">Acara Umum (general)</option>
                </CFormSelect>
              </div>
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <CFormLabel className="fw-semibold small">Tanggal Acara (Opsional)</CFormLabel>
                <CFormInput
                  type="date"
                  value={invDate}
                  onChange={(e) => setInvDate(e.target.value)}
                />
              </div>
              <div className="col-md-6">
                <CFormLabel className="fw-semibold small">Lokasi Utama (Opsional)</CFormLabel>
                <CFormInput
                  placeholder="Contoh: Pendopo Agung Yogyakarta"
                  value={invLocation}
                  onChange={(e) => setInvLocation(e.target.value)}
                />
              </div>
            </div>

            <CModalFooter className="px-0 pb-0">
              <CButton color="secondary" variant="outline" onClick={onClose} disabled={submitting}>
                Batal
              </CButton>
              <CButton type="submit" className="btn-niskala-gold" disabled={submitting}>
                {submitting ? <CSpinner size="sm" className="me-1" /> : null}
                Buat &amp; Tautkan Draf
              </CButton>
            </CModalFooter>
          </CForm>
        )}
      </CModalBody>
    </CModal>
  )
}

AdminOrderActionModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  order: PropTypes.object,
  initialTab: PropTypes.string,
  admins: PropTypes.array,
  themes: PropTypes.array,
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func.isRequired,
}

export default AdminOrderActionModal
