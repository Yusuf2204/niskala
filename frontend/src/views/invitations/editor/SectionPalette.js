import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  CNav,
  CNavItem,
  CNavLink,
  CButton,
  CBadge,
  CFormInput,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilPlus,
  cilTrash,
  cilChevronTop,
  cilChevronBottom,
  cilClone,
  cilSearch,
} from '@coreui/icons'
import { COMPONENT_REGISTRY, createNewSection } from './registry'

const SectionPalette = ({
  sections,
  selectedSectionId,
  onSelectSection,
  onAddSection,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
}) => {
  const [activeTab, setActiveTab] = useState('library') // 'library' | 'layers'
  const [searchQuery, setSearchQuery] = useState('')

  const registryItems = Object.values(COMPONENT_REGISTRY).filter((item) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q)
    )
  })

  return (
    <div
      className="d-flex flex-column h-100 editor-sidebar-panel border-end shadow-sm"
      style={{
        width: '320px',
        minWidth: '300px',
      }}
    >
      {/* Tab Navigasi Panel Kiri */}
      <div className="p-2 border-bottom panel-header">
        <CNav variant="pills" layout="fill" className="nav-sm">
          <CNavItem>
            <CNavLink
              active={activeTab === 'library'}
              onClick={() => setActiveTab('library')}
              className="py-1 px-2 small cursor-pointer fw-semibold text-center"
              style={{
                backgroundColor: activeTab === 'library' ? '#A68B65' : 'transparent',
                color: activeTab === 'library' ? '#FFFFFF' : 'var(--cui-body-color)',
                cursor: 'pointer',
              }}
            >
              + Katalog Komponen
            </CNavLink>
          </CNavItem>
          <CNavItem>
            <CNavLink
              active={activeTab === 'layers'}
              onClick={() => setActiveTab('layers')}
              className="py-1 px-2 small cursor-pointer fw-semibold text-center"
              style={{
                backgroundColor: activeTab === 'layers' ? '#A68B65' : 'transparent',
                color: activeTab === 'layers' ? '#FFFFFF' : 'var(--cui-body-color)',
                cursor: 'pointer',
              }}
            >
              Urutan Section ({sections.length})
            </CNavLink>
          </CNavItem>
        </CNav>
      </div>

      {/* Konten Tab 1: Katalog Komponen */}
      {activeTab === 'library' && (
        <div className="d-flex flex-column flex-grow-1 overflow-hidden">
          <div className="p-2 border-bottom">
            <div className="position-relative">
              <CFormInput
                size="sm"
                placeholder="Cari komponen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pe-4"
              />
              <CIcon
                icon={cilSearch}
                size="sm"
                className="position-absolute text-body-secondary"
                style={{ right: '10px', top: '50%', transform: 'translateY(-50%)' }}
              />
            </div>
          </div>

          <div className="flex-grow-1 overflow-y-auto p-2">
            <small className="text-body-secondary text-uppercase fw-bold px-1 mb-2 d-block" style={{ fontSize: '0.7rem' }}>
              Pilih Section Untuk Ditambahkan
            </small>

            <div className="d-flex flex-column gap-2">
              {registryItems.map((item) => (
                <div
                  key={item.type}
                  className="p-2 rounded panel-card d-flex flex-column gap-1 transition-all"
                  style={{
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold text-body small">{item.name}</span>
                    <CBadge
                      color="secondary"
                      className="border"
                      style={{ fontSize: '0.65rem' }}
                    >
                      {item.category}
                    </CBadge>
                  </div>
                  <p className="text-body-secondary mb-2" style={{ fontSize: '0.75rem', lineHeight: '1.3' }}>
                    {item.description}
                  </p>
                  <div className="d-flex justify-content-end">
                    <CButton
                      size="sm"
                      onClick={() => onAddSection(createNewSection(item.type))}
                      className="py-0 px-2 fw-semibold d-flex align-items-center gap-1 text-white"
                      style={{
                        backgroundColor: '#A68B65',
                        borderColor: '#A68B65',
                        fontSize: '0.75rem',
                      }}
                    >
                      <CIcon icon={cilPlus} size="sm" /> Tambah
                    </CButton>
                  </div>
                </div>
              ))}

              {registryItems.length === 0 && (
                <div className="text-center py-4 text-body-secondary small">
                  Tidak ada komponen yang cocok dengan kata kunci &quot;{searchQuery}&quot;.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Konten Tab 2: Struktur Layer & Urutan Section */}
      {activeTab === 'layers' && (
        <div className="flex-grow-1 overflow-y-auto p-2">
          <small className="text-body-secondary text-uppercase fw-bold px-1 mb-2 d-block" style={{ fontSize: '0.7rem' }}>
            Urutan Section Pada Kanvas ({sections.length})
          </small>

          {sections.length === 0 ? (
            <div className="text-center py-4 text-body-secondary small">
              Belum ada section di kanvas. Silakan tambahkan dari tab Katalog Komponen.
            </div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {sections.map((sec, idx) => {
                const meta = COMPONENT_REGISTRY[sec.type] || {}
                const isSelected = sec.id === selectedSectionId

                return (
                  <div
                    key={sec.id}
                    onClick={() => onSelectSection(sec.id)}
                    className={`p-2 rounded layer-item cursor-pointer d-flex align-items-center justify-content-between ${
                      isSelected ? 'selected' : ''
                    }`}
                  >
                    <div className="d-flex align-items-center gap-2 overflow-hidden">
                      <span
                        className="badge rounded-circle p-1 d-flex align-items-center justify-content-center text-white"
                        style={{
                          backgroundColor: isSelected ? '#A68B65' : '#4B5563',
                          width: '20px',
                          height: '20px',
                          fontSize: '0.7rem',
                        }}
                      >
                        {idx + 1}
                      </span>
                      <div className="text-truncate">
                        <div className="fw-semibold text-body small text-truncate">
                          {meta.name || sec.type}
                        </div>
                        <small className="text-body-secondary d-block font-monospace" style={{ fontSize: '0.65rem' }}>
                          {sec.id}
                        </small>
                      </div>
                    </div>

                    {/* Aksi Baris Layer: Atas, Bawah, Duplikat, Hapus */}
                    <div className="d-flex align-items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-body-secondary"
                        disabled={idx === 0}
                        onClick={() => onMoveSection(idx, idx - 1)}
                        title="Geser ke Atas"
                      >
                        <CIcon icon={cilChevronTop} size="sm" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-body-secondary"
                        disabled={idx === sections.length - 1}
                        onClick={() => onMoveSection(idx, idx + 1)}
                        title="Geser ke Bawah"
                      >
                        <CIcon icon={cilChevronBottom} size="sm" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-warning"
                        onClick={() => onDuplicateSection(sec.id)}
                        title="Duplikat Section"
                      >
                        <CIcon icon={cilClone} size="sm" />
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-danger"
                        onClick={() => onDeleteSection(sec.id)}
                        title="Hapus Section"
                      >
                        <CIcon icon={cilTrash} size="sm" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

SectionPalette.propTypes = {
  sections: PropTypes.array.isRequired,
  selectedSectionId: PropTypes.string,
  onSelectSection: PropTypes.func.isRequired,
  onAddSection: PropTypes.func.isRequired,
  onMoveSection: PropTypes.func.isRequired,
  onDuplicateSection: PropTypes.func.isRequired,
  onDeleteSection: PropTypes.func.isRequired,
}

export default SectionPalette
