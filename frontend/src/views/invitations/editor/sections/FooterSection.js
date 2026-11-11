import React from 'react'
import PropTypes from 'prop-types'
import { GununganEmblem, JavaneseDivider } from './Ornaments'
import { CornerOrnaments } from './ThemeDecorators'

const FooterSection = ({ props = {}, isWeb = true, theme = {} }) => {
  const {
    closing_quote = 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.',
    family_signatures = 'Keluarga Besar Bpk. Danu Wijaya & Bpk. Surya Pratama',
    brand_credit = 'Niskala Digital Invitation',
  } = props

  const assets = theme?.assets || {}
  const isOrnamentAnimated = theme?.animation?.ornament_motion !== false
  const gununganUrl = props.gunungan_url || props.ornament_url || assets.gunungan_url || ''
  const dividerUrl = props.divider_url || assets.divider_url || ''
  const cornerUrl = props.corner_url || assets.corner_url || ''

  return (
    <div
      className="position-relative py-5 px-3 text-center inv-section-framed"
      style={{
        backgroundColor: 'var(--inv-dark-bg, #241B15)',
        color: '#FAF6EE',
      }}
    >
      <CornerOrnaments
        cornerUrl={cornerUrl}
        isWeb={isWeb}
        variant="full"
        opacity={0.42}
        size={isWeb ? 74 : 46}
        offset={isWeb ? 12 : 8}
        animated={isOrnamentAnimated}
      />

      <div className="container position-relative" style={{ maxWidth: isWeb ? '720px' : '100%', zIndex: 2 }}>
        {(gununganUrl || theme?.isJavanese) && (
          <div className={`mb-2 ${isOrnamentAnimated ? 'inv-ornament-emblem' : ''}`}>
            {gununganUrl ? (
              <img src={gununganUrl} alt="" style={{ width: '40px', height: 'auto', opacity: 0.9 }} />
            ) : (
              <GununganEmblem width={36} height={44} color="var(--inv-accent, #C5A059)" />
            )}
          </div>
        )}

        {dividerUrl ? (
          <div className="mx-auto mb-3 inv-divider-wrap" style={{ maxWidth: isWeb ? '200px' : '150px' }}>
            <img src={dividerUrl} alt="" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        ) : (
          <div className="mb-3">
            <JavaneseDivider color="var(--inv-accent, #C5A059)" width="140px" />
          </div>
        )}

        <p
          className="fst-italic mb-3"
          style={{
            fontSize: isWeb ? '1rem' : '0.85rem',
            color: 'rgba(250, 246, 238, 0.88)',
            lineHeight: 1.7,
          }}
        >
          &quot;{closing_quote}&quot;
        </p>
        <h6
          className="font-serif fw-bold mb-4"
          style={{
            fontFamily: "var(--inv-font-heading, 'Playfair Display', Georgia, serif)",
            color: '#E7D4B5',
            fontSize: isWeb ? '1.15rem' : '1rem',
          }}
        >
          {family_signatures}
        </h6>
        <div
          className="pt-3 border-top"
          style={{ borderColor: 'rgba(231, 212, 181, 0.22)' }}
        >
          <small style={{ color: 'rgba(250, 246, 238, 0.6)', fontSize: '0.75rem' }}>
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
  theme: PropTypes.object,
}

export default FooterSection

