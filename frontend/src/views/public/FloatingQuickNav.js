import React from 'react'
import PropTypes from 'prop-types'

const FloatingQuickNav = ({ availableSections = [] }) => {
  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Check which sections exist in this invitation
  const hasType = (type) => availableSections.some((s) => s.type === type)

  return (
    <div className="floating-nav-pill">
      {hasType('CoupleProfile') && (
        <button
          type="button"
          className="nav-pill-btn"
          onClick={() => scrollTo('sec-couple')}
        >
          <span>👤</span> Mempelai
        </button>
      )}

      {hasType('EventSchedule') && (
        <button
          type="button"
          className="nav-pill-btn"
          onClick={() => scrollTo('sec-schedule')}
        >
          <span>📅</span> Acara
        </button>
      )}

      {hasType('LocationMap') && (
        <button
          type="button"
          className="nav-pill-btn"
          onClick={() => scrollTo('sec-location')}
        >
          <span>📍</span> Lokasi
        </button>
      )}

      {hasType('PhotoGallery') && (
        <button
          type="button"
          className="nav-pill-btn"
          onClick={() => scrollTo('sec-gallery')}
        >
          <span>🖼</span> Galeri
        </button>
      )}

      {(hasType('RsvpSection') || hasType('RsvpForm')) && (
        <button
          type="button"
          className="nav-pill-btn"
          onClick={() => scrollTo('sec-rsvp')}
        >
          <span>✉</span> RSVP
        </button>
      )}
    </div>
  )
}

FloatingQuickNav.propTypes = {
  availableSections: PropTypes.array,
}

export default FloatingQuickNav
