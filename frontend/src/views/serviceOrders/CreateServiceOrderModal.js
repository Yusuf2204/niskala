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
  CButton,
  CSpinner,
  CAlert,
} from '@coreui/react'
import api from '../../services/api'
import { toastSuccess, toastError } from '../../services/toastService'
import { SERVICE_TYPE_META } from './serviceOrderHelpers'

const CreateServiceOrderModal = ({ visible, onClose, onCreated, myInvitations = [] }) => {
  const [serviceType, setServiceType] = useState('full_creation')
  const [invitationId, setInvitationId] = useState('')
  const [clientNotes, setClientNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState('')

  useEffect(() => {
    if (visible) {
      setServiceType('full_creation')
      setInvitationId('')
      setClientNotes('')
      setFieldError('')
    }
  }, [visible])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!clientNotes || clientNotes.trim().length < 10) {
      setFieldError(
        'Mohon isi catatan instruksi minimal 10 karakter agar admin memahami kebutuhan Anda.',
      )
      return
    }

    setSubmitting(true)
    setFieldError('')
    try {
      await api.post('/v1/service-orders', {
        service_type: serviceType,
        invitation_id: invitationId ? Number(invitationId) : null,
        client_notes: clientNotes.trim(),
      })
      toastSuccess('Tiket permintaan bantuan berhasil dikirim ke tim admin.')
      onCreated()
      onClose()
    } catch (err) {
      const msg =
        err.response?.data?.errors?.client_notes?.[0] ||
        err.response?.data?.errors?.invitation_id?.[0] ||
        err.response?.data?.message ||
        'Gagal mengirim permintaan bantuan.'
      setFieldError(msg)
      toastError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <CModal visible={visible} onClose={onClose} backdrop="static" size="lg">
      <CModalHeader>
        <CModalTitle className="fw-bold">Ajukan Layanan Bantuan Admin</CModalTitle>
      </CModalHeader>
      <CForm onSubmit={handleSubmit}>
        <CModalBody>
          {fieldError && (
            <CAlert color="danger" className="small py-2">
              {fieldError}
            </CAlert>
          )}

          <div className="mb-3">
            <CFormLabel className="fw-semibold small">Jenis Bantuan yang Dibutuhkan</CFormLabel>
            <CFormSelect value={serviceType} onChange={(e) => setServiceType(e.target.value)}>
              {Object.entries(SERVICE_TYPE_META).map(([key, meta]) => (
                <option key={key} value={key}>
                  {meta.label}
                </option>
              ))}
            </CFormSelect>
            <div className="form-text text-body-secondary">
              {SERVICE_TYPE_META[serviceType]?.description}
            </div>
          </div>

          <div className="mb-3">
            <CFormLabel className="fw-semibold small">
              Tautkan Undangan yang Sudah Ada{' '}
              <span className="text-body-secondary fw-normal">(Opsional)</span>
            </CFormLabel>
            <CFormSelect value={invitationId} onChange={(e) => setInvitationId(e.target.value)}>
              <option value="">-- Belum Ada / Buatkan Draf Baru oleh Admin --</option>
              {myInvitations.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.title} (/{inv.slug} — {inv.status})
                </option>
              ))}
            </CFormSelect>
            <div className="form-text text-body-secondary">
              Pilih draf undangan bila Anda sudah membuatnya, atau kosongkan agar tim admin
              menyiapkan dari awal.
            </div>
          </div>

          <div className="mb-2">
            <CFormLabel className="fw-semibold small">
              Catatan &amp; Instruksi Acara <span className="text-danger">*</span>
            </CFormLabel>
            <CFormTextarea
              rows={5}
              placeholder="Tuliskan nama mempelai/acara, tanggal, lokasi, tema yang diinginkan, nuansa tulisan, atau bagian yang ingin dirapikan..."
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
              required
            />
          </div>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="outline" onClick={onClose} disabled={submitting}>
            Batal
          </CButton>
          <CButton type="submit" className="btn-niskala-gold" disabled={submitting}>
            {submitting ? <CSpinner size="sm" className="me-1" /> : null}
            Kirim Permintaan
          </CButton>
        </CModalFooter>
      </CForm>
    </CModal>
  )
}

CreateServiceOrderModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreated: PropTypes.func.isRequired,
  myInvitations: PropTypes.array,
}

export default CreateServiceOrderModal
