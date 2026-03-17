import React from 'react'
import styled from 'styled-components'

const PlayerWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: 12px;
  overflow: hidden;
  background: #000;
`

const LogoOverlay = styled.img`
  position: absolute;
  top: 20px;
  left: 20px;
  width: 120px;
  z-index: 10;
  pointer-events: none;
  opacity: 0.8;
`

export default function CustomPlayer({ source, poster }) {
  return (
    <PlayerWrapper>
      <LogoOverlay src="/logo.png" alt="Pipoca Filmes" />
      <video
        src={source}
        poster={poster}
        controls
        disablePictureInPicture
        playsInline
        webkit-playsinline="true"
        style={{ width: '100%', height: '100%' }}
      />
    </PlayerWrapper>
  )
}
