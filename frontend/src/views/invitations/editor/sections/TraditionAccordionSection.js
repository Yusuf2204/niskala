import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { GununganEmblem } from './Ornaments'
import { CornerOrnaments, SectionHeaderOrnaments, ThemeBatikOverlay } from './ThemeDecorators'

const DEFAULT_ITEMS = [
  {
    id: 'item-1',
    title: 'Upacara Siraman',
    time_info: 'Jumat, 11 Desember 2026 — 09:00 WIB',
    location: 'Kediaman Mempelai Putri',
    description:
      'Ritual penyucian diri lahir dan batin calon pengantin menggunakan air dari tujuh sumber dengan taburan kembang setaman sebelum memasuki kehidupan berumah tangga.',
  },
  {
    id: 'item-2',
    title: 'Malam Midodareni',
    time_info: 'Jumat, 11 Desember 2026 — 19:00 WIB',
    location: 'Kediaman Mempelai Putri',
    description:
      'Malam tirakatan dan doa restu keluarga besar di kediaman mempelai putri sebagai simbol turunnya keberkahan menjelang hari akad nikah.',
  },
  {
    id: 'item-3',
    title: 'Ijab Kabul / Akad Nikah',
    time_info: 'Sabtu, 12 Desember 2026 — 08:00 WIB',
    location: 'Pendopo Ageng Handrawina',
    description:
      'Prosesi pengucapan ikrar suci pernikahan di hadapan penghulu, wali, saksi, dan keluarga besar sebagai puncak sakral ikatan pernikahan.',
  },
  {
    id: 'item-4',
    title: 'Upacara Panggih Penganten',
    time_info: 'Sabtu, 12 Desember 2026 — 10:00 WIB',
    location: 'Sasana Hinggil Handrawina',
    description:
      'Pertemuan adat kedua mempelai setelah akad nikah melalui rangkaian prosesi Balangan Gantal, Wijik Suku, Sinduran, Kacar Kucur, Dahar Klimah, dan Sungkeman.',
  },
  {
    id: 'item-5',
    title: 'Resepsi / Pahargyan Temu Manten',
    time_info: 'Sabtu, 12 Desember 2026 — 11:30 - 14:00 WIB',
    location: 'Grand Ballroom Handrawina',
    description:
      'Perjamuan syukuran bersama seluruh tamu undangan dan kerabat yang diiringi alunan gending serta nuansa keanggunan keraton.',
  },
]

