import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { CSpinner } from '@coreui/react'
import api from '../../../../services/api'
import { ATTENDANCE_LABELS, formatDateTimeId } from '../../../guests/guestHelpers'
import { SectionHeaderOrnaments, ThemeBatikOverlay } from './ThemeDecorators'
import { getStaggerStyle } from '../../../../utils/invitationTheme'

const SAMPLE_PREVIEW_WISHES = [
  {
    id: 'sample-1',
    guest_name: 'Bapak Surya Pratama & Ibu',
    attendance_status: 'attending',
    pax_count: 2,
    message: 'Selamat menempuh hidup baru, semoga senantiasa diberikan keberkahan dan kebahagiaan.',
    created_at: null,
  },
  {
    id: 'sample-2',
    guest_name: 'Andi Wijaya',
    attendance_status: 'tentative',
    pax_count: 1,
    message: 'Semoga acara berjalan lancar dan penuh khidmat. Doa terbaik selalu untuk kalian.',
    created_at: null,
  },
]

const WISH_BADGE_STYLES = {
  attending: {
    backgroundColor: '#EBF4EE',
    color: '#2F5E3D',
    border: '1px solid rgba(74, 124, 89, 0.35)',
  },
  tentative: {
    backgroundColor: '#FBF5E8',
    color: '#6E5523',
    border: '1px solid rgba(166, 139, 101, 0.45)',
  },
  not_attending: {
    backgroundColor: '#F5EAE8',
    color: '#7D352B',
    border: '1px solid rgba(125, 53, 43, 0.35)',
  },
}

