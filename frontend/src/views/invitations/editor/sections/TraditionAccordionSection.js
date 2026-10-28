import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { GununganEmblem, JavaneseDivider } from './Ornaments'

const DEFAULT_ITEMS = [
  {
    id: 'item-1',
    title: 'Upacara Siraman',
    time_info: 'Jumat Pon, 11 Desember 2026 — 09:00 WIB',
    location: 'Kediaman Mempelai Putri',
    description:
      'Upacara sesuci raga dalah jiwa calon penganten kanthi toya pitu sumber kembang setaman, pinangka lambang reresik lair lan batin sadurunge ngambah gesang anyar.',
  },
  {
    id: 'item-2',
    title: 'Malam Midodareni',
    time_info: 'Jumat Pon, 11 Desember 2026 — 19:00 WIB',
    location: 'Kediaman Mempelai Putri',
    description:
      'Wanci wengi ing ngendi para widadari mudhun maringi berkah kaendahan, kasekten, lan karaharjan dhumateng calon penganten putri.',
  },
  {
    id: 'item-3',
    title: 'Ijab Kabul / Akad Nikah',
    time_info: 'Sabtu Pahing, 12 Desember 2026 — 08:00 WIB',
    location: 'Pendopo Ageng Handrawina',
    description:
      'Ikrar suci prajanjen nikah ing ngarsanipun Gusti Allah SWT, saksi, para sepuh, lan wali.',
  },
  {
    id: 'item-4',
    title: 'Upacara Panggih Penganten',
    time_info: 'Sabtu Pahing, 12 Desember 2026 — 10:00 WIB',
    location: 'Sasana Hinggil Handrawina',
    description:
      'Temuning sri penganten kakung lan putri lumantar prosesi adat Balangan Gantal, Wijik Suku/Ngidak Endhog, Sinduran, Kacar Kucur, Dahar Klimah, lan Sungkeman.',
  },
  {
    id: 'item-5',
    title: 'Pahargyan Temu Manten (Resepsi)',
    time_info: 'Sabtu Pahing, 12 Desember 2026 — 11:30 - 14:00 WIB',
    location: 'Grand Ballroom Handrawina',
    description:
      'Syukuran agung bebarengan para tamu rawuh kinurmatan dalah sedherek kanthi suwasana pinarak gamelan lan beksan Jawa.',
  },
]

const TraditionAccordionSection = ({ props = {}, isWeb = true }) => {
  const {
    title = 'Tata Upacara & Prosesi Adat Jawa',
    subtitle = 'Rangkaian Ritual Suci Sakral Penganten Jawa',
    ornament = 'gunungan',
    items = DEFAULT_ITEMS,
  } = props

  // By default, the first item is expanded
  const [expandedId, setExpandedId] = useState(items[0]?.id || 'item-1')

  const toggleItem = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const primaryGold = '#C5A059'
  const deepSogan = '#4A3525'
  const softBg = '#FAF6EE'
  const cardBg = '#FFFDF9'

  return (
    <div
      className="position-relative text-center"
      style={{
        backgroundColor: softBg,
        color: deepSogan,
        padding: isWeb ? '4rem 2rem' : '3rem 1.25rem',
        borderRadius: isWeb ? '12px' : '0',
        borderTop: '1px solid rgba(197, 160, 89, 0.25)',
        borderBottom: '1px solid rgba(197, 160, 89, 0.25)',
      }}
    >
      {/* Header Ornamen */}
      <div className="mb-2">
        {ornament === 'gunungan' && (
          <div className="mb-2">
            <GununganEmblem width={48} height={58} color={primaryGold} />
          </div>
        )}
        <h2
          className="font-serif fw-bold mb-1"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: isWeb ? '2.1rem' : '1.6rem',
            color: deepSogan,
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className="small text-uppercase tracking-wider mb-2"
            style={{
              color: primaryGold,
              letterSpacing: '2px',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}
          >
            {subtitle}
          </p>
        )}
        <JavaneseDivider color={primaryGold} width={isWeb ? '220px' : '160px'} />
      </div>

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
                className="rounded-3 shadow-sm transition-all overflow-hidden"
                style={{
                  backgroundColor: cardBg,
                  border: isExpanded
                    ? `1.5px solid ${primaryGold}`
                    : '1px solid rgba(197, 160, 89, 0.28)',
                  boxShadow: isExpanded
                    ? '0 6px 20px rgba(197, 160, 89, 0.15)'
                    : '0 2px 6px rgba(0, 0, 0, 0.04)',
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
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0 fw-bold"
                      style={{
                        width: '32px',
                        height: '32px',
                        fontSize: '0.85rem',
                        backgroundColor: isExpanded ? primaryGold : 'rgba(197, 160, 89, 0.15)',
                        color: isExpanded ? '#FFFFFF' : deepSogan,
                        border: `1px solid ${primaryGold}`,
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h6
                        className="mb-0 fw-bold font-serif"
                        style={{
                          fontFamily: "'Playfair Display', Georgia, serif",
                          fontSize: isWeb ? '1.1rem' : '0.98rem',
                          color: deepSogan,
                        }}
                      >
                        {item.title}
                      </h6>
                      {item.time_info && (
                        <small
                          className="d-block mt-0"
                          style={{
                            color: primaryGold,
                            fontSize: '0.75rem',
                            fontWeight: 600,
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
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(197, 160, 89, 0.12)',
                      color: primaryGold,
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
                    className="px-3 pb-3 pt-1 border-top"
                    style={{
                      borderColor: 'rgba(197, 160, 89, 0.18)',
                      backgroundColor: 'rgba(250, 246, 238, 0.5)',
                    }}
                  >
                    {item.location && (
                      <div className="mb-2 small" style={{ color: deepSogan, opacity: 0.85 }}>
                        📍 <strong>Papan / Lokasi:</strong> {item.location}
                      </div>
                    )}
                    <p
                      className="mb-0 small"
                      style={{
                        lineHeight: 1.65,
                        color: deepSogan,
                        opacity: 0.9,
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
  )
}

TraditionAccordionSection.propTypes = {
  props: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    ornament: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        time_info: PropTypes.string,
        location: PropTypes.string,
        description: PropTypes.string,
      })
    ),
  }),
  isWeb: PropTypes.bool,
}

export default TraditionAccordionSection
