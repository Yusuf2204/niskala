import React from 'react'
import PropTypes from 'prop-types'
import { CButton, CBadge, CSpinner, CButtonGroup } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilArrowLeft,
  cilActionUndo,
  cilActionRedo,
  cilScreenDesktop,
  cilMobile,
  cilCheckCircle,
  cilCloudUpload,
  cilExternalLink,
} from '@coreui/icons'
import { useNavigate } from 'react-router-dom'

const EditorTopBar = ({
  invitation,
  autosaveStatus,
  lastSavedAt,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  viewportMode,
  onToggleViewport,
  onOpenPreview,
  onManualSave,
  onPublish,
  publishLoading,
}) => {
  const navigate = useNavigate()

  return (
    <div className="d-flex flex-wrap justify-content-between align-items-center px-3 py-2 border-bottom shadow-sm editor-topbar position-sticky top-0 z-3">
      {/* Zona Kiri: Back button, Title & Autosave status */}
      <div className="d-flex align-items-center gap-2">
        <CButton
          color="secondary"
          size="sm"
          variant="ghost"
          onClick={() => navigate('/invitations/list')}
          className="d-flex align-items-center gap-1 text-body fw-semibold"
          title="Kembali ke Daftar Undangan"
        >
          <CIcon icon={cilArrowLeft} size="sm" />
          <span className="d-none d-md-inline">Daftar Undangan</span>
        </CButton>

        <div className="vr my-1 text-body-secondary" style={{ height: '24px' }} />

        <div>
          <div className="d-flex align-items-center gap-2">
            <span className="fw-bold text-body" style={{ fontSize: '0.95rem' }}>
              {invitation?.title || 'Memuat Undangan...'}
            </span>
            <CBadge
              color={
                invitation?.status === 'published'
                  ? 'success'
                  : invitation?.status === 'archived'
                    ? 'secondary'
                    : 'warning'
              }
              className="text-uppercase"
              style={{ fontSize: '0.65rem' }}
            >
              {invitation?.status || 'draft'}
            </CBadge>
          </div>
          <small className="text-body-secondary d-block" style={{ fontSize: '0.75rem' }}>
            /{invitation?.slug || ''}
          </small>
        </div>

        {/* Indikator Autosave */}
        <div className="ms-3 d-none d-lg-flex align-items-center gap-1">
          {autosaveStatus === 'saving' && (
            <span className="badge bg-body-secondary text-body border d-flex align-items-center gap-1">
              <CSpinner size="sm" style={{ width: '0.8rem', height: '0.8rem' }} />
              Menyimpan...
            </span>
          )}
          {autosaveStatus === 'saved' && (
            <span className="badge bg-success-subtle text-success border border-success-subtle d-flex align-items-center gap-1">
              <CIcon icon={cilCheckCircle} size="sm" />
              Tersimpan di Cloud
              {lastSavedAt && ` (${lastSavedAt})`}
            </span>
          )}
          {autosaveStatus === 'error' && (
            <span
              className="badge bg-danger text-white d-flex align-items-center gap-1 cursor-pointer"
              onClick={onManualSave}
              title="Klik untuk mencoba simpan kembali"
            >
              Gagal Menyimpan • Coba Lagi
            </span>
          )}
          {autosaveStatus === 'idle' && (
            <span className="badge bg-body-secondary text-body-secondary border">
              ● Tersimpan
            </span>
          )}
        </div>
      </div>

      {/* Zona Tengah: Undo / Redo & Viewport Switcher (Web Default!) */}
      <div className="d-flex align-items-center gap-2 my-1 my-md-0">
        {/* Undo / Redo buttons */}
        <CButtonGroup size="sm" role="group">
          <CButton
            color="secondary"
            variant="outline"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <CIcon icon={cilActionUndo} size="sm" />
          </CButton>
          <CButton
            color="secondary"
            variant="outline"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            <CIcon icon={cilActionRedo} size="sm" />
          </CButton>
        </CButtonGroup>

        <div className="vr my-1 text-body-secondary" style={{ height: '24px' }} />

        {/* Viewport Mode Switcher: Desktop Web is Default! */}
        <CButtonGroup size="sm" role="group">
          <CButton
            color="secondary"
            variant={viewportMode === 'web' ? undefined : 'outline'}
            onClick={() => onToggleViewport('web')}
            title="Tampilan Versi Web / Desktop (Default)"
            className="d-flex align-items-center gap-1"
            style={
              viewportMode === 'web'
                ? { backgroundColor: '#A68B65', borderColor: '#A68B65', color: '#FFFFFF', fontWeight: 600 }
                : {}
            }
          >
            <CIcon icon={cilScreenDesktop} size="sm" />
            <span className="d-none d-sm-inline">Web Desktop</span>
          </CButton>
          <CButton
            color="secondary"
            variant={viewportMode === 'mobile' ? undefined : 'outline'}
            onClick={() => onToggleViewport('mobile')}
            title="Tampilan Versi Mobile (390px)"
            className="d-flex align-items-center gap-1"
            style={
              viewportMode === 'mobile'
                ? { backgroundColor: '#A68B65', borderColor: '#A68B65', color: '#FFFFFF', fontWeight: 600 }
                : {}
            }
          >
            <CIcon icon={cilMobile} size="sm" />
            <span className="d-none d-sm-inline">Mobile</span>
          </CButton>
        </CButtonGroup>
      </div>

      {/* Zona Kanan: Pratinjau & Publikasi */}
      <div className="d-flex align-items-center gap-2">
        <CButton
          color="secondary"
          size="sm"
          variant="outline"
          onClick={onOpenPreview}
          className="d-flex align-items-center gap-1 text-body"
          title="Pratinjau Layar Penuh"
        >
          <CIcon icon={cilExternalLink} size="sm" />
          <span className="d-none d-md-inline">Preview</span>
        </CButton>

        <CButton
          color="secondary"
          size="sm"
          variant="outline"
          onClick={onManualSave}
          className="d-flex align-items-center gap-1 text-body"
          title="Simpan Perubahan Sekarang"
        >
          <CIcon icon={cilCloudUpload} size="sm" />
          <span className="d-none d-md-inline">Simpan</span>
        </CButton>

        <CButton
          size="sm"
          onClick={onPublish}
          disabled={publishLoading || invitation?.status === 'published'}
          className="d-flex align-items-center gap-1 fw-semibold text-white"
          style={{
            backgroundColor: invitation?.status === 'published' ? '#4A7C59' : '#A68B65',
            borderColor: invitation?.status === 'published' ? '#4A7C59' : '#A68B65',
          }}
          title={
            invitation?.status === 'published'
              ? 'Undangan sudah aktif dan dipublikasikan'
              : 'Publikasikan undangan agar dapat diakses tamu'
          }
        >
          {publishLoading ? (
            <CSpinner size="sm" />
          ) : (
            <CIcon icon={cilCheckCircle} size="sm" />
          )}
          <span>{invitation?.status === 'published' ? 'Sudah Publish' : 'Publikasikan'}</span>
        </CButton>
      </div>
    </div>
  )
}

EditorTopBar.propTypes = {
  invitation: PropTypes.object,
  autosaveStatus: PropTypes.string,
  lastSavedAt: PropTypes.string,
  canUndo: PropTypes.bool,
  canRedo: PropTypes.bool,
  onUndo: PropTypes.func,
  onRedo: PropTypes.func,
  viewportMode: PropTypes.string,
  onToggleViewport: PropTypes.func,
  onOpenPreview: PropTypes.func,
  onManualSave: PropTypes.func,
  onPublish: PropTypes.func,
  publishLoading: PropTypes.bool,
}

export default EditorTopBar
