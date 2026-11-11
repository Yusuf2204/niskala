import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { CornerOrnaments, SectionHeaderOrnaments, ThemeBatikOverlay } from './ThemeDecorators'

const GiftRegistrySection = ({ props = {}, isWeb = true, theme = {} }) => {
  const {
    title = 'Tanda Kasih & Hadiah',
    note = 'Doa restu Anda merupakan karunia terindah bagi kami. Namun jika Anda ingin memberikan hadiah, kami menyediakan amplop digital berikut:',
    accounts = [],
    physical_gift_address = '',
  } = props

  const [copiedIndex, setCopiedIndex] = useState(null)

  const handleCopy = (text, index) => {
    navigator.clipboard?.writeText(text)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const assets = theme?.assets || {}
  const isOrnamentAnimated = theme?.animation?.ornament_motion !== false
  const dividerUrl = props.divider_url || assets.divider_url || ''
  const cornerUrl = props.corner_url || assets.corner_url || ''
  const patternUrl =
    props.pattern_secondary_url ||
    props.pattern_url ||
    assets.pattern_secondary_url ||
    assets.pattern_url ||
    ''

  return (
    <div
      className="position-relative py-5 px-3 text-center inv-section-framed"
      style={{
        backgroundColor: 'var(--inv-surface, #F3ECE0)',
        color: 'var(--inv-text, #2B1E16)',
      }}
    >
      <ThemeBatikOverlay patternUrl={patternUrl} isWeb={isWeb} opacity={0.3} />
      <CornerOrnaments
        cornerUrl={cornerUrl}
        isWeb={isWeb}
        variant="full"
        opacity={0.55}
        size={isWeb ? 78 : 50}
        offset={isWeb ? 12 : 8}
        animated={isOrnamentAnimated}
      />

      <div className="container position-relative" style={{ maxWidth: isWeb ? '860px' : '100%', zIndex: 2 }}>
        <SectionHeaderOrnaments
          eyebrow="Amplop Digital"
          title={title}
          subtitle={note}
          dividerUrl={dividerUrl}
          isWeb={isWeb}
        />

        {/* Bank Cards */}
        <div
          className={`d-flex ${isWeb ? 'flex-row' : 'flex-column'} justify-content-center align-items-stretch gap-3 mb-4 mt-4`}
        >
          {accounts.map((acc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-3 shadow-sm flex-grow-1 text-center inv-card-framed"
              style={{
                backgroundColor: 'var(--inv-card, #FFFDF9)',
                border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.4))',
                maxWidth: isWeb ? '340px' : '100%',
              }}
            >
              <div
                className="fw-bold text-uppercase mb-2"
                style={{ color: 'var(--inv-primary, #8A6728)', letterSpacing: '1px' }}
              >
                {acc.bank}
              </div>
              <div
                className="fw-bold font-monospace my-2"
                style={{ fontSize: '1.25rem', color: 'var(--inv-text, #2B1E16)' }}
              >
                {acc.number}
              </div>
              <p className="small mb-3" style={{ color: 'var(--inv-muted, #6A5342)' }}>
                a.n. {acc.holder}
              </p>
              <button
                type="button"
                className="btn btn-sm px-3 rounded-pill"
                onClick={() => handleCopy(acc.number, idx)}
                style={{
                  backgroundColor:
                    copiedIndex === idx ? '#4A7C59' : 'var(--inv-dark-bg, #241B15)',
                  color: '#FAF6EE',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.35))',
                }}
              >
                {copiedIndex === idx ? '✓ Berhasil Disalin' : 'Salin Nomor'}
              </button>
            </div>
          ))}
        </div>

        {physical_gift_address && (
          <div
            className="p-3 rounded-3 text-start mx-auto"
            style={{
              backgroundColor: 'var(--inv-card, #FFFDF9)',
              border: '1px dashed var(--inv-border, rgba(197, 160, 89, 0.5))',
              maxWidth: '680px',
            }}
          >
            <h6 className="fw-bold mb-1" style={{ color: 'var(--inv-text, #2B1E16)' }}>
              📦 Kirim Kado Fisik
            </h6>
            <p className="small mb-0" style={{ color: 'var(--inv-muted, #6A5342)' }}>
              {physical_gift_address}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

GiftRegistrySection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
  theme: PropTypes.object,
}

export default GiftRegistrySection

