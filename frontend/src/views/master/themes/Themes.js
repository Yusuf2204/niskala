import React, { useEffect, useState } from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CBadge,
  CSpinner,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPaint, cilReload, cilCheckAlt } from '@coreui/icons'
import api from '../../../services/api'

const Themes = () => {
  const [themes, setThemes] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)

  const fetchThemes = async () => {
    setLoading(true)
    try {
      const res = await api.get('/v1/themes')
      setThemes(res.data.data || [])
    } catch {
      setThemes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchThemes()
  }, [])

  const handleOpenDetail = (theme) => {
    setSelectedTheme(theme)
    setModalOpen(true)
  }

  return (
    <div className="themes-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-body mb-1 d-flex align-items-center gap-2">
            <CIcon icon={cilPaint} className="text-secondary" /> Master Tema Desain
          </h4>
          <p className="text-muted mb-0 small">
            Katalog master tema desain bawaan yang tersedia untuk seluruh undangan digital Niskala.
          </p>
        </div>
        <CButton
          color="secondary"
          variant="outline"
          size="sm"
          onClick={fetchThemes}
          disabled={loading}
          className="d-flex align-items-center gap-1"
        >
          <CIcon icon={cilReload} /> Refresh
        </CButton>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <CSpinner color="secondary" />
          <p className="mt-2 text-muted small">Memuat katalog tema...</p>
        </div>
      ) : themes.length === 0 ? (
        <CCard className="text-center py-5 border-0 shadow-sm">
          <CCardBody>
            <p className="text-muted mb-0">Belum ada tema yang terdaftar dalam katalog.</p>
          </CCardBody>
        </CCard>
      ) : (
        <CRow className="g-4">
          {themes.map((theme) => {
            const palette = theme.default_config?.palette || {}
            const typography = theme.default_config?.typography || {}
            const sections = theme.default_config?.default_sections || []

            return (
              <CCol xs={12} md={6} lg={4} key={theme.id}>
                <CCard className="h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                  <div
                    style={{
                      height: '140px',
                      background: palette.background || '#F1EDE5',
                      borderBottom: '1px solid #E5DFC5',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: palette.text || '#34342F',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: typography.heading_font || 'inherit',
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {theme.name}
                    </span>
                    <span className="small opacity-75 mt-1">Palet Desain Bawaan</span>

                    {theme.is_active && (
                      <span
                        className="badge position-absolute top-0 end-0 m-2"
                        style={{ backgroundColor: '#A68B65', color: '#fff' }}
                      >
                        <CIcon icon={cilCheckAlt} size="sm" className="me-1" /> Aktif
                      </span>
                    )}
                  </div>

                  <CCardBody className="d-flex flex-column justify-content-between p-3">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <CBadge color="dark" shape="rounded-pill" className="px-2 py-1 small">
                          {theme.category.toUpperCase()}
                        </CBadge>
                        <small className="text-muted">v{theme.version}</small>
                      </div>

                      <p className="text-muted small mb-3" style={{ minHeight: '38px' }}>
                        {theme.description || 'Tidak ada deskripsi tema.'}
                      </p>

                      <div className="mb-3">
                        <small className="fw-semibold text-secondary d-block mb-1">
                          Kombinasi Warna (60-30-10):
                        </small>
                        <div className="d-flex gap-2">
                          {Object.entries(palette).map(([key, val]) => (
                            <div
                              key={key}
                              title={`${key}: ${val}`}
                              style={{
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: val,
                                border: '1px solid #ccc',
                                cursor: 'help',
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="mb-2 small text-muted">
                        <div>
                          <strong>Heading:</strong> {typography.heading_font || '-'}
                        </div>
                        <div>
                          <strong>Body:</strong> {typography.body_font || '-'}
                        </div>
                        <div className="mt-1">
                          <strong>Default Sections:</strong> {sections.length} komponen
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-top">
                      <CButton
                        color="dark"
                        variant="outline"
                        size="sm"
                        className="w-100"
                        onClick={() => handleOpenDetail(theme)}
                      >
                        Lihat Preset Lengkap
                      </CButton>
                    </div>
                  </CCardBody>
                </CCard>
              </CCol>
            )
          })}
        </CRow>
      )}

      {/* Modal Detail Preset Tema */}
      <CModal visible={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <CModalHeader>
          <CModalTitle className="fw-bold">
            Detail Tema: {selectedTheme?.name} (v{selectedTheme?.version})
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedTheme && (
            <div>
              <p className="text-muted">{selectedTheme.description}</p>
              <h6 className="fw-bold mt-3 mb-2">Konfigurasi JSON Bawaan:</h6>
              <pre
                style={{
                  background: '#242420',
                  color: '#FAF8F5',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {JSON.stringify(selectedTheme.default_config, null, 2)}
              </pre>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalOpen(false)}>
            Tutup
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Themes

