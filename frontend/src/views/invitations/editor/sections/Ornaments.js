import React from 'react'
import PropTypes from 'prop-types'

/**
 * Gunungan Wayang (Kayon) Vector Emblem
 * Traditional Javanese symbol of universe, sacred harmony, and auspicious beginnings.
 */
export const GununganEmblem = ({
  width = 44,
  height = 54,
  color = '#C5A059',
  className = '',
  style = {},
}) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
    >
      {/* Outer Crown Point */}
      <path
        d="M50 4 C50 4 78 40 82 72 C85 96 74 114 50 116 C26 114 15 96 18 72 C22 40 50 4 50 4Z"
        stroke={color}
        strokeWidth="2.5"
        fill="none"
      />
      {/* Inner Sacred Tree Contour */}
      <path
        d="M50 14 C50 14 72 45 75 72 C77 92 68 108 50 110 C32 108 23 92 25 72 C28 45 50 14 50 14Z"
        stroke={color}
        strokeWidth="1.2"
        strokeDasharray="2 2"
        fill="none"
      />
      {/* Central Spire (Mustaka / Meru) */}
      <line x1="50" y1="8" x2="50" y2="112" stroke={color} strokeWidth="1.8" />
      {/* Sacred Gateway / Gapura Base */}
      <path
        d="M40 114 L40 92 L60 92 L60 114"
        stroke={color}
        strokeWidth="1.8"
        fill="none"
      />
      <path
        d="M36 92 L64 92"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Traditional Foliage Branches / Ukiran Sayap */}
      <path
        d="M50 36 C62 30 70 42 66 50 C60 52 54 44 50 48"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M50 36 C38 30 30 42 34 50 C40 52 46 44 50 48"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M50 56 C65 50 74 64 70 74 C62 76 56 66 50 70"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M50 56 C35 50 26 64 30 74 C38 76 44 66 50 70"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M50 76 C65 72 74 86 68 94"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
      <path
        d="M50 76 C35 72 26 86 32 94"
        stroke={color}
        strokeWidth="1.2"
        fill="none"
      />
      {/* Top Auspicious Diamond */}
      <polygon points="50,2 53,6 50,10 47,6" fill={color} />
    </svg>
  )
}

GununganEmblem.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  color: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
}

/**
 * Traditional Javanese Horizontal Divider with Center Ornament
 */
export const JavaneseDivider = ({
  color = '#C5A059',
  width = '180px',
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`d-flex align-items-center justify-content-center gap-2 my-3 ${className}`}
      style={{ width, margin: '0 auto', ...style }}
    >
      <div
        style={{
          flex: 1,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${color})`,
        }}
      />
      <span style={{ color, fontSize: '0.85rem', lineHeight: 1 }}>◈</span>
      <span style={{ color, fontSize: '1.05rem', lineHeight: 1 }}>✦</span>
      <span style={{ color, fontSize: '0.85rem', lineHeight: 1 }}>◈</span>
      <div
        style={{
          flex: 1,
          height: '1px',
          background: `linear-gradient(90deg, ${color}, transparent)`,
        }}
      />
    </div>
  )
}

JavaneseDivider.propTypes = {
  color: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  className: PropTypes.string,
  style: PropTypes.object,
}
