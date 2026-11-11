import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'

const NAV_ITEMS = [
  { id: 'sec-couple', types: ['CoupleProfile'], icon: '👤', label: 'Mempelai' },
  { id: 'sec-schedule', types: ['EventSchedule'], icon: '📅', label: 'Acara' },
  {
    id: 'sec-tradition',
    types: ['TraditionAccordion', 'AccordionSection'],
    icon: '📜',
    label: 'Adat',
  },
  { id: 'sec-location', types: ['LocationMap'], icon: '📍', label: 'Lokasi' },
  { id: 'sec-gallery', types: ['PhotoGallery'], icon: '🖼', label: 'Galeri' },
  { id: 'sec-story', types: ['LoveStory'], icon: '💛', label: 'Kisah' },
  { id: 'sec-gift', types: ['GiftRegistry'], icon: '🎁', label: 'Hadiah' },
  { id: 'sec-rsvp', types: ['RsvpSection', 'RsvpForm'], icon: '✉', label: 'RSVP' },
]

const FloatingQuickNav = ({
  availableSections = [],
  activeSectionId = '',
  onSelectSection,
}) => {
  const navRef = useRef(null)
  const btnRefs = useRef({})

  const scrollTo = (id) => {
    if (onSelectSection) {
      onSelectSection(id)
      return
    }
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  useEffect(() => {
    if (!activeSectionId) return
    const navEl = navRef.current
    const btnEl = btnRefs.current[activeSectionId]
    if (navEl && btnEl && navEl.scrollWidth > navEl.clientWidth) {
      const targetLeft = btnEl.offsetLeft - navEl.clientWidth / 2 + btnEl.offsetWidth / 2
      navEl.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' })
    }
  }, [activeSectionId])

  const visibleItems = NAV_ITEMS.filter((item) =>
    availableSections.some((sec) => item.types.includes(sec.type)),
  )

  if (visibleItems.length === 0) return null

  return (
    <nav
      ref={navRef}
      className="floating-nav-pill inv-floating-nav-enter"
      aria-label="Navigasi bagian undangan"
    >
      {visibleItems.map((item) => {
        const isActive = activeSectionId === item.id
        return (
          <button
            key={item.id}
            ref={(el) => {
              btnRefs.current[item.id] = el
            }}
            type="button"
            className={`nav-pill-btn ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => scrollTo(item.id)}
          >
            <span aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

FloatingQuickNav.propTypes = {
  availableSections: PropTypes.array,
  activeSectionId: PropTypes.string,
  onSelectSection: PropTypes.func,
}

export default FloatingQuickNav
