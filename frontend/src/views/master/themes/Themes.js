import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CRow,
  CCol,
  CCard,
  CCardBody,
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
import { cilPaint, cilReload, cilCheckAlt, cilPlus } from '@coreui/icons'
import api from '../../../services/api'
import { GununganEmblem } from '../../invitations/editor/sections/Ornaments'

const Themes = () => {
  const navigate = useNavigate()
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

  const handleCreateWithTheme = (themeId) => {
    navigate(`/invitations/create?theme_id=${themeId}`)
  }

  return (
    <div className="themes-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold text-body mb-1 d-flex align-items-center gap-2">
            <CIcon icon={cilPaint} className="text-secondary" /> Master Tema Undangan
          </h4>
          <p className="text-muted mb-0 small">
            Katalog master tema undangan pernikahan &amp; perayaan dengan aset visual, ornamen khusus, dan rangkaian prosesi adat bawaan.
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
        <CCard className="text-center py-5 border-0 shadow-sm rounded-3">
          <CCardBody className="py-5">
            <div
              className="mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle"
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'rgba(166, 139, 101, 0.15)',
                color: '#A68B65',
                fontSize: '1.75rem',
              }}
            >
              ✦
            </div>
            <h5 className="fw-bold text-body mb-2">Belum Ada Tema Undangan</h5>
            <p className="text-muted small mx-auto mb-0" style={{ maxWidth: '480px' }}>
              Belum ada data master tema undangan di sistem. Silakan jalankan seeder atau hubungi administrator.
            </p>
          </CCardBody>
        </CCard>
      ) : (
        <CRow className="g-4">
          {themes.map((theme) => {
            const palette = theme.default_config?.palette || {}
            const typography = theme.default_config?.typography || {}
            const sections = theme.default_config?.default_sections || []
            const presets = theme.default_config?.section_presets || {}
            const hasGunungan =
              theme.slug === 'adat-jawa' ||
              theme.default_config?.assets?.ornament === 'gunungan'

            return (
              <CCol xs={12} md={6} lg={4} key={theme.id}>
                <CCard className="h-100 shadow-sm border-0 rounded-3 overflow-hidden">
                  {/* Banner Preview Tema */}
                  <div
                    style={{
                      height: '160px',
                      background: palette.background || '#FAF6EE',
                      borderBottom: '1px solid rgba(197, 160, 89, 0.3)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: palette.text || '#2B1E16',
                      padding: '1rem',
                    }}
                  >
                    {hasGunungan && (
                      <div className="mb-2">
                        <GununganEmblem
                          width={38}
                          height={46}
                          color={palette.primary || '#C5A059'}
                        />
                      </div>
                    )}
                    <span
                      style={{
                        fontFamily: typography.heading_font || "'Playfair Display', serif",
                        fontSize: '1.35rem',
                        fontWeight: 'bold',
                        letterSpacing: '0.05em',
                        color: palette.secondary || '#4A3525',
                      }}
                    >
                      {theme.name}
                    </span>
                    <span
                      className="small mt-1 px-2 py-0.5 rounded-pill"
                      style={{
                        fontSize: '0.72rem',
                        backgroundColor: 'rgba(197, 160, 89, 0.18)',
                        color: palette.secondary || '#4A3525',
                        fontWeight: 600,
                      }}
                    >
                      Tema Spesifik Budaya Tradisi
                    </span>

                    {theme.is_active && (
                      <span
                        className="badge position-absolute top-0 end-0 m-2"
                        style={{ backgroundColor: '#C5A059', color: '#242420', fontWeight: 'bold' }}
                      >
                        <CIcon icon={cilCheckAlt} size="sm" className="me-1" /> Aktif
                      </span>
                    )}
                  </div>

                  <CCardBody className="d-flex flex-column justify-content-between p-3">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge rounded-pill theme-category-badge px-2 py-1 small">
                          {theme.category.toUpperCase()}
                        </span>
                        <small className="text-body-secondary">v{theme.version}</small>
                      </div>

                      <p className="text-body-secondary small mb-3" style={{ minHeight: '38px' }}>
                        {theme.description || 'Tidak ada deskripsi tema.'}
                      </p>

                      {/* Feature Pills */}
                      <div className="d-flex flex-wrap gap-1 mb-3">
                        {hasGunungan && (
                          <span className="badge theme-badge-accent">
                            ◈ Ornamen Gunungan
                          </span>
                        )}
                        {presets.TraditionAccordion && (
                          <span className="badge theme-badge-accent">
                            ✦ Accordion 5 Prosesi Adat
                          </span>
                        )}
                        <span className="badge theme-badge-accent">
                          ✦ Palet Sogan Jawa
                        </span>
                      </div>

                      {/* Swatch Palet Warna */}
                      <div className="mb-3">
                        <small className="fw-semibold text-secondary d-block mb-1">
                          Palet Warna (60-30-10):
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
                          <strong>Default Sections:</strong> {sections.length} komponen bawaan
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-top d-flex flex-column gap-2">
                      <CButton
                        color="secondary"
                        variant="outline"
                        size="sm"
                        className="w-100"
                        onClick={() => handleOpenDetail(theme)}
                      >
                        Lihat Detail Preset
                      </CButton>
                      <CButton
                        size="sm"
                        className="btn-niskala-gold w-100 d-flex align-items-center justify-content-center gap-1"
                        onClick={() => handleCreateWithTheme(theme.id)}
                      >
                        <CIcon icon={cilPlus} size="sm" /> Buat Undangan dengan Tema Ini
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
          <CModalTitle className="fw-bold d-flex align-items-center gap-2">
            <span>Detail Tema: {selectedTheme?.name}</span>
            <CBadge color="secondary" className="border small">
              v{selectedTheme?.version}
            </CBadge>
          </CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedTheme && (
            <div>
              <p className="text-body-secondary mb-3">{selectedTheme.description}</p>

              {/* Rincian Accordion Adat jika ada */}
              {selectedTheme.default_config?.section_presets?.TraditionAccordion && (
                <div className="p-3 rounded mb-3 theme-preset-box">
                  <h6 className="fw-bold mb-2">
                    ✦ Bawaan Accordion Prosesi Adat:
                  </h6>
                  <ul className="mb-0 small ps-3">
                    {(selectedTheme.default_config.section_presets.TraditionAccordion.items || []).map((it) => (
                      <li key={it.id} className="mb-1">
                        <strong>{it.title}:</strong> {it.description}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <h6 className="fw-bold mt-3 mb-2 text-body">Konfigurasi JSON Preset Bawaan:</h6>
              <pre
                style={{
                  background: '#242420',
                  color: '#FAF8F5',
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
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
          <CButton color="secondary" variant="outline" onClick={() => setModalOpen(false)}>
            Tutup
          </CButton>
          {selectedTheme && (
            <CButton
              className="btn-niskala-gold"
              onClick={() => {
                setModalOpen(false)
                handleCreateWithTheme(selectedTheme.id)
              }}
            >
              Gunakan Tema Ini
            </CButton>
          )}
        </CModalFooter>
      </CModal>
    </div>
  )
}

export default Themes
