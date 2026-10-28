import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import {
  CFormInput,
  CFormTextarea,
  CFormLabel,
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
        className="d-flex flex-column h-100 bg-white border-start shadow-sm"
        style={{
          width: '350px',
          minWidth: '320px',
          borderColor: 'rgba(52, 52, 47, 0.12)',
        }}
      >
        <div className="p-3 border-bottom bg-light">
          <h6 className="fw-bold mb-0 text-dark">Pengaturan Undangan</h6>
          <small className="text-muted">Konfigurasi umum &amp; musik latar</small>
        </div>

        <div className="flex-grow-1 overflow-y-auto p-3">
          {/* Info Tema */}
          <div className="p-3 rounded border mb-3 bg-light">
            <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '0.7rem' }}>
              Tema Aktif
            </small>
            <div className="fw-bold text-dark">{invitation?.theme?.name || 'Tema Standar'}</div>
            <div className="d-flex align-items-center gap-1 mt-2">
              <span className="badge" style={{ backgroundColor: '#F1EDE5', color: '#34342F', border: '1px solid #ccc' }}>
                Ivory 60%
              </span>
              <span className="badge" style={{ backgroundColor: '#34342F', color: '#F1EDE5' }}>
                Charcoal 30%
              </span>
              <span className="badge" style={{ backgroundColor: '#A68B65', color: '#FFFFFF' }}>
                Gold 10%
              </span>
            </div>
          </div>

          {/* Pengaturan Musik Latar */}
          <div className="mb-4">
            <CFormLabel className="fw-bold small text-dark">Musik Latar Undangan</CFormLabel>
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

            <small className="text-muted d-block mb-2">Atau masukkan URL audio mp3 eksternal:</small>
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

          <div className="p-3 rounded-3 bg-light text-center border">
            <p className="text-muted small mb-0">
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
      className="d-flex flex-column h-100 bg-white border-start shadow-sm"
      style={{
        width: '350px',
        minWidth: '320px',
        borderColor: 'rgba(52, 52, 47, 0.12)',
      }}
    >
      {/* Header Inspector */}
      <div className="p-3 border-bottom bg-light d-flex justify-content-between align-items-center">
        <div>
          <h6 className="fw-bold mb-0 text-dark">{meta.name || section.type}</h6>
          <small className="text-muted font-monospace">{section.id}</small>
        </div>
        <CBadge color="dark" style={{ backgroundColor: '#A68B65' }}>
          {meta.category || 'Section'}
        </CBadge>
      </div>

      {/* Konten Form Dinamis */}
      <div className="flex-grow-1 overflow-y-auto p-3">
        {/* ===================== HERO COVER ===================== */}
        {section.type === 'HeroCover' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small">Judul Atas</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Nama Pasangan</CFormLabel>
              <CFormInput
                size="sm"
                value={props.primary_names || ''}
                onChange={(e) => handlePropChange('primary_names', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Tanggal Acara</CFormLabel>
              <CFormInput
                size="sm"
                value={props.date_text || ''}
                onChange={(e) => handlePropChange('date_text', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Kutipan / Doa</CFormLabel>
              <CFormTextarea
                rows={2}
                value={props.quote || ''}
                onChange={(e) => handlePropChange('quote', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Foto Latar Belakang</CFormLabel>
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
                  color="light"
                  size="sm"
                  className="border w-100 d-flex align-items-center justify-content-center gap-1"
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
              <CFormLabel className="fw-bold small">Teks Tombol Buka</CFormLabel>
              <CFormInput
                size="sm"
                value={props.open_button_text || ''}
                onChange={(e) => handlePropChange('open_button_text', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* ===================== COUPLE PROFILE ===================== */}
        {section.type === 'CoupleProfile' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small">Judul Bagian</CFormLabel>
              <CFormInput
                size="sm"
                value={props.section_title || ''}
                onChange={(e) => handlePropChange('section_title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Kutipan Pembuka</CFormLabel>
              <CFormTextarea
                rows={2}
                value={props.quote || ''}
                onChange={(e) => handlePropChange('quote', e.target.value)}
              />
            </div>

            {/* Profil Pria */}
            <div className="p-2 rounded border bg-light">
              <h6 className="fw-bold small text-dark mb-2">Mempelai Pria</h6>
              <div className="mb-2">
                <CFormLabel className="small mb-1">Nama Lengkap</CFormLabel>
                <CFormInput
                  size="sm"
                  value={props.groom_name || ''}
                  onChange={(e) => handlePropChange('groom_name', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <CFormLabel className="small mb-1">Keterangan Orang Tua</CFormLabel>
                <CFormInput
                  size="sm"
                  value={props.groom_parents || ''}
                  onChange={(e) => handlePropChange('groom_parents', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <CFormLabel className="small mb-1">Foto Pria</CFormLabel>
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
                  color="light"
                  size="sm"
                  className="border w-100 d-flex align-items-center justify-content-center gap-1"
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
                <CFormLabel className="small mb-1">Instagram</CFormLabel>
                <CFormInput
                  size="sm"
                  value={props.groom_instagram || ''}
                  onChange={(e) => handlePropChange('groom_instagram', e.target.value)}
                />
              </div>
            </div>

            {/* Profil Wanita */}
            <div className="p-2 rounded border bg-light">
              <h6 className="fw-bold small text-dark mb-2">Mempelai Wanita</h6>
              <div className="mb-2">
                <CFormLabel className="small mb-1">Nama Lengkap</CFormLabel>
                <CFormInput
                  size="sm"
                  value={props.bride_name || ''}
                  onChange={(e) => handlePropChange('bride_name', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <CFormLabel className="small mb-1">Keterangan Orang Tua</CFormLabel>
                <CFormInput
                  size="sm"
                  value={props.bride_parents || ''}
                  onChange={(e) => handlePropChange('bride_parents', e.target.value)}
                />
              </div>
              <div className="mb-2">
                <CFormLabel className="small mb-1">Foto Wanita</CFormLabel>
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
                  color="light"
                  size="sm"
                  className="border w-100 d-flex align-items-center justify-content-center gap-1"
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
                <CFormLabel className="small mb-1">Instagram</CFormLabel>
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
              <CFormLabel className="fw-bold small">Judul Countdown</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Target Tanggal &amp; Waktu</CFormLabel>
              <CFormInput
                type="datetime-local"
                size="sm"
                value={props.target_date ? props.target_date.slice(0, 16) : ''}
                onChange={(e) => handlePropChange('target_date', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Deskripsi Catatan</CFormLabel>
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
              <CFormLabel className="fw-bold small">Judul Rangkaian Acara</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Subjudul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.subtitle || ''}
                onChange={(e) => handlePropChange('subtitle', e.target.value)}
              />
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <CFormLabel className="fw-bold small mb-0">Daftar Sesi Acara</CFormLabel>
                <CButton
                  size="sm"
                  color="light"
                  className="py-0 px-2 border"
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
                <div key={evt.id || idx} className="p-2 rounded border bg-light mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold small">Sesi #{idx + 1}</span>
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

        {/* ===================== LOCATION MAP ===================== */}
        {section.type === 'LocationMap' && (
          <div className="d-flex flex-column gap-3">
            <div>
              <CFormLabel className="fw-bold small">Judul Bagian</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Nama Gedung / Tempat</CFormLabel>
              <CFormInput
                size="sm"
                value={props.venue_name || ''}
                onChange={(e) => handlePropChange('venue_name', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Alamat Lengkap</CFormLabel>
              <CFormTextarea
                rows={2}
                value={props.address || ''}
                onChange={(e) => handlePropChange('address', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Google Maps Embed URL</CFormLabel>
              <CFormInput
                size="sm"
                value={props.maps_embed_url || ''}
                onChange={(e) => handlePropChange('maps_embed_url', e.target.value)}
              />
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                URL iframe src Google Maps embed
              </small>
            </div>
            <div>
              <CFormLabel className="fw-bold small">Google Maps Link Langsung</CFormLabel>
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
              <CFormLabel className="fw-bold small">Judul Galeri</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Subjudul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.subtitle || ''}
                onChange={(e) => handlePropChange('subtitle', e.target.value)}
              />
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <CFormLabel className="fw-bold small mb-0">Foto Galeri ({props.images?.length || 0})</CFormLabel>
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
                    color="light"
                    className="py-0 px-2 border d-flex align-items-center gap-1"
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
                  <div key={idx} className="p-2 border rounded bg-light d-flex align-items-center gap-2">
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
              <CFormLabel className="fw-bold small">Judul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Subjudul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.subtitle || ''}
                onChange={(e) => handlePropChange('subtitle', e.target.value)}
              />
            </div>
            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <CFormLabel className="fw-bold small mb-0">Linimasa Cerita</CFormLabel>
                <CButton
                  size="sm"
                  color="light"
                  className="py-0 px-2 border"
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
                <div key={idx} className="p-2 border rounded bg-light mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold small">Kisah #{idx + 1}</span>
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
              <CFormLabel className="fw-bold small">Judul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Catatan Pengantar</CFormLabel>
              <CFormTextarea
                rows={2}
                value={props.note || ''}
                onChange={(e) => handlePropChange('note', e.target.value)}
              />
            </div>

            <div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <CFormLabel className="fw-bold small mb-0">Daftar Rekening / Dompet Digital</CFormLabel>
                <CButton
                  size="sm"
                  color="light"
                  className="py-0 px-2 border"
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
                <div key={idx} className="p-2 border rounded bg-light mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="fw-bold small">Rekening #{idx + 1}</span>
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
              <CFormLabel className="fw-bold small">Alamat Kirim Kado Fisik</CFormLabel>
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
              <CFormLabel className="fw-bold small">Judul Formulir RSVP</CFormLabel>
              <CFormInput
                size="sm"
                value={props.title || ''}
                onChange={(e) => handlePropChange('title', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Subjudul</CFormLabel>
              <CFormInput
                size="sm"
                value={props.subtitle || ''}
                onChange={(e) => handlePropChange('subtitle', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Catatan Batas Konfirmasi</CFormLabel>
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
              <CFormLabel className="fw-bold small">Kalimat Penutup</CFormLabel>
              <CFormTextarea
                rows={2}
                value={props.closing_quote || ''}
                onChange={(e) => handlePropChange('closing_quote', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Tanda Tangan Keluarga</CFormLabel>
              <CFormInput
                size="sm"
                value={props.family_signatures || ''}
                onChange={(e) => handlePropChange('family_signatures', e.target.value)}
              />
            </div>
            <div>
              <CFormLabel className="fw-bold small">Watermark / Kredit Brand</CFormLabel>
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
