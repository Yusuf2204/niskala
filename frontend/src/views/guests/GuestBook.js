import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react'
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
  CFormTextarea,
  CFormLabel,
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
import {
  cilPeople,
  cilPlus,
  cilReload,
  cilCopy,
  cilShareAlt,
  cilPencil,
  cilTrash,
  cilChatBubble,
  cilSearch,
  cilList,
} from '@coreui/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../services/api'
import { toastSuccess, toastError } from '../../services/toastService'
import {
  GUEST_CATEGORIES,
  buildInvitationGuestUrl,
  buildWhatsAppShareUrl,
  parseBulkGuestLines,
} from './guestHelpers'

const EMPTY_FORM = {
  id: null,
  name: '',
  phone_number: '',
  category: 'General',
  pax_allocated: 1,
}

const GuestBook = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [invitations, setInvitations] = useState([])
  const [selectedInvitationId, setSelectedInvitationId] = useState(
    () => searchParams.get('invitationId') || '',
  )
  const initialQueryIdRef = useRef(searchParams.get('invitationId'))
  const [loadingInvitations, setLoadingInvitations] = useState(true)

  const [guests, setGuests] = useState([])
  const [invitationDetail, setInvitationDetail] = useState(null)
  const [summary, setSummary] = useState({ total_guests: 0, total_pax_allocated: 0 })
  const [loadingGuests, setLoadingGuests] = useState(false)

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')

  // Single create/edit modal
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [formState, setFormState] = useState(EMPTY_FORM)
  const [savingForm, setSavingForm] = useState(false)

  // Bulk paste modal
  const [bulkModalOpen, setBulkModalOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [savingBulk, setSavingBulk] = useState(false)

  // Delete confirmation modal
  const [deleteGuest, setDeleteGuest] = useState(null)
  const [deleting, setDeleting] = useState(false)

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
          const chosenId = exists ? String(queryId) : String(list[0].id)
          setSelectedInvitationId(chosenId)
        }
      } catch {
        toastError('Gagal memuat daftar undangan.')
      } finally {
        setLoadingInvitations(false)
      }
    }

    fetchInvitations()
  }, [])

  const fetchGuests = useCallback(async () => {
    if (!selectedInvitationId) return
    setLoadingGuests(true)
    try {
      const res = await api.get(`/v1/invitations/${selectedInvitationId}/guests`, {
        params: {
          per_page: 200,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          search: searchTerm.trim() || undefined,
        },
      })
      const payload = res.data?.data || {}
      setInvitationDetail(payload.invitation || null)
      setSummary(payload.summary || { total_guests: 0, total_pax_allocated: 0 })
      setGuests(payload.items?.data || [])
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal memuat daftar tamu.')
      setGuests([])
    } finally {
      setLoadingGuests(false)
    }
  }, [selectedInvitationId, categoryFilter, searchTerm])

  useEffect(() => {
    fetchGuests()
  }, [fetchGuests])

  const handleSelectInvitation = (newId) => {
    setSelectedInvitationId(newId)
    setSearchParams(newId ? { invitationId: newId } : {})
  }

  const openAddModal = () => {
    setFormState(EMPTY_FORM)
    setFormModalOpen(true)
  }

  const openEditModal = (guest) => {
    setFormState({
      id: guest.id,
      name: guest.name || '',
      phone_number: guest.phone_number || '',
      category: guest.category || 'General',
      pax_allocated: guest.pax_allocated || 1,
    })
    setFormModalOpen(true)
  }

  const handleSaveForm = async (e) => {
    e.preventDefault()
    if (!selectedInvitationId) return
    setSavingForm(true)

    const payload = {
      name: formState.name,
      phone_number: formState.phone_number || null,
      category: formState.category,
      pax_allocated: parseInt(formState.pax_allocated, 10) || 1,
    }

    try {
      if (formState.id) {
        await api.put(`/v1/invitations/${selectedInvitationId}/guests/${formState.id}`, payload)
        toastSuccess('Data tamu berhasil diperbarui.')
      } else {
        await api.post(`/v1/invitations/${selectedInvitationId}/guests`, payload)
        toastSuccess('Tamu berhasil ditambahkan.')
      }
      setFormModalOpen(false)
      fetchGuests()
    } catch (err) {
      const firstErr = err.response?.data?.errors
        ? Object.values(err.response.data.errors).flat()[0]
        : null
      toastError(firstErr || err.response?.data?.message || 'Gagal menyimpan data tamu.')
    } finally {
      setSavingForm(false)
    }
  }

  const parsedBulkPreview = useMemo(() => parseBulkGuestLines(bulkText), [bulkText])

  const handleSaveBulk = async (e) => {
    e.preventDefault()
    if (!selectedInvitationId || parsedBulkPreview.length === 0) return
    if (parsedBulkPreview.length > 100) {
      toastError('Maksimal 100 tamu per sekali simpan massal.')
      return
    }

    setSavingBulk(true)
    try {
      await api.post(`/v1/invitations/${selectedInvitationId}/guests`, {
        guests: parsedBulkPreview,
      })
      toastSuccess(`${parsedBulkPreview.length} tamu berhasil ditambahkan.`)
      setBulkText('')
      setBulkModalOpen(false)
      fetchGuests()
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal menyimpan daftar tamu massal.')
    } finally {
      setSavingBulk(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deleteGuest || !selectedInvitationId) return
    setDeleting(true)
    try {
      await api.delete(`/v1/invitations/${selectedInvitationId}/guests/${deleteGuest.id}`)
      toastSuccess('Tamu dihapus dari buku tamu.')
      setDeleteGuest(null)
      fetchGuests()
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal menghapus tamu.')
    } finally {
      setDeleting(false)
    }
  }

  const handleCopyGuestLink = async (guest) => {
    const slug = invitationDetail?.slug
    if (!slug) return
    const url = buildInvitationGuestUrl(slug, guest)

    try {
      await navigator.clipboard.writeText(url)
      toastSuccess(`Tautan untuk "${guest.name}" berhasil disalin.`)
    } catch {
      toastError('Browser menolak akses clipboard otomatis.')
    }
  }

  const handleShareWhatsApp = (guest) => {
    const slug = invitationDetail?.slug
    if (!slug) return
    const waUrl = buildWhatsAppShareUrl({
      slug,
      guest,
      invitationTitle: invitationDetail?.title,
    })
    window.open(waUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="guestbook-container">
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h4 className="fw-bold text-body mb-1 d-flex align-items-center gap-2">
            <CIcon icon={cilPeople} className="text-secondary" /> Buku Tamu Undangan
          </h4>
          <p className="text-body-secondary small mb-0">
            Kelola daftar tamu, kategori, kuota pax, serta kirim tautan personal melalui WhatsApp.
          </p>
        </div>

        {selectedInvitationId && (
          <div className="d-flex gap-2 flex-wrap">
            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              className="text-body"
              onClick={() => navigate(`/guests/rsvp?invitationId=${selectedInvitationId}`)}
            >
              <CIcon icon={cilChatBubble} size="sm" className="me-1" /> Rekap RSVP &amp; Doa
            </CButton>
            <CButton
              color="secondary"
              variant="outline"
              size="sm"
              className="text-body"
              onClick={() => setBulkModalOpen(true)}
            >
              <CIcon icon={cilList} size="sm" className="me-1" /> Tambah Banyak
            </CButton>
            <CButton size="sm" className="btn-niskala-gold" onClick={openAddModal}>
              <CIcon icon={cilPlus} size="sm" className="me-1" /> Tambah Tamu
            </CButton>
          </div>
        )}
      </div>

      {/* Selector Undangan */}
      <CCard className="mb-3 border-0 shadow-sm rounded-3">
        <CCardBody className="py-3">
          {loadingInvitations ? (
            <div className="d-flex align-items-center gap-2 text-body-secondary small">
              <CSpinner size="sm" /> Memuat daftar undangan...
            </div>
          ) : invitations.length === 0 ? (
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span className="text-body-secondary small">
                Anda belum memiliki undangan. Buat undangan terlebih dahulu untuk mengelola tamu.
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
            <CRow className="g-2 align-items-center">
              <CCol md={6}>
                <CFormLabel className="small fw-semibold text-body mb-1">
                  Pilih Undangan Aktif
                </CFormLabel>
                <div className="d-flex align-items-center gap-2">
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
                  {invitationDetail && (
                    <CBadge
                      color={invitationDetail.status === 'published' ? 'success' : 'secondary'}
                      className="text-uppercase"
                    >
                      {invitationDetail.status}
                    </CBadge>
                  )}
                </div>
              </CCol>
              <CCol md={6}>
                <CRow className="g-2 mt-2 mt-md-0">
                  <CCol xs={6}>
                    <div className="p-2 rounded border text-center">
                      <div className="small text-body-secondary">Total Tamu</div>
                      <div className="fw-bold fs-5 text-body">{summary.total_guests}</div>
                    </div>
                  </CCol>
                  <CCol xs={6}>
                    <div className="p-2 rounded border text-center">
                      <div className="small text-body-secondary">Total Kuota Pax</div>
                      <div className="fw-bold fs-5 text-body">{summary.total_pax_allocated}</div>
                    </div>
                  </CCol>
                </CRow>
              </CCol>
            </CRow>
          )}
        </CCardBody>
      </CCard>

      {invitationDetail && invitationDetail.status !== 'published' && (
        <CAlert color="warning" className="py-2 small mb-3">
          Undangan ini masih berstatus <strong>{invitationDetail.status}</strong>. Tautan publik
          yang dibagikan ke tamu baru dapat dibuka setelah undangan di-<strong>Publish</strong>.
        </CAlert>
      )}

      {/* Filter & Tabel Tamu */}
      {selectedInvitationId && (
        <CCard className="border-0 shadow-sm rounded-3">
          <CCardBody>
            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
              <div className="d-flex gap-2 flex-wrap align-items-center">
                <CFormSelect
                  size="sm"
                  style={{ width: '165px' }}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Semua Kategori</option>
                  {GUEST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </CFormSelect>

                <div className="position-relative" style={{ width: '240px' }}>
                  <CFormInput
                    size="sm"
                    placeholder="Cari nama atau no. WA..."
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
                onClick={fetchGuests}
                disabled={loadingGuests}
              >
                <CIcon icon={cilReload} size="sm" className="me-1" /> Muat Ulang
              </CButton>
            </div>

            {loadingGuests ? (
              <div className="text-center py-5">
                <CSpinner color="secondary" />
                <p className="mt-2 small text-body-secondary">Memuat daftar tamu...</p>
              </div>
            ) : guests.length === 0 ? (
              <div className="text-center py-5 text-body-secondary">
                <p className="mb-2">Belum ada tamu tercatat pada filter ini.</p>
                <CButton size="sm" className="btn-niskala-gold" onClick={openAddModal}>
                  + Tambah Tamu Pertama
                </CButton>
              </div>
            ) : (
              <CTable hover responsive align="middle" className="mb-0">
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell>Nama Tamu</CTableHeaderCell>
                    <CTableHeaderCell>Kategori</CTableHeaderCell>
                    <CTableHeaderCell>No. WhatsApp</CTableHeaderCell>
                    <CTableHeaderCell className="text-center">Kuota Pax</CTableHeaderCell>
                    <CTableHeaderCell className="text-end">Bagikan &amp; Aksi</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {guests.map((guest) => (
                    <CTableRow key={guest.id}>
                      <CTableDataCell>
                        <div className="fw-semibold text-body">{guest.name}</div>
                        <small className="text-body-secondary">
                          Token: {guest.slug_token || '-'}
                        </small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color={guest.category === 'VIP' ? 'warning' : 'secondary'}>
                          {guest.category}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell>
                        <span className="small text-body">{guest.phone_number || '-'}</span>
                      </CTableDataCell>
                      <CTableDataCell className="text-center fw-semibold">
                        {guest.pax_allocated}
                      </CTableDataCell>
                      <CTableDataCell className="text-end">
                        <div className="d-flex justify-content-end gap-1 flex-wrap">
                          <CButton
                            color="secondary"
                            size="sm"
                            variant="outline"
                            className="text-body"
                            title="Salin Tautan Personal Tamu"
                            onClick={() => handleCopyGuestLink(guest)}
                          >
                            <CIcon icon={cilCopy} size="sm" /> Salin Link
                          </CButton>
                          <CButton
                            color="success"
                            size="sm"
                            variant="outline"
                            title="Buka WhatsApp dengan Draft Undangan"
                            onClick={() => handleShareWhatsApp(guest)}
                          >
                            <CIcon icon={cilShareAlt} size="sm" /> WhatsApp
                          </CButton>
                          <CButton
                            color="secondary"
                            size="sm"
                            variant="ghost"
                            className="text-body"
                            title="Edit Tamu"
                            onClick={() => openEditModal(guest)}
                          >
                            <CIcon icon={cilPencil} size="sm" />
                          </CButton>
                          <CButton
                            color="danger"
                            size="sm"
                            variant="ghost"
                            title="Hapus Tamu"
                            onClick={() => setDeleteGuest(guest)}
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
      )}

      {/* Modal Tambah / Edit Tamu */}
      <CModal visible={formModalOpen} onClose={() => setFormModalOpen(false)}>
        <CModalHeader>
          <CModalTitle>{formState.id ? 'Edit Data Tamu' : 'Tambah Tamu Undangan'}</CModalTitle>
        </CModalHeader>
        <form onSubmit={handleSaveForm}>
          <CModalBody>
            <div className="mb-3">
              <CFormLabel className="small fw-semibold">Nama Lengkap Tamu *</CFormLabel>
              <CFormInput
                value={formState.name}
                onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                placeholder="Contoh: Bapak Surya & Ibu"
                maxLength={150}
                required
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-md-6">
                <CFormLabel className="small fw-semibold">Kategori</CFormLabel>
                <CFormSelect
                  value={formState.category}
                  onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                >
                  {GUEST_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </CFormSelect>
              </div>
              <div className="col-md-6">
                <CFormLabel className="small fw-semibold">Alokasi Kursi (Pax)</CFormLabel>
                <CFormInput
                  type="number"
                  min={1}
                  max={20}
                  value={formState.pax_allocated}
                  onChange={(e) => setFormState({ ...formState, pax_allocated: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-1">
              <CFormLabel className="small fw-semibold">No. WhatsApp (Opsional)</CFormLabel>
              <CFormInput
                value={formState.phone_number}
                onChange={(e) => setFormState({ ...formState, phone_number: e.target.value })}
                placeholder="Contoh: 081234567890 atau 6281234567890"
                maxLength={30}
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              variant="ghost"
              onClick={() => setFormModalOpen(false)}
              disabled={savingForm}
            >
              Batal
            </CButton>
            <CButton type="submit" className="btn-niskala-gold" disabled={savingForm}>
              {savingForm ? 'Menyimpan...' : 'Simpan'}
            </CButton>
          </CModalFooter>
        </form>
      </CModal>

      {/* Modal Tambah Banyak (Paste Baris) */}
      <CModal visible={bulkModalOpen} onClose={() => setBulkModalOpen(false)} size="lg">
        <CModalHeader>
          <CModalTitle>Tambah Banyak Tamu Sekaligus</CModalTitle>
        </CModalHeader>
        <form onSubmit={handleSaveBulk}>
          <CModalBody>
            <p className="small text-body-secondary mb-2">
              Masukkan 1 tamu per baris. Anda dapat menulis nama saja, atau memisahkan kolom dengan
              koma: <code>Nama Tamu, No WA, Kategori, Jumlah Pax</code>
            </p>
            <CFormTextarea
              rows={7}
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder={`Bapak Hendra & Ibu, 081234567890, VIP, 2\nIbu Kartika, 081398765432, Family, 3\nRekan Divisi IT`}
            />
            <div className="mt-2 small text-body-secondary">
              Terdeteksi <strong>{parsedBulkPreview.length}</strong> tamu siap disimpan (maksimal
              100 baris sekali proses).
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton
              color="secondary"
              variant="ghost"
              onClick={() => setBulkModalOpen(false)}
              disabled={savingBulk}
            >
              Batal
            </CButton>
            <CButton
              type="submit"
              className="btn-niskala-gold"
              disabled={savingBulk || parsedBulkPreview.length === 0}
            >
              {savingBulk ? 'Menyimpan...' : `Simpan ${parsedBulkPreview.length} Tamu`}
            </CButton>
          </CModalFooter>
        </form>
      </CModal>

      {/* Modal Konfirmasi Hapus Tamu */}
      <CModal visible={Boolean(deleteGuest)} onClose={() => setDeleteGuest(null)}>
        <CModalHeader>
          <CModalTitle>Hapus Tamu?</CModalTitle>
        </CModalHeader>
        <CModalBody>
          Apakah Anda yakin ingin menghapus <strong>{deleteGuest?.name}</strong> dari buku tamu?
        </CModalBody>
        <CModalFooter>
          <CButton
            color="secondary"
            variant="ghost"
            onClick={() => setDeleteGuest(null)}
            disabled={deleting}
          >
            Batal
          </CButton>
          <CButton color="danger" onClick={handleConfirmDelete} disabled={deleting}>
            {deleting ? 'Menghapus...' : 'Hapus'}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default GuestBook
