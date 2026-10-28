import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CButtonGroup,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilScreenDesktop, cilMobile } from '@coreui/icons'
import SECTION_COMPONENTS from './sections'

const PreviewModal = ({ visible, onClose, sections = [], title = 'Pratinjau Undangan' }) => {
  const [previewViewport, setPreviewViewport] = useState('web') // 'web' | 'mobile'

  const isWeb = previewViewport === 'web'

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      size="xl"
      fullscreen
      scrollable
      className="p-0"
    >
      <CModalHeader
        className="d-flex justify-content-between align-items-center py-2 px-3 border-bottom"
        style={{ backgroundColor: '#34342F', color: '#F1EDE5' }}
      >
        <div className="d-flex align-items-center gap-3">
          <CModalTitle className="fs-6 fw-bold mb-0 text-white">
            👁 Pratinjau: {title}
          </CModalTitle>

          <CButtonGroup size="sm" role="group">
            <CButton
              color={isWeb ? 'light' : 'dark'}
              onClick={() => setPreviewViewport('web')}
              className="py-1 px-3"
              style={isWeb ? { backgroundColor: '#F1EDE5', color: '#34342F' } : {}}
            >
              <CIcon icon={cilScreenDesktop} size="sm" className="me-1" />
              Versi Web Desktop
            </CButton>
            <CButton
              color={!isWeb ? 'light' : 'dark'}
              onClick={() => setPreviewViewport('mobile')}
              className="py-1 px-3"
              style={!isWeb ? { backgroundColor: '#F1EDE5', color: '#34342F' } : {}}
            >
              <CIcon icon={cilMobile} size="sm" className="me-1" />
              Versi Mobile (390px)
            </CButton>
          </CButtonGroup>
        </div>
      </CModalHeader>

      <CModalBody
        className="p-0 overflow-y-auto d-flex justify-content-center"
        style={{ backgroundColor: '#242420' }}
      >
        <div
          className="w-100 my-md-4 shadow-lg overflow-hidden transition-all invitation-canvas-isolated"
          style={{
            maxWidth: isWeb ? '1080px' : '390px',
            backgroundColor: '#FAF8F5',
            color: '#34342F',
            borderRadius: isWeb ? '12px' : '32px',
            border: isWeb ? 'none' : '8px solid #111111',
            minHeight: '100%',
          }}
        >
          {sections.map((sec) => {
            const Component = SECTION_COMPONENTS[sec.type]
            if (!Component) return null
            return <Component key={sec.id} props={sec.props || {}} isWeb={isWeb} />
          })}
        </div>
      </CModalBody>
    </CModal>
  )
}

PreviewModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  sections: PropTypes.array,
  title: PropTypes.string,
}

export default PreviewModal

