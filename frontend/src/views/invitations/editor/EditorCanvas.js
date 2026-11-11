import React from 'react'
import PropTypes from 'prop-types'
import CIcon from '@coreui/icons-react'
import {
  cilChevronTop,
  cilChevronBottom,
  cilClone,
  cilTrash,
  cilPlus,
} from '@coreui/icons'
import SECTION_COMPONENTS from './sections'
import { COMPONENT_REGISTRY } from './registry'
import { buildInvitationCssVars, resolveInvitationTheme } from '../../../utils/invitationTheme'

const EditorCanvas = ({
  invitation = null,
  sections,
  selectedSectionId,
  onSelectSection,
  onMoveSection,
  onDuplicateSection,
  onDeleteSection,
  onAddSection,
  viewportMode, // 'web' | 'mobile'
}) => {
  const isWeb = viewportMode === 'web'
  const resolvedTheme = resolveInvitationTheme(invitation)
  const themeVars = buildInvitationCssVars(resolvedTheme)

  return (
    <div className="flex-grow-1 overflow-y-auto p-3 p-md-4 d-flex flex-column align-items-center editor-workspace">
      {/* Viewport Info Pill */}
      <div className="mb-3 d-flex align-items-center gap-2">
        <span
          className="badge px-3 py-1 rounded-pill shadow-sm"
          style={{
            backgroundColor: '#34342F',
            color: '#D8C2A0',
            fontSize: '0.75rem',
            letterSpacing: '0.5px',
          }}
        >
          {isWeb
            ? '🖥 Tampilan Versi Web / Desktop (Default)'
            : '📱 Tampilan Versi Mobile (390px Phone Frame)'}
        </span>
        <span className="badge bg-body-secondary text-body border small">
          {sections.length} Section Terpasang
        </span>
      </div>

      {/* Kanvas Pembungkus (Web Desktop vs Mobile Mockup) */}
      <div
        className="w-100 transition-all"
        style={{
          maxWidth: isWeb ? '1040px' : '390px',
          transition: 'max-width 0.3s ease-in-out',
        }}
      >
        <div
          className={`invitation-canvas-isolated invitation-card-stack ${isWeb ? '' : 'is-mobile-stack'} shadow-lg overflow-hidden position-relative`}
          data-inv-theme={resolvedTheme.themeStyle}
          data-inv-animation={resolvedTheme.animation?.preset || 'classic-minimal'}
          style={{
            ...themeVars,
            borderRadius: isWeb ? '18px' : '36px',
            border: isWeb ? '1px solid rgba(52, 52, 47, 0.2)' : '10px solid #1C1C18',
            minHeight: '600px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.18)',
            color: 'var(--inv-text, #2B1E16)',
          }}
        >
          {/* Simulated Mobile Camera Notch (only shown in mobile mode) */}
          {!isWeb && (
            <div
              className="position-sticky top-0 start-50 translate-middle-x mt-1 mb-0 d-flex justify-content-center align-items-center"
              style={{
                zIndex: 1050,
                width: '120px',
                height: '22px',
                backgroundColor: '#242420',
                borderRadius: '12px',
              }}
            >
              <div
                className="rounded-circle"
                style={{ width: '8px', height: '8px', backgroundColor: '#34342F' }}
              />
            </div>
          )}

          {/* Render All Sections in Order */}
          {sections.length === 0 ? (
            <div
              className="py-5 text-center px-4 rounded-4"
              style={{
                backgroundColor: 'var(--inv-bg, #FAF6EE)',
                border: '1px solid rgba(197, 160, 89, 0.3)',
                color: '#34342F',
              }}
            >
              <div
                className="mx-auto my-4 d-flex align-items-center justify-content-center rounded-circle"
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'rgba(166, 139, 101, 0.15)',
                  color: '#A68B65',
                  fontSize: '2rem',
                }}
              >
                ✦
              </div>
              <h4
                className="font-serif fw-bold"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#34342F' }}
              >
                Kanvas Undangan Masih Kosong
              </h4>
              <p className="small mx-auto mb-4" style={{ maxWidth: '420px', color: 'rgba(52, 52, 47, 0.7)' }}>
                Pilih dan tambahkan komponen dari panel kiri (Hero Cover, Profil Mempelai, Rangkaian
                Acara, Countdown, dan lainnya) untuk mulai menyusun undangan.
              </p>
              <button
                type="button"
                className="btn btn-sm btn-niskala-gold px-4 py-2 rounded-pill shadow-sm"
                onClick={() => onAddSection()}
              >
                <CIcon icon={cilPlus} size="sm" className="me-1" /> Tambah Hero Cover Standar
              </button>
            </div>
          ) : (
            sections.map((sec, idx) => {
              const Component = SECTION_COMPONENTS[sec.type]
              const meta = COMPONENT_REGISTRY[sec.type] || {}
              const isSelected = sec.id === selectedSectionId

              return (
                <div
                  key={sec.id}
                  onClick={() => onSelectSection(sec.id)}
                  className={`invitation-card-slot editor-section-card ${isWeb ? '' : 'is-mobile-slot'} ${isSelected ? 'is-selected' : ''}`}
                >
                  {/* Floating Action Pill for the Selected Section */}
                  {isSelected && (
                    <div
                      className="position-absolute end-0 top-0 m-2 d-flex align-items-center gap-1 shadow-sm rounded-pill px-2 py-1"
                      style={{
                        zIndex: 100,
                        backgroundColor: '#34342F',
                        color: '#F1EDE5',
                        border: '1px solid #A68B65',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        className="fw-bold px-1"
                        style={{ fontSize: '0.7rem', color: '#D8C2A0' }}
                      >
                        {meta.name || sec.type}
                      </span>

                      <div className="vr my-1" style={{ height: '14px', backgroundColor: '#A68B65' }} />

                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-white"
                        disabled={idx === 0}
                        onClick={() => onMoveSection(idx, idx - 1)}
                        title="Geser ke Atas"
                        style={{ opacity: idx === 0 ? 0.4 : 1 }}
                      >
                        <CIcon icon={cilChevronTop} size="sm" />
                      </button>

                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-white"
                        disabled={idx === sections.length - 1}
                        onClick={() => onMoveSection(idx, idx + 1)}
                        title="Geser ke Bawah"
                        style={{ opacity: idx === sections.length - 1 ? 0.4 : 1 }}
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
                  )}

                  {/* Render Section Component */}
                  {Component ? (
                    <Component props={sec.props || {}} isWeb={isWeb} theme={resolvedTheme} />
                  ) : (
                    <div className="p-4 text-center bg-danger-subtle text-danger">
                      Komponen <strong>{sec.type}</strong> tidak ditemukan pada registry.
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

EditorCanvas.propTypes = {
  invitation: PropTypes.object,
  sections: PropTypes.array.isRequired,
  selectedSectionId: PropTypes.string,
  onSelectSection: PropTypes.func.isRequired,
  onMoveSection: PropTypes.func.isRequired,
  onDuplicateSection: PropTypes.func.isRequired,
  onDeleteSection: PropTypes.func.isRequired,
  onAddSection: PropTypes.func.isRequired,
  viewportMode: PropTypes.string.isRequired,
}

export default EditorCanvas
