import React, { useState } from 'react'
import PropTypes from 'prop-types'

const GiftRegistrySection = ({ props = {}, isWeb = true }) => {
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

  return (
    <div
      className="py-5 px-3 text-center"
      style={{
        backgroundColor: '#FAF8F5',
        color: '#34342F',
      }}
    >
      <div className="container" style={{ maxWidth: isWeb ? '860px' : '100%' }}>
        <p
          className="text-uppercase tracking-wider fw-semibold mb-1"
          style={{ color: '#A68B65', fontSize: '0.85rem', letterSpacing: '2px' }}
        >
          Amplop Digital
        </p>
        <h2
          className="font-serif mb-2"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: '#34342F',
            fontSize: isWeb ? '2.2rem' : '1.7rem',
          }}
        >
          {title}
        </h2>
        <p className="text-muted mb-4 small mx-auto" style={{ maxWidth: '620px' }}>
          {note}
        </p>

        {/* Bank Cards */}
        <div
          className={`d-flex ${isWeb ? 'flex-row' : 'flex-column'} justify-content-center align-items-stretch gap-3 mb-4`}
        >
          {accounts.map((acc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-3 shadow-sm flex-grow-1 text-center"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid rgba(166, 139, 101, 0.4)',
                maxWidth: isWeb ? '340px' : '100%',
              }}
            >
              <div
                className="fw-bold text-uppercase mb-2"
                style={{ color: '#A68B65', letterSpacing: '1px' }}
              >
                {acc.bank}
              </div>
              <div
                className="fw-bold font-monospace my-2"
                style={{ fontSize: '1.25rem', color: '#34342F' }}
              >
                {acc.number}
              </div>
              <p className="text-muted small mb-3">a.n. {acc.holder}</p>
              <button
                type="button"
                className="btn btn-sm px-3 rounded-pill"
                onClick={() => handleCopy(acc.number, idx)}
                style={{
                  backgroundColor: copiedIndex === idx ? '#4A7C59' : '#34342F',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.8rem',
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
              backgroundColor: '#F1EDE5',
              border: '1px dashed rgba(166, 139, 101, 0.5)',
              maxWidth: '680px',
            }}
          >
            <h6 className="fw-bold mb-1 text-dark">📦 Kirim Kado Fisik</h6>
            <p className="text-muted small mb-0">{physical_gift_address}</p>
          </div>
        )}
      </div>
    </div>
  )
}

GiftRegistrySection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
}

export default GiftRegistrySection
