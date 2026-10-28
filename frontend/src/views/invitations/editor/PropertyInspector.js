import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  CFormInput,
  CFormTextarea,
  CFormLabel,
  CFormSelect,
  CButton,
  CSpinner,
  CBadge,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudUpload,
  cilTrash,
  cilPlus,
} from '@coreui/icons'
import { COMPONENT_REGISTRY } from './registry'
import api from '../../../services/api'
import { toastSuccess, toastError } from '../../../services/toastService'

const PropertyInspector = ({
  invitation,
  section,
  onUpdateProps,
  onUpdateMusicUrl,
  musicCatalog = [],
}) => {
  const [uploadingField, setUploadingField] = useState(null)
  const [selectedMusic, setSelectedMusic] = useState(invitation?.content?.music_url || '')

  useEffect(() => {
    setSelectedMusic(invitation?.content?.music_url || '')
  }, [invitation])

  if (!section) {
    return (
      <div
        className="d-flex flex-column h-100 editor-sidebar-panel border-start shadow-sm"
        style={{
          width: '350px',
          minWidth: '320px',
        }}
      >
        <div className="p-3 border-bottom panel-header">
          <h6 className="fw-bold mb-0 text-body">Pengaturan Undangan</h6>
          <small className="text-body-secondary">Konfigurasi umum &amp; musik latar</small>
        </div>

        <div className="flex-grow-1 overflow-y-auto p-3">
          {/* Info Tema */}
          <div className="p-3 rounded panel-card mb-3">
            <small className="text-body-secondary text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem' }}>
              Tema Aktif
            </small>
            <div className="fw-bold text-body">{invitation?.theme?.name || 'Tema Standar'}</div>
            <div className="d-flex align-items-center gap-1 mt-2">
              <span className="badge" style={{ backgroundColor: '#F1EDE5', color: '#34342F', border: '1px solid #ccc' }}>
                Ivory 60%
              </span>
              <span className="badge" style={{ backgroundColor: '#34342F', color: '#F1EDE5' }}>
                Charcoal 30%
              </span>
              <span className="badge" style={{ backgroundColor: '#C5A059', color: '#242420', fontWeight: 'bold' }}>
                Gold 10%
              </span>
            </div>
          </div>

          {/* Pengaturan Musik Latar */}
          <div className="mb-4">
            <CFormLabel className="fw-bold small text-body">Musik Latar Undangan</CFormLabel>
            <select
              className="form-select form-select-sm mb-2"
              value={selectedMusic}
              onChange={(e) => {
                setSelectedMusic(e.target.value)
                onUpdateMusicUrl(e.target.value)
              }}
            >
              <option value="">-- Tanpa Musik Latar --</option>
              {musicCatalog.map((m) => (
                <option key={m.id} value={m.file_url || m.file_path}>
                  {m.title} ({m.artist || 'Instrumental'})
                </option>
              ))}
            </select>

            <small className="text-body-secondary d-block mb-2">Atau masukkan URL audio mp3 eksternal:</small>
            <CFormInput
              size="sm"
              placeholder="https://domain.com/audio.mp3"
              value={selectedMusic}
              onChange={(e) => {
                setSelectedMusic(e.target.value)
                onUpdateMusicUrl(e.target.value)
              }}
            />
          </div>

          <div className="p-3 rounded-3 panel-card text-center">
            <p className="text-body-secondary small mb-0">
              💡 <strong>Tips:</strong> Klik salah satu section di kanvas tengah atau tab urutan
              section di panel kiri untuk membuka form pengeditan konten teks dan foto.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const meta = COMPONENT_REGISTRY[section.type] || {}
  const props = section.props || {}

  const handlePropChange = (field, value) => {
    onUpdateProps(section.id, {
      ...props,
      [field]: value,
    })
  }

  // Upload file helper
  const handleFileUpload = async (field, file, type = 'photo') => {
    if (!file || !invitation?.id) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    setUploadingField(field)
    try {
      const res = await api.post(`/v1/invitations/${invitation.id}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const filePath = res.data.data?.file_path
      if (filePath) {
        handlePropChange(field, filePath)
        toastSuccess('Foto berhasil diunggah!')
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal mengunggah foto.')
    } finally {
      setUploadingField(null)
    }
  }

  return (
    <div
      className="d-flex flex-column h-100 editor-sidebar-panel border-start shadow-sm"
      style={{
        width: '350px',
        minWidth: '320px',
      }}
    >
      {/* Header Inspector */}
      <div className="p-3 border-bottom panel-header d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-bold mb-0 text-body">{meta.name || section.type}</h6>
          <small className="text-body-secondary font-monospace">{section.id}</small>
        </div>
        <span className="badge rounded-pill theme-category-badge px-2 py-1 small">
          {meta.category || 'Section'}
        </span>
      </div>

      {/* Konten Form Dinamis */}
      <div className="flex-grow-1 overflow-y-auto p-3">
        {/* ===================== HERO COVER ===================== */}
        {section.type === 'HeroCover' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small text-body">Judul Atas</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Nama Pasangan</CFormLabel>
              <CFormInput
                size="sm"
                value={props.primary_names || ''}
                onChange={(e) => handlePropChange('primary_names', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Tanggal Acara</CFormLabel>
              <CFormInput
                size="sm"
                value={props.date_text || ''}
                onChange={(e) => handlePropChange('date_text', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Kutipan / Doa</CFormLabel>
              <CFormTextarea
                rows={2}
                value={props.quote || ''}
                onChange={(e) => handlePropChange('quote', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Foto Latar Belakang</CFormLabel>
              <CFormInput
                size="sm"
                className="mb-1"
                placeholder="URL Gambar"
                value={props.bg_image_url || ''}
                onChange={(e) => handlePropChange('bg_image_url', e.target.value)}
              />
              <div className="d-flex align-items-center gap-2">
                <input
                  type="file"
                  id="cover-upload"
                  className="d-none"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('bg_image_url', e.target.files[0], 'cover')}
                />
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center gap-1 text-body"
                  disabled={uploadingField === 'bg_image_url'}
                  onClick={() => document.getElementById('cover-upload').click()}
                >
                  {uploadingField === 'bg_image_url' ? (
                    <CSpinner size="sm" />
                  ) : (
                    <CIcon icon={cilCloudUpload} size="sm" />
                  )}
                  <span>Unggah dari Komputer</span>
                </CButton>
              </div>
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Teks Tombol Buka</CFormLabel>
              <CFormInput
                size="sm"
                value={props.open_button_text || ''}
                onChange={(e) => handlePropChange('open_button_text', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Hiasan Ornamen Cover</CFormLabel>
              <CFormSelect
                size="sm"
                value={props.ornament_type || ''}
                onChange={(e) => handlePropChange('ornament_type', e.target.value)}
              >
                <option value="">Tanpa Ornamen (Standar)</option>
                <option value="gunungan">Gunungan Wayang (Adat Jawa)</option>
              </CFormSelect>
            </div>
          </div>
        )}

        {/* ===================== COUPLE PROFILE ===================== */}
        {section.type === 'CoupleProfile' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small text-body">Judul Bagian</CFormLabel>
              <CFormInput
                size="sm"
                value={props.section_title || ''}
                onChange={(e) => handlePropChange('section_title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Kutipan Pembuka</CFormLabel>
              <CFormTextarea
                rows={2}
                value={props.quote || ''}
                onChange={(e) => handlePropChange('quote', e.target.value)}
              />
            </div>

            {/* Profil Pria */}
            <div className="p-2 rounded panel-card">
              <h6 className="fw-bold small text-body mb-2">Mempelai Pria</h6>
              <div className="mb-2">
                <CFormLabel className="small mb-1 text-body">Nama Lengkap</CFormLabel>
                <CFormInput
                  size="sm"
                  value={props.groom_name || ''}
                  onChange={(e) => handlePropChange('groom_name', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <CFormLabel className="small mb-1 text-body">Keterangan Orang Tua</CFormLabel>
                <CFormInput
                  size="sm"
                  value={props.groom_parents || ''}
                  onChange={(e) => handlePropChange('groom_parents', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <CFormLabel className="small mb-1 text-body">Foto Pria</CFormLabel>
                <CFormInput
                  size="sm"
                  className="mb-1"
                  value={props.groom_photo || ''}
                  onChange={(e) => handlePropChange('groom_photo', e.target.value)}
                />
                <input
                  type="file"
                  id="groom-upload"
                  className="d-none"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('groom_photo', e.target.files[0], 'photo')}
                />
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center gap-1 text-body"
                  disabled={uploadingField === 'groom_photo'}
                  onClick={() => document.getElementById('groom-upload').click()}
                >
                  {uploadingField === 'groom_photo' ? (
                    <CSpinner size="sm" />
                  ) : (
                    <CIcon icon={cilCloudUpload} size="sm" />
                  )}
                  <span>Unggah Foto Pria</span>
                </CButton>
              </div>
              <div>
                <CFormLabel className="small mb-1 text-body">Instagram</CFormLabel>
                <CFormInput
                  size="sm"
                  value={props.groom_instagram || ''}
                  onChange={(e) => handlePropChange('groom_instagram', e.target.value)}
                />
              </div>
            </div>

            {/* Profil Wanita */}
            <div className="p-2 rounded panel-card">
              <h6 className="fw-bold small text-body mb-2">Mempelai Wanita</h6>
              <div className="mb-2">
                <CFormLabel className="small mb-1 text-body">Nama Lengkap</CFormLabel>
                <CFormInput
                  size="sm"
                  value={props.bride_name || ''}
                  onChange={(e) => handlePropChange('bride_name', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <CFormLabel className="small mb-1 text-body">Keterangan Orang Tua</CFormLabel>
                <CFormInput
                  size="sm"
                  value={props.bride_parents || ''}
                  onChange={(e) => handlePropChange('bride_parents', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <CFormLabel className="small mb-1 text-body">Foto Wanita</CFormLabel>
                <CFormInput
                  size="sm"
                  className="mb-1"
                  value={props.bride_photo || ''}
                  onChange={(e) => handlePropChange('bride_photo', e.target.value)}
                />
                <input
                  type="file"
                  id="bride-upload"
                  className="d-none"
                  accept="image/*"
                  onChange={(e) => handleFileUpload('bride_photo', e.target.files[0], 'photo')}
                />
                <CButton
                  color="secondary"
                  variant="outline"
                  size="sm"
                  className="w-100 d-flex align-items-center justify-content-center gap-1 text-body"
                  disabled={uploadingField === 'bride_photo'}
                  onClick={() => document.getElementById('bride-upload').click()}
                >
                  {uploadingField === 'bride_photo' ? (
                    <CSpinner size="sm" />
                  ) : (
                    <CIcon icon={cilCloudUpload} size="sm" />
                  )}
                  <span>Unggah Foto Wanita</span>
                </CButton>
              </div>
              <div>
                <CFormLabel className="small mb-1 text-body">Instagram</CFormLabel>
                <CFormInput
                  size="sm"
                  value={props.bride_instagram || ''}
                  onChange={(e) => handlePropChange('bride_instagram', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ===================== COUNTDOWN TIMER ===================== */}
        {section.type === 'CountdownTimer' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small text-body">Judul Countdown</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Target Tanggal &amp; Waktu</CFormLabel>
              <CFormInput
                type="datetime-local"
                size="sm"
                value={props.target_date ? props.target_date.slice(0, 16) : ''}
                onChange={(e) => handlePropChange('target_date', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Deskripsi Catatan</CFormLabel>
              <CFormTextarea
                rows={2}
                value={props.description || ''}
                onChange={(e) => handlePropChange('description', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ===================== EVENT SCHEDULE ===================== */}
        {section.type === 'EventSchedule' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small text-body">Judul Rangkaian Acara</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Subjudul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.subtitle || ''}
                onChange={(e) => handlePropChange('subtitle', e.target.value)}
              />
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <CFormLabel className="fw-bold small text-body mb-0">Daftar Sesi Acara</CFormLabel>
                <CButton
                  size="sm"
                  color="secondary"
                  variant="outline"
                  className="py-0 px-2"
                  onClick={() => {
                    const newEvents = [
                      ...(props.events || []),
                      {
                        id: Date.now().toString(),
                        name: 'Sesi Baru',
                        date: 'Sabtu, 12 Desember 2026',
                        time: '19:00 - 21:00 WIB',
                        location: 'Nama Gedung',
                        address: 'Alamat Acara',
                      },
                    ]
                    handlePropChange('events', newEvents)
                  }}
                >
                  <CIcon icon={cilPlus} size="sm" /> Tambah Sesi
                </CButton>
              </div>

              {(props.events || []).map((evt, idx) => (
                <div key={evt.id || idx} className="p-2 rounded panel-card mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold small text-body">Sesi #{idx + 1}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger p-0"
                      onClick={() => {
                        const newEvents = (props.events || []).filter((_, i) => i !== idx)
                        handlePropChange('events', newEvents)
                      }}
                    >
                      <CIcon icon={cilTrash} size="sm" />
                    </button>
                  </div>
                  <CFormInput
                    size="sm"
                    className="mb-1"
                    placeholder="Nama Acara"
                    value={evt.name}
                    onChange={(e) => {
                      const updated = [...props.events]
                      updated[idx].name = e.target.value
                      handlePropChange('events', updated)
                    }}
                  />
                  <CFormInput
                    size="sm"
                    className="mb-1"
                    placeholder="Waktu (contoh: 08:00 - 10:00 WIB)"
                    value={evt.time}
                    onChange={(e) => {
                      const updated = [...props.events]
                      updated[idx].time = e.target.value
                      handlePropChange('events', updated)
                    }}
                  />
                  <CFormInput
                    size="sm"
                    className="mb-1"
                    placeholder="Lokasi Gedung"
                    value={evt.location}
                    onChange={(e) => {
                      const updated = [...props.events]
                      updated[idx].location = e.target.value
                      handlePropChange('events', updated)
                    }}
                  />
                  <CFormInput
                    size="sm"
                    placeholder="Alamat Lengkap"
                    value={evt.address}
                    onChange={(e) => {
                      const updated = [...props.events]
                      updated[idx].address = e.target.value
                      handlePropChange('events', updated)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== TRADITION ACCORDION (PROSESI ADAT) ===================== */}
        {section.type === 'TraditionAccordion' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small text-body">Judul Bagian</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Subjudul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.subtitle || ''}
                onChange={(e) => handlePropChange('subtitle', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Hiasan Ornamen Header</CFormLabel>
              <CFormSelect
                size="sm"
                value={props.ornament || 'gunungan'}
                onChange={(e) => handlePropChange('ornament', e.target.value)}
              >
                <option value="gunungan">Gunungan Wayang (Adat Jawa)</option>
                <option value="none">Tanpa Ornamen</option>
              </CFormSelect>
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <CFormLabel className="fw-bold small text-body mb-0">Daftar Prosesi Adat</CFormLabel>
                <CButton
                  size="sm"
                  color="secondary"
                  variant="outline"
                  className="py-0 px-2"
                  onClick={() => {
                    const newItems = [
                      ...(props.items || []),
                      {
                        id: `item-${Date.now().toString(36)}`,
                        title: 'Prosesi Adat Baru',
                        time_info: 'Waktu Pelaksanaan',
                        location: 'Papan / Tempat',
                        description: 'Penjelasan tata cara dan makna luhur prosesi adat.',
                      },
                    ]
                    handlePropChange('items', newItems)
                  }}
                >
                  <CIcon icon={cilPlus} size="sm" /> Tambah Prosesi
                </CButton>
              </div>

              {(props.items || []).map((item, idx) => (
                <div key={item.id || idx} className="p-2 rounded panel-card mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold small text-body">Tahap #{idx + 1}</span>
                    <CButton
                      size="sm"
                      color="danger"
                      variant="ghost"
                      className="p-0 text-danger"
                      onClick={() => {
                        const updated = props.items.filter((_, i) => i !== idx)
                        handlePropChange('items', updated)
                      }}
                    >
                      <CIcon icon={cilTrash} size="sm" />
                    </CButton>
                  </div>
                  <CFormInput
                    size="sm"
                    className="mb-1"
                    placeholder="Nama Prosesi (cth: Upacara Siraman)"
                    value={item.title || ''}
                    onChange={(e) => {
                      const updated = [...props.items]
                      updated[idx].title = e.target.value
                      handlePropChange('items', updated)
                    }}
                  />
                  <CFormInput
                    size="sm"
                    className="mb-1"
                    placeholder="Waktu (cth: Jumat Pon — 09:00 WIB)"
                    value={item.time_info || ''}
                    onChange={(e) => {
                      const updated = [...props.items]
                      updated[idx].time_info = e.target.value
                      handlePropChange('items', updated)
                    }}
                  />
                  <CFormInput
                    size="sm"
                    className="mb-1"
                    placeholder="Lokasi (cth: Kediaman Penganten)"
                    value={item.location || ''}
                    onChange={(e) => {
                      const updated = [...props.items]
                      updated[idx].location = e.target.value
                      handlePropChange('items', updated)
                    }}
                  />
                  <CFormTextarea
                    rows={2}
                    className="small"
                    placeholder="Makna & Keterangan Prosesi"
                    value={item.description || ''}
                    onChange={(e) => {
                      const updated = [...props.items]
                      updated[idx].description = e.target.value
                      handlePropChange('items', updated)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== LOCATION MAP ===================== */}
        {section.type === 'LocationMap' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small text-body">Judul Bagian</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Nama Gedung / Tempat</CFormLabel>
              <CFormInput
                size="sm"
                value={props.venue_name || ''}
                onChange={(e) => handlePropChange('venue_name', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Alamat Lengkap</CFormLabel>
              <CFormTextarea
                rows={2}
                value={props.address || ''}
                onChange={(e) => handlePropChange('address', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Google Maps Embed URL</CFormLabel>
              <CFormInput
                size="sm"
                value={props.maps_embed_url || ''}
                onChange={(e) => handlePropChange('maps_embed_url', e.target.value)}
              />
              <small className="text-body-secondary" style={{ fontSize: '0.7rem' }}>
                URL iframe src Google Maps embed
              </small>
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Google Maps Link Langsung</CFormLabel>
              <CFormInput
                size="sm"
                value={props.maps_direction_url || ''}
                onChange={(e) => handlePropChange('maps_direction_url', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ===================== PHOTO GALLERY ===================== */}
        {section.type === 'PhotoGallery' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small text-body">Judul Galeri</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Subjudul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.subtitle || ''}
                onChange={(e) => handlePropChange('subtitle', e.target.value)}
              />
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <CFormLabel className="fw-bold small text-body mb-0">Foto Galeri ({props.images?.length || 0})</CFormLabel>
                <div>
                  <input
                    type="file"
                    id="gallery-upload"
                    className="d-none"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0]
                      if (!file) return
                      const formData = new FormData()
                      formData.append('file', file)
                      formData.append('type', 'gallery')
                      setUploadingField('gallery')
                      try {
                        const res = await api.post(`/v1/invitations/${invitation.id}/media`, formData, {
                          headers: { 'Content-Type': 'multipart/form-data' },
                        })
                        const filePath = res.data.data?.file_path
                        if (filePath) {
                          handlePropChange('images', [...(props.images || []), filePath])
                          toastSuccess('Foto berhasil ditambahkan ke galeri!')
                        }
                      } catch {
                        toastError('Gagal mengunggah foto galeri.')
                      } finally {
                        setUploadingField(null)
                      }
                    }}
                  />
                  <CButton
                    size="sm"
                    color="secondary"
                    variant="outline"
                    className="py-0 px-2 d-flex align-items-center gap-1 text-body"
                    disabled={uploadingField === 'gallery'}
                    onClick={() => document.getElementById('gallery-upload').click()}
                  >
                    {uploadingField === 'gallery' ? (
                      <CSpinner size="sm" />
                    ) : (
                      <CIcon icon={cilCloudUpload} size="sm" />
                    )}
                    <span>Unggah Foto</span>
                  </CButton>
                </div>
              </div>

              <div className="d-flex flex-column gap-2">
                {(props.images || []).map((img, idx) => (
                  <div key={idx} className="p-2 panel-card rounded d-flex align-items-center gap-2">
                    <img
                      src={img}
                      alt=""
                      style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                    />
                    <div className="flex-grow-1 overflow-hidden">
                      <CFormInput
                        size="sm"
                        value={img}
                        onChange={(e) => {
                          const updated = [...props.images]
                          updated[idx] = e.target.value
                          handlePropChange('images', updated)
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger p-0"
                      onClick={() => {
                        const updated = (props.images || []).filter((_, i) => i !== idx)
                        handlePropChange('images', updated)
                      }}
                    >
                      <CIcon icon={cilTrash} size="sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===================== LOVE STORY ===================== */}
        {section.type === 'LoveStory' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small text-body">Judul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Subjudul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.subtitle || ''}
                onChange={(e) => handlePropChange('subtitle', e.target.value)}
              />
            </div>
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <CFormLabel className="fw-bold small text-body mb-0">Linimasa Cerita</CFormLabel>
                <CButton
                  size="sm"
                  color="secondary"
                  variant="outline"
                  className="py-0 px-2"
                  onClick={() => {
                    const newStories = [
                      ...(props.stories || []),
                      { year: '2025', title: 'Momen Baru', text: 'Tuliskan cerita singkat perjalanan Anda...' },
                    ]
                    handlePropChange('stories', newStories)
                  }}
                >
                  <CIcon icon={cilPlus} size="sm" /> Tambah Kisah
                </CButton>
              </div>

              {(props.stories || []).map((s, idx) => (
                <div key={idx} className="p-2 panel-card rounded mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold small text-body">Kisah #{idx + 1}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger p-0"
                      onClick={() => {
                        const newStories = (props.stories || []).filter((_, i) => i !== idx)
                        handlePropChange('stories', newStories)
                      }}
                    >
                      <CIcon icon={cilTrash} size="sm" />
                    </button>
                  </div>
                  <CFormInput
                    size="sm"
                    className="mb-1"
                    placeholder="Tahun (misal: 2021)"
                    value={s.year}
                    onChange={(e) => {
                      const updated = [...props.stories]
                      updated[idx].year = e.target.value
                      handlePropChange('stories', updated)
                    }}
                  />
                  <CFormInput
                    size="sm"
                    className="mb-1"
                    placeholder="Judul Cerita"
                    value={s.title}
                    onChange={(e) => {
                      const updated = [...props.stories]
                      updated[idx].title = e.target.value
                      handlePropChange('stories', updated)
                    }}
                  />
                  <CFormTextarea
                    rows={2}
                    placeholder="Uraian cerita..."
                    value={s.text}
                    onChange={(e) => {
                      const updated = [...props.stories]
                      updated[idx].text = e.target.value
                      handlePropChange('stories', updated)
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== GIFT REGISTRY ===================== */}
        {section.type === 'GiftRegistry' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small text-body">Judul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Catatan Pengantar</CFormLabel>
              <CFormTextarea
                rows={2}
                value={props.note || ''}
                onChange={(e) => handlePropChange('note', e.target.value)}
              />
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <CFormLabel className="fw-bold small text-body mb-0">Daftar Rekening / Dompet Digital</CFormLabel>
                <CButton
                  size="sm"
                  color="secondary"
                  variant="outline"
                  className="py-0 px-2"
                  onClick={() => {
                    const newAccounts = [
                      ...(props.accounts || []),
                      { bank: 'BCA', number: '123-456-7890', holder: 'Nama Pemilik' },
                    ]
                    handlePropChange('accounts', newAccounts)
                  }}
                >
                  <CIcon icon={cilPlus} size="sm" /> Tambah Rekening
                </CButton>
              </div>

              {(props.accounts || []).map((acc, idx) => (
                <div key={idx} className="p-2 panel-card rounded mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold small text-body">Rekening #{idx + 1}</span>
                    <button
                      type="button"
                      className="btn btn-sm btn-link text-danger p-0"
                      onClick={() => {
                        const newAcc = (props.accounts || []).filter((_, i) => i !== idx)
                        handlePropChange('accounts', newAcc)
                      }}
                    >
                      <CIcon icon={cilTrash} size="sm" />
                    </button>
                  </div>
                  <CFormInput
                    size="sm"
                    className="mb-1"
                    placeholder="Nama Bank / E-Wallet"
                    value={acc.bank}
                    onChange={(e) => {
                      const updated = [...props.accounts]
                      updated[idx].bank = e.target.value
                      handlePropChange('accounts', updated)
                    }}
                  />
                  <CFormInput
                    size="sm"
                    className="mb-1"
                    placeholder="Nomor Rekening"
                    value={acc.number}
                    onChange={(e) => {
                      const updated = [...props.accounts]
                      updated[idx].number = e.target.value
                      handlePropChange('accounts', updated)
                    }}
                  />
                  <CFormInput
                    size="sm"
                    placeholder="Atas Nama"
                    value={acc.holder}
                    onChange={(e) => {
                      const updated = [...props.accounts]
                      updated[idx].holder = e.target.value
                      handlePropChange('accounts', updated)
                    }}
                  />
                </div>
              ))}
            </div>

            <div>
              <CFormLabel className="fw-bold small text-body">Alamat Kirim Kado Fisik</CFormLabel>
              <CFormTextarea
                rows={2}
                placeholder="Alamat lengkap penerima hadiah fisik..."
                value={props.physical_gift_address || ''}
                onChange={(e) => handlePropChange('physical_gift_address', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ===================== RSVP SECTION ===================== */}
        {(section.type === 'RsvpSection' || section.type === 'RsvpForm') && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small text-body">Judul Formulir RSVP</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Subjudul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.subtitle || ''}
                onChange={(e) => handlePropChange('subtitle', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Catatan Batas Konfirmasi</CFormLabel>
              <CFormTextarea
                rows={2}
                value={props.note || ''}
                onChange={(e) => handlePropChange('note', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ===================== FOOTER SECTION ===================== */}
        {section.type === 'FooterSection' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small text-body">Kalimat Penutup</CFormLabel>
              <CFormTextarea
                rows={2}
                value={props.closing_quote || ''}
                onChange={(e) => handlePropChange('closing_quote', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Tanda Tangan Keluarga</CFormLabel>
              <CFormInput
                size="sm"
                value={props.family_signatures || ''}
                onChange={(e) => handlePropChange('family_signatures', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small text-body">Watermark / Kredit Brand</CFormLabel>
              <CFormInput
                size="sm"
                value={props.brand_credit || ''}
                onChange={(e) => handlePropChange('brand_credit', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

PropertyInspector.propTypes = {
  invitation: PropTypes.object,
  section: PropTypes.object,
  onUpdateProps: PropTypes.func.isRequired,
  onUpdateMusicUrl: PropTypes.func.isRequired,
  musicCatalog: PropTypes.array,
}

export default PropertyInspector