const RsvpSection = ({
  props = {},
  isWeb = true,
  renderMode = 'editor',
  invitationSlug = '',
  theme = {},
}) => {
  const {
    title = 'Konfirmasi Kehadiran & Doa',
    subtitle = 'Merupakan kehormatan bagi kami atas kehadiran dan doa restu Anda',
    note = 'Mohon berkenan mengisi konfirmasi sebelum tanggal acara demi kelancaran penyambutan tamu.',
    guestName = '',
    guestToken = '',
  } = props

  const assets = theme?.assets || {}
  const dividerUrl = props.divider_url || assets.divider_url || ''
  const patternUrl = props.pattern_url || assets.pattern_url || ''

  const isPublicMode = renderMode === 'public' && Boolean(invitationSlug)

  const [formData, setFormData] = useState({
    guest_name: guestName || '',
    attendance_status: 'attending',
    pax_count: '1',
    message: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState('')
  const [submitError, setSubmitError] = useState('')

  const [wishes, setWishes] = useState([])
  const [wishesLoading, setWishesLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [wishesPage, setWishesPage] = useState(1)
  const [wishesLastPage, setWishesLastPage] = useState(1)

  useEffect(() => {
    if (guestName) {
      setFormData((prev) => (prev.guest_name ? prev : { ...prev, guest_name: guestName }))
    }
  }, [guestName])

  const loadWishes = useCallback(
    async (page = 1, append = false) => {
      if (!isPublicMode) return
      if (append) {
        setLoadingMore(true)
      } else {
        setWishesLoading(true)
      }

      try {
        const res = await api.get(`/v1/public/invitations/${invitationSlug}/wishes`, {
          params: { page, per_page: 10 },
        })
        const paginator = res.data?.data
        const list = paginator?.data || []
        setWishes((prev) => (append ? [...prev, ...list] : list))
        setWishesPage(paginator?.current_page || 1)
        setWishesLastPage(paginator?.last_page || 1)
      } catch {
        if (!append) setWishes([])
      } finally {
        setWishesLoading(false)
        setLoadingMore(false)
      }
    },
    [isPublicMode, invitationSlug],
  )

  useEffect(() => {
    loadWishes(1, false)
  }, [loadWishes])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSubmitSuccess('')

    if (!isPublicMode) {
      setSubmitSuccess(
        'Simulasi berhasil (Mode Editor/Preview). Pengiriman data nyata aktif pada tautan undangan publik.',
      )
      setTimeout(() => setSubmitSuccess(''), 4000)
      return
    }

    setSubmitting(true)
    try {
      const res = await api.post(`/v1/public/invitations/${invitationSlug}/rsvps`, {
        guest_name: formData.guest_name,
        attendance_status: formData.attendance_status,
        pax_count:
          formData.attendance_status === 'not_attending'
            ? 0
            : parseInt(formData.pax_count, 10) || 1,
        message: formData.message,
        guest_token: guestToken || undefined,
      })

      const createdWish = res.data?.data
      if (createdWish) {
        setWishes((prev) => [createdWish, ...prev])
      } else {
        loadWishes(1, false)
      }

      setFormData((prev) => ({ ...prev, message: '' }))
      setSubmitSuccess(
        res.data?.message || 'Terima kasih atas konfirmasi kehadiran dan doa restu Anda!',
      )
    } catch (err) {
      if (err.response?.status === 429) {
        setSubmitError(
          'Anda mengirim konfirmasi terlalu cepat. Mohon tunggu sekitar satu menit sebelum mencoba lagi.',
        )
      } else {
        const errors = err.response?.data?.errors
        const firstErr = errors ? Object.values(errors).flat()[0] : null
        setSubmitError(firstErr || err.response?.data?.message || 'Gagal mengirim konfirmasi.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const displayedWishes = isPublicMode ? wishes : SAMPLE_PREVIEW_WISHES

  return (
    <div
      className="position-relative py-5 px-3 text-center inv-section-framed"
      style={{
        backgroundColor: 'var(--inv-bg, #FAF6EE)',
        color: 'var(--inv-text, #2B1E16)',
      }}
    >
      <ThemeBatikOverlay patternUrl={patternUrl} isWeb={isWeb} opacity={0.26} />

      <div className="container position-relative" style={{ maxWidth: isWeb ? '720px' : '100%', zIndex: 2 }}>
        <SectionHeaderOrnaments
          eyebrow="Buku Tamu Digital"
          title={title}
          subtitle={subtitle}
          dividerUrl={dividerUrl}
          isWeb={isWeb}
        />
        <p
          className="mb-4 small fst-italic inv-stagger-item"
          style={{ ...getStaggerStyle(2, 95), color: 'var(--inv-muted, #6A5342)' }}
        >
          {note}
        </p>

        {/* RSVP Form Card */}
        <div
          className="p-4 rounded-3 shadow-sm text-start inv-card-framed inv-stagger-item"
          style={{
            ...getStaggerStyle(3, 95),
            backgroundColor: 'var(--inv-card, #FFFDF9)',
            border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.4))',
          }}
        >
          {!isPublicMode && (
            <div
              className="rounded-2 px-3 py-2 mb-3 small"
              style={{
                backgroundColor: 'rgba(197, 160, 89, 0.14)',
                color: 'var(--inv-text, #2B1E16)',
                border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.35))',
              }}
            >
              Mode Editor/Preview: Pengiriman formulir nyata ke database aktif saat undangan sudah
              berstatus <strong>Published</strong>.
            </div>
          )}

          {submitSuccess && (
            <div
              className="alert text-center py-3 mb-3"
              style={{
                backgroundColor: '#EBF4EE',
                borderColor: '#4A7C59',
                color: '#2F5E3D',
              }}
            >
              ✓ {submitSuccess}
            </div>
          )}

          {submitError && (
            <div
              className="alert text-center py-2 mb-3 small"
              style={{
                backgroundColor: '#F5EAE8',
                borderColor: '#B55347',
                color: '#7D352B',
              }}
            >
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label small fw-bold" style={{ color: 'var(--inv-text, #2B1E16)' }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                className="form-control"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: 'var(--inv-text, #2B1E16)',
                  borderColor: 'var(--inv-border, rgba(197, 160, 89, 0.42))',
                }}
                placeholder="Contoh: Budi Santoso"
                value={formData.guest_name}
                onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                maxLength={150}
                required
              />
            </div>

            <div className="row g-2 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold" style={{ color: 'var(--inv-text, #2B1E16)' }}>
                  Konfirmasi Kehadiran
                </label>
                <select
                  className="form-select"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: 'var(--inv-text, #2B1E16)',
                    borderColor: 'var(--inv-border, rgba(197, 160, 89, 0.42))',
                  }}
                  value={formData.attendance_status}
                  onChange={(e) => setFormData({ ...formData, attendance_status: e.target.value })}
                >
                  <option value="attending">Ya, Saya Akan Hadir</option>
                  <option value="not_attending">Maaf, Tidak Bisa Hadir</option>
                  <option value="tentative">Masih Ragu</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label small fw-bold" style={{ color: 'var(--inv-text, #2B1E16)' }}>
                  Jumlah Tamu
                </label>
                <select
                  className="form-select"
                  style={{
                    backgroundColor: '#FFFFFF',
                    color: 'var(--inv-text, #2B1E16)',
                    borderColor: 'var(--inv-border, rgba(197, 160, 89, 0.42))',
                  }}
                  value={formData.attendance_status === 'not_attending' ? '0' : formData.pax_count}
                  onChange={(e) => setFormData({ ...formData, pax_count: e.target.value })}
                  disabled={formData.attendance_status === 'not_attending'}
                >
                  {formData.attendance_status === 'not_attending' ? (
                    <option value="0">0 Orang (Berhalangan)</option>
                  ) : (
                    <>
                      <option value="1">1 Orang</option>
                      <option value="2">2 Orang</option>
                      <option value="3">3 Orang</option>
                      <option value="4">4 Orang</option>
                      <option value="5">5 Orang</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label small fw-bold" style={{ color: 'var(--inv-text, #2B1E16)' }}>
                Ucapan &amp; Doa Restu
              </label>
              <textarea
                className="form-control"
                rows="3"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: 'var(--inv-text, #2B1E16)',
                  borderColor: 'var(--inv-border, rgba(197, 160, 89, 0.42))',
                }}
                placeholder="Tuliskan ucapan selamat dan doa terbaik untuk kedua mempelai..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                maxLength={1000}
              />
            </div>

            <div className="text-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-niskala-gold px-4 py-2 rounded-pill shadow-sm"
              >
                {submitting ? 'Mengirim...' : 'Kirim Konfirmasi'}
              </button>
            </div>
          </form>
        </div>

        {/* Wishes Feed */}
        <div
          className="mt-4 p-4 rounded-3 shadow-sm text-start inv-card-framed inv-stagger-item"
          style={{
            ...getStaggerStyle(4, 95),
            backgroundColor: 'var(--inv-card, #FFFDF9)',
            border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.35))',
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5
              className="mb-0 fw-bold"
              style={{
                fontFamily: "var(--inv-font-heading, 'Playfair Display', Georgia, serif)",
                color: 'var(--inv-text, #2B1E16)',
              }}
            >
              Untaian Doa &amp; Ucapan
            </h5>
            <span className="small" style={{ color: 'var(--inv-muted, #6A5342)' }}>
              {displayedWishes.length} ditampilkan
            </span>
          </div>

          {wishesLoading ? (
            <div className="text-center py-4">
              <CSpinner size="sm" style={{ color: 'var(--inv-primary, #8A6728)' }} />
              <p className="small mt-2 mb-0" style={{ color: 'var(--inv-muted, #6A5342)' }}>
                Memuat ucapan tamu...
              </p>
            </div>
          ) : displayedWishes.length === 0 ? (
            <p className="small text-center py-3 mb-0" style={{ color: 'var(--inv-muted, #6A5342)' }}>
              Belum ada ucapan doa restu. Jadilah yang pertama mengirimkan doa untuk kedua mempelai!
            </p>
          ) : (
            <div className="d-flex flex-column gap-3">
              {displayedWishes.map((wish) => {
                const badgeStyle =
                  WISH_BADGE_STYLES[wish.attendance_status] || WISH_BADGE_STYLES.attending
                return (
                  <div
                    key={wish.id}
                    className="p-3 rounded-2"
                    style={{
                      backgroundColor: 'var(--inv-surface, #F3ECE0)',
                      border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.25))',
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap mb-1">
                      <strong style={{ color: 'var(--inv-text, #2B1E16)', fontSize: '0.95rem' }}>
                        {wish.guest_name}
                      </strong>
                      <span
                        className="badge rounded-pill px-2 py-1"
                        style={{ ...badgeStyle, fontSize: '0.72rem', fontWeight: 600 }}
                      >
                        {ATTENDANCE_LABELS[wish.attendance_status] || wish.attendance_status}
                      </span>
                    </div>
                    {wish.message && (
                      <p
                        className="mb-1 small"
                        style={{
                          color: 'var(--inv-text, #2B1E16)',
                          opacity: 0.88,
                          whiteSpace: 'pre-line',
                          lineHeight: 1.5,
                        }}
                      >
                        {wish.message}
                      </p>
                    )}
                    {wish.created_at && (
                      <small style={{ color: 'var(--inv-muted, #6A5342)', fontSize: '0.72rem' }}>
                        {formatDateTimeId(wish.created_at)}
                      </small>
                    )}
                  </div>
                )
              })}

              {isPublicMode && wishesPage < wishesLastPage && (
                <div className="text-center pt-1">
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => loadWishes(wishesPage + 1, true)}
                    className="btn btn-sm rounded-pill px-4"
                    style={{
                      backgroundColor: 'var(--inv-surface, #F3ECE0)',
                      color: 'var(--inv-text, #2B1E16)',
                      border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.45))',
                      fontWeight: 600,
                    }}
                  >
                    {loadingMore ? 'Memuat...' : 'Muat Lebih Banyak Ucapan'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

RsvpSection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
  renderMode: PropTypes.oneOf(['editor', 'preview', 'public']),
  invitationSlug: PropTypes.string,
  theme: PropTypes.object,
}

export default RsvpSection
