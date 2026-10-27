import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CButton,
  CForm,
  CFormInput,
  CFormSelect,
  CSpinner,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilArrowLeft, cilArrowRight, cilCheck, cilPaint, cilDescription } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { toastSuccess, toastError } from '../../services/toastService'

const CreateInvitation = () => {
  const [step, setStep] = useState(1)
  const [themes, setThemes] = useState([])
  const [loadingThemes, setLoadingThemes] = useState(false)
  const [selectedThemeId, setSelectedThemeId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  // Form states
  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState('wedding')
  const [slug, setSlug] = useState('')
  const [eventTitle, setEventTitle] = useState('Akad Nikah & Resepsi')
  const [eventDate, setEventDate] = useState('')
  const [startTime, setStartTime] = useState('09:00')
  const [locationName, setLocationName] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    const fetchThemes = async () => {
      setLoadingThemes(true)
      try {
        const res = await api.get('/v1/themes')
        const items = res.data.data || []
        setThemes(items)
        if (items.length > 0) {
          setSelectedThemeId(items[0].id)
        }
      } catch {
        setThemes([])
      } finally {
        setLoadingThemes(false)
      }
    }

    fetchThemes()
  }, [])

  const handleTitleChange = (e) => {
    const val = e.target.value
    setTitle(val)

    // Auto-generate clean slug
    const generated = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setSlug(generated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !selectedThemeId) {
      toastError('Mohon lengkapi judul undangan dan pilih tema.')
      return
    }

    setSubmitting(true)
    const payload = {
      title,
      theme_id: selectedThemeId,
      event_type: eventType,
      slug: slug || undefined,
      event_title: eventTitle || undefined,
      event_date: eventDate || undefined,
      start_time: startTime || undefined,
      location_name: locationName || undefined,
      address: address || undefined,
    }

    try {
      const res = await api.post('/v1/invitations', payload)
      toastSuccess('Undangan berhasil dibuat! Mengalihkan...')
      const createdId = res.data.data?.id
      // Redirect to invitations list
      setTimeout(() => {
        navigate('/invitations/list')
      }, 700)
    } catch (err) {
      const msg =
        err.response?.data?.errors?.slug?.[0] ||
        err.response?.data?.message ||
        'Gagal membuat undangan.'
      toastError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="create-invitation-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Step Indicator */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1">Buat Undangan Digital Baru</h4>
          <p className="text-muted small mb-0">
            Langkah {step} dari 2:{' '}
            {step === 1 ? 'Pilih Tema Desain Awal' : 'Informasi Dasar Acara & Slug URL'}
          </p>
        </div>
        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          onClick={() => navigate('/invitations/list')}
        >
          <CIcon icon={cilArrowLeft} className="me-1" /> Kembali ke Daftar
        </CButton>
      </div>

      <div className="d-flex mb-4 gap-2">
        <div
          className="flex-fill text-center py-2 rounded-2 fw-semibold small"
          style={{
            backgroundColor: step === 1 ? '#34342F' : '#E5DFC5',
            color: step === 1 ? '#F1EDE5' : '#34342F',
            transition: 'all 0.3s ease',
          }}
        >
          1. Pilih Tema Desain
        </div>
        <div
          className="flex-fill text-center py-2 rounded-2 fw-semibold small"
          style={{
            backgroundColor: step === 2 ? '#34342F' : '#E5DFC5',
            color: step === 2 ? '#F1EDE5' : '#34342F',
            transition: 'all 0.3s ease',
          }}
        >
          2. Informasi & Acara
        </div>
      </div>

      {/* STEP 1: Pilih Tema */}
      {step === 1 && (
        <div>
          {loadingThemes ? (
            <div className="text-center py-5">
              <CSpinner color="secondary" />
              <p className="mt-2 text-muted small">Memuat katalog tema...</p>
            </div>
          ) : (
            <CRow className="g-4 mb-4">
              {themes.map((theme) => {
                const isSelected = selectedThemeId === theme.id
                const palette = theme.default_config?.palette || {}
                const typography = theme.default_config?.typography || {}

                return (
                  <CCol xs={12} sm={6} key={theme.id}>
                    <CCard
                      className="h-100 shadow-sm border-2 rounded-3 overflow-hidden cursor-pointer"
                      style={{
                        borderColor: isSelected ? '#34342F' : '#E5DFC5',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        transform: isSelected ? 'scale(1.01)' : 'none',
                      }}
                      onClick={() => setSelectedThemeId(theme.id)}
                    >
                      <div
                        style={{
                          height: '130px',
                          background: palette.background || '#F1EDE5',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          position: 'relative',
                          borderBottom: '1px solid #E5DFC5',
                        }}
                      >
                        <span
                          style={{
                            fontFamily: typography.heading_font || 'serif',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            color: palette.text || '#34342F',
                          }}
                        >
                          {theme.name}
                        </span>

                        {isSelected && (
                          <div
                            className="position-absolute top-0 end-0 m-2 rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              width: '28px',
                              height: '28px',
                              backgroundColor: '#34342F',
                              color: '#F1EDE5',
                            }}
                          >
                            <CIcon icon={cilCheck} size="sm" />
                          </div>
                        )}
                      </div>

                      <CCardBody className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <h6 className="fw-bold mb-0 text-dark">{theme.name}</h6>
                          <CBadge color="light" className="text-dark border small">
                            {theme.category}
                          </CBadge>
                        </div>
                        <p className="small text-muted mb-2">{theme.description}</p>
                        <div className="d-flex gap-1">
                          {Object.entries(palette).map(([k, col]) => (
                            <div
                              key={k}
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                backgroundColor: col,
                                border: '1px solid #ccc',
                              }}
                            />
                          ))}
                        </div>
                      </CCardBody>
                    </CCard>
                  </CCol>
                )
              })}
            </CRow>
          )}

          <div className="d-flex justify-content-end">
            <CButton
              color="dark"
              disabled={!selectedThemeId}
              onClick={() => setStep(2)}
              style={{ backgroundColor: '#34342F', borderColor: '#34342F', color: '#F1EDE5' }}
            >
              Lanjut: Data Acara <CIcon icon={cilArrowRight} className="ms-1" />
            </CButton>
          </div>
        </div>
      )}

      {/* STEP 2: Informasi Dasar & Acara */}
      {step === 2 && (
        <CCard className="border-0 shadow-sm rounded-3">
          <CCardBody className="p-4">
            <CForm onSubmit={handleSubmit}>
              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">Informasi Pokok</h6>

              <CRow className="g-3 mb-4">
                <CCol xs={12} md={8}>
                  <label className="form-label small fw-semibold">Judul Undangan *</label>
                  <CFormInput
                    required
                    placeholder="Contoh: The Wedding of Rama & Shinta"
                    value={title}
                    onChange={handleTitleChange}
                  />
                </CCol>

                <CCol xs={12} md={4}>
                  <label className="form-label small fw-semibold">Jenis Acara</label>
                  <CFormSelect
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value)}
                  >
                    <option value="wedding">Pernikahan (Wedding)</option>
                    <option value="birthday">Ulang Tahun (Birthday)</option>
                    <option value="general">Acara Umum (General)</option>
                  </CFormSelect>
                </CCol>

                <CCol xs={12}>
                  <label className="form-label small fw-semibold">Slug Tautan Undangan</label>
                  <div className="input-group">
                    <span className="input-group-text small bg-light text-muted">
                      https://niskala.id/
                    </span>
                    <CFormInput
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="rama-shinta"
                    />
                  </div>
                  <small className="text-muted">
                    Hanya gunakan huruf kecil, angka, dan tanda strip (-).
                  </small>
                </CCol>
              </CRow>

              <h6 className="fw-bold text-dark border-bottom pb-2 mb-3">
                Sesi Acara Perdana (Opsional)
              </h6>

              <CRow className="g-3 mb-4">
                <CCol xs={12} md={6}>
                  <label className="form-label small fw-semibold">Nama Sesi Acara</label>
                  <CFormInput
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Akad Nikah / Resepsi"
                  />
                </CCol>

                <CCol xs={12} sm={6} md={3}>
                  <label className="form-label small fw-semibold">Tanggal Acara</label>
                  <CFormInput
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                  />
                </CCol>

                <CCol xs={12} sm={6} md={3}>
                  <label className="form-label small fw-semibold">Waktu Mulai</label>
                  <CFormInput
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </CCol>

                <CCol xs={12} md={6}>
                  <label className="form-label small fw-semibold">Nama Gedung / Tempat</label>
                  <CFormInput
                    value={locationName}
                    onChange={(e) => setLocationName(e.target.value)}
                    placeholder="Contoh: Gedung Sasana Kriya"
                  />
                </CCol>

                <CCol xs={12} md={6}>
                  <label className="form-label small fw-semibold">Alamat Lengkap</label>
                  <CFormInput
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Jl. Pintu Masuk No. 1, Jakarta"
                  />
                </CCol>
              </CRow>

              <div className="d-flex justify-content-between pt-3 border-top">
                <CButton
                  color="secondary"
                  variant="outline"
                  onClick={() => setStep(1)}
                  disabled={submitting}
                >
                  <CIcon icon={cilArrowLeft} className="me-1" /> Kembali Pilih Tema
                </CButton>

                <CButton
                  type="submit"
                  color="dark"
                  disabled={submitting}
                  style={{
                    backgroundColor: '#34342F',
                    borderColor: '#34342F',
                    color: '#F1EDE5',
                    fontWeight: '600',
                  }}
                >
                  {submitting ? 'Menyimpan...' : 'Simpan & Selesaikan'}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      )}
    </div>
  )
}

export default CreateInvitation

