import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const RsvpSection = ({ props = {}, isWeb = true }) => {
  const {
    title = 'Konfirmasi Kehadiran & Doa',
    subtitle = 'Merupakan kehormatan bagi kami atas kehadiran dan doa restu Anda',
    note = 'Mohon berkenan mengisi konfirmasi sebelum tanggal 1 Desember 2026 demi kelancaran penyambutan tamu.',
    guestName = '',
  } = props

  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: guestName || '',
    attendance: 'hadir',
    pax: '1',
    message: '',
  })

  useEffect(() => {
    if (guestName && !formData.name) {
      setFormData((prev) => ({ ...prev, name: guestName }))
    }
  }, [guestName])

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormSubmitted(true)
    setTimeout(() => setFormSubmitted(false), 4000)
  }

  return (
    <div
      className="py-5 px-3 text-center"
      style={{
        backgroundColor: '#F1EDE5',
        color: '#34342F',
      }}
    >
      <div className="container" style={{ maxWidth: isWeb ? '720px' : '100%' }}>
        <p
          className="text-uppercase tracking-wider fw-semibold mb-1"
          style={{ color: '#A68B65', fontSize: '0.85rem', letterSpacing: '2px' }}
        >
          Buku Tamu Digital
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
        <p className="text-muted mb-2 small">{subtitle}</p>
        <p className="text-muted mb-4 small fst-italic">{note}</p>

        {/* RSVP Mockup Form */}
        <div
          className="p-4 rounded-3 shadow-sm text-start"
          style={{
            backgroundColor: '#FAF8F5',
            border: '1px solid rgba(166, 139, 101, 0.4)',
          }}
        >
          {formSubmitted ? (
            <div className="alert alert-success text-center py-3 mb-0" style={{ backgroundColor: '#EBF4EE', borderColor: '#4A7C59', color: '#4A7C59' }}>
              ✓ Terima kasih atas konfirmasi kehadiran dan doa restu Anda!
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label small fw-bold" style={{ color: '#34342F' }}>Nama Lengkap</label>
                <input
                  type="text"
                  className="form-control"
                  style={{ backgroundColor: '#FFFFFF', color: '#34342F', borderColor: 'rgba(166, 139, 101, 0.4)' }}
                  placeholder="Contoh: Budi Santoso"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold" style={{ color: '#34342F' }}>Konfirmasi Kehadiran</label>
                  <select
                    className="form-select"
                    style={{ backgroundColor: '#FFFFFF', color: '#34342F', borderColor: 'rgba(166, 139, 101, 0.4)' }}
                    value={formData.attendance}
                    onChange={(e) => setFormData({ ...formData, attendance: e.target.value })}
                  >
                    <option value="hadir">Ya, Saya Akan Hadir</option>
                    <option value="tidak_hadir">Maaf, Tidak Bisa Hadir</option>
                    <option value="ragu">Masih Ragu</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-bold" style={{ color: '#34342F' }}>Jumlah Tamu</label>
                  <select
                    className="form-select"
                    style={{ backgroundColor: '#FFFFFF', color: '#34342F', borderColor: 'rgba(166, 139, 101, 0.4)' }}
                    value={formData.pax}
                    onChange={(e) => setFormData({ ...formData, pax: e.target.value })}
                  >
                    <option value="1">1 Orang</option>
                    <option value="2">2 Orang</option>
                    <option value="3">3 Orang</option>
                    <option value="4">4 Orang</option>
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-bold" style={{ color: '#34342F' }}>Ucapan &amp; Doa Restu</label>
                <textarea
                  className="form-control"
                  rows="3"
                  style={{ backgroundColor: '#FFFFFF', color: '#34342F', borderColor: 'rgba(166, 139, 101, 0.4)' }}
                  placeholder="Tuliskan ucapan selamat dan doa terbaik untuk kedua mempelai..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                />
              </div>

              <div className="text-end">
                <button
                  type="submit"
                  className="btn px-4 py-2 rounded-pill shadow-sm"
                  style={{
                    backgroundColor: '#A68B65',
                    color: '#FFFFFF',
                    fontWeight: 600,
                    border: 'none',
                  }}
                >
                  Kirim Konfirmasi
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

RsvpSection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
}

export default RsvpSection

