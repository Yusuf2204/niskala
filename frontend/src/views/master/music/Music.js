import React, { useEffect, useState, useRef } from 'react'
import {
  CCard,
  CCardBody,
  CButton,
  CBadge,
  CSpinner,
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
  CForm,
  CFormInput,
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilMusicNote,
  cilReload,
  cilPlus,
  cilTrash,
  cilMediaPlay,
  cilMediaPause,
} from '@coreui/icons'
import { useSelector } from 'react-redux'
import api from '../../../services/api'
import { toastSuccess, toastError } from '../../../services/toastService'

const Music = () => {
  const [tracks, setTracks] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeTrackId, setActiveTrackId] = useState(null)
  const [uploadModal, setUploadModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const currentUser = useSelector((state) => state.user)
  const isAdmin = currentUser?.role?.role_name === 'admin' || currentUser?.role_id === 1

  const audioRef = useRef(new Audio())

  // Form states
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [category, setCategory] = useState('wedding')
  const [file, setFile] = useState(null)

  const fetchTracks = async () => {
    setLoading(true)
    try {
      const res = await api.get('/v1/music')
      setTracks(res.data.data || [])
    } catch {
      setTracks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTracks()

    const audio = audioRef.current
    const handleEnded = () => setActiveTrackId(null)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.pause()
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const handleTogglePlay = (track) => {
    const audio = audioRef.current

    if (activeTrackId === track.id) {
      audio.pause()
      setActiveTrackId(null)
    } else {
      audio.pause()
      audio.src = track.file_path
      audio
        .play()
        .then(() => {
          setActiveTrackId(track.id)
        })
        .catch(() => {
          toastError('Gagal memutar audio pratinjau.')
          setActiveTrackId(null)
        })
    }
  }

  const handleUploadSubmit = async (e) => {
    e.preventDefault()
    if (!title || !file) {
      toastError('Judul dan file audio wajib diisi.')
      return
    }

    setSubmitting(true)
    const formData = new FormData()
    formData.append('title', title)
    if (artist) formData.append('artist', artist)
    formData.append('category', category)
    formData.append('file', file)

    try {
      await api.post('/v1/music', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      toastSuccess('Musik berhasil diunggah ke katalog master.')
      setUploadModal(false)
      setTitle('')
      setArtist('')
      setFile(null)
      fetchTracks()
    } catch (err) {
      toastError(err.response?.data?.message || 'Gagal mengunggah musik.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus lagu ini dari katalog master?')) return

    try {
      await api.delete(`/v1/music/${id}`)
      toastSuccess('Musik berhasil dihapus.')
      if (activeTrackId === id) {
        audioRef.current.pause()
        setActiveTrackId(null)
      }
      fetchTracks()
    } catch {
      toastError('Gagal menghapus musik.')
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return '-'
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="music-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
            <CIcon icon={cilMusicNote} className="text-secondary" /> Master Musik Latar
          </h4>
          <p className="text-muted mb-0 small">
            Katalog master lagu pengiring yang dapat dipilih untuk latar musik otomatis pada
            undangan digital.
          </p>
        </div>
        <div className="d-flex gap-2">
          <CButton
            color="secondary"
            variant="outline"
            size="sm"
            onClick={fetchTracks}
            disabled={loading}
          >
            <CIcon icon={cilReload} className="me-1" /> Refresh
          </CButton>
          {isAdmin && (
            <CButton
              color="dark"
              size="sm"
              onClick={() => setUploadModal(true)}
              style={{ backgroundColor: '#34342F', borderColor: '#34342F', color: '#FAF8F5' }}
            >
              <CIcon icon={cilPlus} className="me-1" /> Tambah Lagu
            </CButton>
          )}
        </div>
      </div>

      <CCard className="border-0 shadow-sm rounded-3">
        <CCardBody className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <CSpinner color="secondary" />
              <p className="mt-2 text-muted small">Memuat daftar musik...</p>
            </div>
          ) : tracks.length === 0 ? (
            <div className="text-center py-5">
              <p className="text-muted mb-0">Belum ada musik di katalog master.</p>
            </div>
          ) : (
            <CTable align="middle" responsive hover className="mb-0">
              <CTableHead color="light">
                <CTableRow>
                  <CTableHeaderCell style={{ width: '60px' }} className="text-center">
                    Putar
                  </CTableHeaderCell>
                  <CTableHeaderCell>Judul Lagu & Artis</CTableHeaderCell>
                  <CTableHeaderCell>Kategori</CTableHeaderCell>
                  <CTableHeaderCell>Durasi</CTableHeaderCell>
                  <CTableHeaderCell>Tautan File</CTableHeaderCell>
                  {isAdmin && (
                    <CTableHeaderCell style={{ width: '80px' }} className="text-center">
                      Aksi
                    </CTableHeaderCell>
                  )}
                </CTableRow>
              </CTableHead>
              <CTableBody>
                {tracks.map((track) => {
                  const isPlaying = activeTrackId === track.id

                  return (
                    <CTableRow key={track.id}>
                      <CTableDataCell className="text-center">
                        <CButton
                          color={isPlaying ? 'warning' : 'light'}
                          size="sm"
                          className="rounded-circle p-2"
                          onClick={() => handleTogglePlay(track)}
                          title={isPlaying ? 'Jeda' : 'Putar Pratinjau'}
                        >
                          <CIcon icon={isPlaying ? cilMediaPause : cilMediaPlay} size="sm" />
                        </CButton>
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="fw-semibold text-dark">{track.title}</div>
                        <small className="text-muted">{track.artist || 'Artis Tidak Diketahui'}</small>
                      </CTableDataCell>
                      <CTableDataCell>
                        <CBadge color="secondary" shape="rounded-pill" className="small">
                          {track.category}
                        </CBadge>
                      </CTableDataCell>
                      <CTableDataCell className="small text-muted">
                        {formatDuration(track.duration_seconds)}
                      </CTableDataCell>
                      <CTableDataCell>
                        <small className="text-truncate d-inline-block text-secondary" style={{ maxWidth: '200px' }}>
                          {track.file_path}
                        </small>
                      </CTableDataCell>
                      {isAdmin && (
                        <CTableDataCell className="text-center">
                          <CButton
                            color="danger"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(track.id)}
                            title="Hapus Lagu"
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </CTableDataCell>
                      )}
                    </CTableRow>
                  )
                })}
              </CTableBody>
            </CTable>
          )}
        </CCardBody>
      </CCard>

      {/* Modal Upload Musik */}
      <CModal visible={uploadModal} onClose={() => setUploadModal(false)}>
        <CForm onSubmit={handleUploadSubmit}>
          <CModalHeader>
            <CModalTitle className="fw-bold">Unggah Lagu Master</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Judul Lagu *</label>
              <CFormInput
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: A Thousand Years"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Artis / Penyanyi</label>
              <CFormInput
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Contoh: Christina Perri (Instrumental)"
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Kategori</label>
              <CFormSelect
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="wedding">Pernikahan (Wedding)</option>
                <option value="birthday">Ulang Tahun (Birthday)</option>
                <option value="general">Umum (General)</option>
              </CFormSelect>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">File Audio (.mp3, maks. 10MB) *</label>
              <CFormInput
                type="file"
                accept="audio/*"
                required
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setUploadModal(false)} disabled={submitting}>
              Batal
            </CButton>
            <CButton
              type="submit"
              color="dark"
              disabled={submitting}
              style={{ backgroundColor: '#34342F', borderColor: '#34342F' }}
            >
              {submitting ? 'Mengunggah...' : 'Unggah Lagu'}
            </CButton>
          </CModalFooter>
        </CForm>
      </CModal>
    </div>
  )
}

export default Music
