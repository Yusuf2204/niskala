import React from 'react'
import PropTypes from 'prop-types'

const FloatingMusicPlayer = ({ isPlaying, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`floating-music-btn ${isPlaying ? 'spinning' : 'paused'}`}
      title={isPlaying ? 'Jeda Musik' : 'Putar Musik'}
      aria-label="Kontrol Musik Latar"
    >
      <div
        className="rounded-circle d-flex align-items-center justify-content-center"
        style={{
          width: '20px',
          height: '20px',
          backgroundColor: '#A68B65',
          color: '#34342F',
          fontSize: '0.65rem',
          fontWeight: 'bold',
        }}
      >
        {isPlaying ? '♫' : '❚❚'}
      </div>
    </button>
  )
}

FloatingMusicPlayer.propTypes = {
  isPlaying: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
}

export default FloatingMusicPlayer

