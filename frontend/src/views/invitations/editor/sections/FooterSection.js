import React from 'react'
import PropTypes from 'prop-types'

const FooterSection = ({ props = {}, isWeb = true }) => {
  const {
    closing_quote = 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.',
    family_signatures = 'Keluarga Besar Bpk. Danu Wijaya & Bpk. Surya Pratama',
    brand_credit = 'Niskala Digital Invitation',
  } = props

  return (
    <div
      className="py-5 px-3 text-center"
      style={{
        backgroundColor: '#34342F',
        color: '#F1EDE5',
      }}
    >
      <div className="container" style={{ maxWidth: isWeb ? '720px' : '100%' }}>
        <div
          className="mx-auto mb-3"
          style={{ width: '60px', height: '2px', backgroundColor: '#A68B65' }}
        />
        <p
          className="fst-italic mb-3"
          style={{
            fontSize: isWeb ? '1rem' : '0.85rem',
            color: 'rgba(241, 237, 229, 0.85)',
          }}
        >
          &quot;{closing_quote}&quot;
        </p>
        <h6
          className="font-serif fw-bold mb-4"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            color: '#D8C2A0',
            fontSize: isWeb ? '1.15rem' : '1rem',
          }}
        >
          {family_signatures}
        </h6>
        <div
          className="pt-3 border-top"
          style={{ borderColor: 'rgba(216, 194, 160, 0.2)' }}
        >
          <small style={{ color: 'rgba(241, 237, 229, 0.5)', fontSize: '0.75rem' }}>
            {brand_credit}
          </small>
        </div>
      </div>
    </div>
  )
}

FooterSection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
}

export default FooterSection

