import React from 'react'
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

const FloatingQuickNav = ({ availableSections = [] }) => {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const visibleItems = NAV_ITEMS.filter((item) =>
    availableSections.some((sec) => item.types.includes(sec.type)),
  )

  if (visibleItems.length === 0) return null

  return (
    <nav className="floating-nav-pill" aria-label="Navigasi bagian undangan">
      {visibleItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className="nav-pill-btn"
          onClick={() => scrollTo(item.id)}
        >
          <span aria-hidden="true">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

FloatingQuickNav.propTypes = {
  availableSections: PropTypes.array,
}

export default FloatingQuickNav
