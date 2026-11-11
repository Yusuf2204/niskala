import React from 'react'
import PropTypes from 'prop-types'
import {
  CornerOrnaments,
  JogloPortraitFrame,
  SectionHeaderOrnaments,
  ThemeBatikOverlay,
} from './ThemeDecorators'
import { getStaggerStyle } from '../../../../utils/invitationTheme'

const CoupleProfileSection = ({ props = {}, isWeb = true, theme = {} }) => {
  const {
    section_title = 'Mempelai Pria & Wanita',
    quote = 'Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan syukuran pernikahan putra-putri kami:',
    groom_name = 'Rama Wijaya, S.Kom.',
    groom_parents = 'Putra pertama dari Bpk. Danu Wijaya & Ibu Maya Kartika',
    groom_photo = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    groom_instagram = '@ramawijaya',
    bride_name = 'Shinta Dewi, S.E.',
    bride_parents = 'Putri kedua dari Bpk. Surya Pratama & Ibu Ratna Sari',
    bride_photo = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
    bride_instagram = '@shintadewi',
  } = props

  const assets = theme?.assets || {}
  const isOrnamentAnimated = theme?.animation?.ornament_motion !== false
  const dividerUrl = props.divider_url || assets.divider_url || ''
  const cornerUrl = props.corner_url || assets.corner_url || ''
  const patternUrl = props.pattern_url || assets.pattern_url || ''
  const frameUrl = props.frame_url || assets.frame_url || ''

  return (
    <div
      className="position-relative py-5 px-3 text-center inv-section-framed"
      style={{
        backgroundColor: 'var(--inv-bg, #FAF6EE)',
        color: 'var(--inv-text, #2B1E16)',
      }}
    >
      <ThemeBatikOverlay patternUrl={patternUrl} isWeb={isWeb} opacity={0.3} />
      <CornerOrnaments
        cornerUrl={cornerUrl}
        isWeb={isWeb}
        variant="top"
        opacity={0.62}
        size={isWeb ? 78 : 50}
        offset={isWeb ? 12 : 8}
        animated={isOrnamentAnimated}
      />

      <div className="container position-relative" style={{ maxWidth: isWeb ? '900px' : '100%', zIndex: 2 }}>
        <SectionHeaderOrnaments
          eyebrow="Pasangan Mempelai"
          title={section_title}
          subtitle={quote}
          dividerUrl={dividerUrl}
          isWeb={isWeb}
        />

        <div
          className={`d-flex ${isWeb ? 'flex-row' : 'flex-column'} align-items-center justify-content-center gap-4 mt-4`}
        >
          {/* Mempelai Pria */}
          <div
            className="flex-grow-1 inv-split-left"
            style={{ ...getStaggerStyle(2, 95), maxWidth: isWeb ? '360px' : '100%' }}
          >
            <JogloPortraitFrame
              photoUrl={groom_photo}
              alt={groom_name}
              frameUrl={frameUrl}
              isWeb={isWeb}
            />
            <h4
              className="fw-bold mb-1 font-serif"
              style={{
                fontFamily: "var(--inv-font-heading, 'Playfair Display', Georgia, serif)",
                color: 'var(--inv-text, #2B1E16)',
              }}
            >
              {groom_name}
            </h4>
            <p className="small mb-2" style={{ color: 'var(--inv-muted, #6A5342)' }}>
              {groom_parents}
            </p>
            {groom_instagram && (
              <span
                className="badge px-3 py-1 rounded-pill"
                style={{
                  backgroundColor: 'var(--inv-surface, #F3ECE0)',
                  color: 'var(--inv-primary, #8A6728)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.35))',
                }}
              >
                Instagram {groom_instagram}
              </span>
            )}
          </div>

          {/* Pemisah Simbol & */}
          <div
            className="my-2 my-md-0 d-flex align-items-center justify-content-center inv-split-center"
            style={{ ...getStaggerStyle(3, 95), minWidth: '60px' }}
          >
            <span
              style={{
                fontFamily: "var(--inv-font-heading, 'Playfair Display', Georgia, serif)",
                fontSize: isWeb ? '3rem' : '2.2rem',
                color: 'var(--inv-accent, #C5A059)',
                fontStyle: 'italic',
              }}
            >
              &amp;
            </span>
          </div>

          {/* Mempelai Wanita */}
          <div
            className="flex-grow-1 inv-split-right"
            style={{ ...getStaggerStyle(4, 95), maxWidth: isWeb ? '360px' : '100%' }}
          >
            <JogloPortraitFrame
              photoUrl={bride_photo}
              alt={bride_name}
              frameUrl={frameUrl}
              isWeb={isWeb}
            />
            <h4
              className="fw-bold mb-1 font-serif"
              style={{
                fontFamily: "var(--inv-font-heading, 'Playfair Display', Georgia, serif)",
                color: 'var(--inv-text, #2B1E16)',
              }}
            >
              {bride_name}
            </h4>
            <p className="small mb-2" style={{ color: 'var(--inv-muted, #6A5342)' }}>
              {bride_parents}
            </p>
            {bride_instagram && (
              <span
                className="badge px-3 py-1 rounded-pill"
                style={{
                  backgroundColor: 'var(--inv-surface, #F3ECE0)',
                  color: 'var(--inv-primary, #8A6728)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  border: '1px solid var(--inv-border, rgba(197, 160, 89, 0.35))',
                }}
              >
                Instagram {bride_instagram}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

CoupleProfileSection.propTypes = {
  props: PropTypes.object,
  isWeb: PropTypes.bool,
  theme: PropTypes.object,
}

export default CoupleProfileSection