const TraditionAccordionSection = ({ props = {}, isWeb = true, theme = {} }) => {
  const {
    title = 'Tata Upacara & Prosesi Adat Jawa',
    subtitle = 'Rangkaian Ritual Suci Sakral Pengantin Jawa',
    ornament = 'gunungan',
    items = DEFAULT_ITEMS,
  } = props

  const [expandedId, setExpandedId] = useState(items[0]?.id || 'item-1')

  const toggleItem = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const assets = theme?.assets || {}
  const isOrnamentAnimated = theme?.animation?.ornament_motion !== false
  const gununganUrl = props.gunungan_url || props.ornament_url || assets.gunungan_url || ''
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
      className="position-relative text-center inv-section-framed"
      style={{
        backgroundColor: 'var(--inv-surface, #F3ECE0)',
        color: 'var(--inv-text, #2B1E16)',
        padding: isWeb ? '4.25rem 2rem' : '3rem 1.25rem',
        borderRadius: isWeb ? '12px' : '0',
        borderTop: '1px solid var(--inv-border, rgba(197, 160, 89, 0.28))',
        borderBottom: '1px solid var(--inv-border, rgba(197, 160, 89, 0.28))',
      }}
    >
      <ThemeBatikOverlay patternUrl={patternUrl} isWeb={isWeb} opacity={0.34} />
      <CornerOrnaments
        cornerUrl={cornerUrl}
        isWeb={isWeb}
        variant="full"
        opacity={0.6}
        size={isWeb ? 82 : 52}
        offset={isWeb ? 12 : 8}
        animated={isOrnamentAnimated}
      />

      <div className="position-relative" style={{ zIndex: 2 }}>
        {(ornament === 'gunungan' || gununganUrl) && (
          <div className={isOrnamentAnimated ? 'mb-2 inv-ornament-emblem' : 'mb-2'}>
            {gununganUrl ? (
              <img
                src={gununganUrl}
                alt="Gunungan Wayang"
                style={{ width: isWeb ? '56px' : '44px', height: 'auto' }}
              />
            ) : (
              <GununganEmblem width={48} height={58} color="var(--inv-accent, #C5A059)" />
            )}
          </div>
        )}

        <SectionHeaderOrnaments
          eyebrow={subtitle}
          title={title}
          dividerUrl={dividerUrl}
          isWeb={isWeb}
        />

        {/* Accordion List */}
        <div
          className="mx-auto text-start mt-4"
          style={{
            maxWidth: isWeb ? '720px' : '100%',
          }}
        >
          <div className="d-flex flex-column gap-3">
            {(items || []).map((item, index) => {
              const isExpanded = expandedId === item.id

              return (
                <div
                  key={item.id || index}
                  className="rounded-3 shadow-sm transition-all overflow-hidden inv-card-framed"
                  style={{
                    backgroundColor: 'var(--inv-card, #FFFDF9)',
                    border: isExpanded
                      ? '1.5px solid var(--inv-accent, #C5A059)'
                      : '1px solid var(--inv-border, rgba(197, 160, 89, 0.3))',
                    boxShadow: isExpanded
                      ? '0 8px 22px rgba(138, 103, 40, 0.16)'
                      : '0 2px 8px rgba(74, 53, 37, 0.05)',
                  }}
                >
                  {/* Accordion Header / Trigger Button */}
                  <button
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className="w-100 p-3 d-flex align-items-center justify-content-between border-0 bg-transparent text-start cursor-pointer"
                    style={{ outline: 'none' }}
                  >
                    <div className="d-flex align-items-center gap-3">
                      {item.icon_url ? (
                        <img
                          src={item.icon_url}
                          alt=""
                          className="flex-shrink-0"
                          style={{ width: '34px', height: '34px' }}
                        />
                      ) : (
                        <div
                          className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-bold"
                          style={{
                            width: '34px',
                            height: '34px',
                            fontSize: '0.85rem',
                            backgroundColor: isExpanded
                              ? 'var(--inv-accent, #C5A059)'
                              : 'rgba(197, 160, 89, 0.16)',
                            color: isExpanded ? '#241B15' : 'var(--inv-text, #2B1E16)',
                            border: '1px solid var(--inv-accent, #C5A059)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {index + 1}
                        </div>
                      )}
                      <div>
                        <h6
                          className="mb-0 fw-bold font-serif"
                          style={{
                            fontFamily: "var(--inv-font-heading, 'Playfair Display', Georgia, serif)",
                            fontSize: isWeb ? '1.1rem' : '0.98rem',
                            color: 'var(--inv-text, #2B1E16)',
                          }}
                        >
                          {item.title}
                        </h6>
                        {item.time_info && (
                          <small
                            className="d-block mt-0"
                            style={{
                              color: 'var(--inv-primary, #8A6728)',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                            }}
                          >
                            {item.time_info}
                          </small>
                        )}
                      </div>
                    </div>

                    {/* Expand / Collapse Indicator */}
                    <div
                      className="flex-shrink-0 ms-2"
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(197, 160, 89, 0.16)',
                        color: 'var(--inv-primary, #8A6728)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.25s ease',
                      }}
                    >
                      ▾
                    </div>
                  </button>

                  {/* Accordion Body Content */}
                  {isExpanded && (
                    <div
                      className="px-3 pb-3 pt-2 border-top"
                      style={{
                        borderColor: 'var(--inv-border, rgba(197, 160, 89, 0.22))',
                        backgroundColor: 'var(--inv-surface, #F3ECE0)',
                      }}
                    >
                      {item.location && (
                        <div className="mb-2 small" style={{ color: 'var(--inv-text, #2B1E16)', opacity: 0.88 }}>
                          📍 <strong>Lokasi:</strong> {item.location}
                        </div>
                      )}
                      <p
                        className="mb-0 small"
                        style={{
                          lineHeight: 1.65,
                          color: 'var(--inv-text, #2B1E16)',
                          opacity: 0.92,
                          fontSize: isWeb ? '0.9rem' : '0.85rem',
                        }}
                      >
                        {item.description}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

TraditionAccordionSection.propTypes = {
  props: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    ornament: PropTypes.string,
    ornament_url: PropTypes.string,
    gunungan_url: PropTypes.string,
    divider_url: PropTypes.string,
    corner_url: PropTypes.string,
    pattern_url: PropTypes.string,
    pattern_secondary_url: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        time_info: PropTypes.string,
        location: PropTypes.string,
        description: PropTypes.string,
        icon_url: PropTypes.string,
      })
    ),
  }),
  isWeb: PropTypes.bool,
  theme: PropTypes.object,
}

export default TraditionAccordionSection

