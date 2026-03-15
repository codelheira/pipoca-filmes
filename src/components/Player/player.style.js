import styled from 'styled-components'

export const P = {}

P.PlayerContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  background: #000;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  cursor: ${props => props.showCursor ? 'default' : 'none'};

  @media (max-width: 768px) {
    border-radius: 0;
  }
`

P.Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`

P.PlayerControls = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: ${props => props.visible ? 1 : 0};
  transform: translateY(${props => props.visible ? '0' : '10px'});
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  z-index: 20;
`

P.ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

P.ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`

P.ControlBtn = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s;
  padding: 5px;

  &:hover {
    color: #cae962;
    transform: scale(1.1);
  }
`

P.ProgressBarContainer = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  transition: height 0.2s;

  &:hover {
    height: 8px;
  }
`

P.ProgressBarFill = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #cae962;
  border-radius: 3px;
  width: ${props => props.progress}%;
  
  &::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: #fff;
    border: 2px solid #cae962;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s;
  }

  ${P.ProgressBarContainer}:hover &::after {
    opacity: 1;
  }
`

P.TimeDisplay = styled.span`
  color: #fff;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  min-width: 100px;
`

P.VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100px;
  
  &:hover input {
    width: 60px;
    opacity: 1;
  }

  @media (max-width: 576px) {
    width: auto;
    &:hover input { width: 0; display: none; }
  }
`

P.VolumeSlider = styled.input`
  -webkit-appearance: none;
  width: 0;
  opacity: 0;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.3s;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: #cae962;
    border-radius: 50%;
    cursor: pointer;
  }

  @media (max-width: 576px) {
    display: none;
  }
`

P.PlayerLogo = styled.img`
  position: absolute;
  top: 30px;
  left: 30px;
  width: 100px;
  opacity: ${props => props.isFullscreen ? 0 : 0.6};
  pointer-events: none;
  z-index: 10;
  filter: drop-shadow(0 4px 12px rgba(0,0,0,0.7));
  transition: all 0.4s ease-in-out;
  transform: translateY(${props => props.isFullscreen ? '-20px' : '0'});

  @media (max-width: 768px) {
    width: 70px;
    top: 15px;
    left: 15px;
  }
`

P.BigPlayBtn = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90px;
  height: 90px;
  background: rgba(202, 233, 98, 0.15);
  border: 2px solid #cae962;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cae962;
  font-size: 2rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  opacity: ${props => props.visible ? 1 : 0};
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  backdrop-filter: blur(5px);

  &:hover {
    transform: translate(-50%, -50%) scale(1.1);
    background: rgba(202, 233, 98, 0.3);
    box-shadow: 0 0 30px rgba(202, 233, 98, 0.4);
  }
`

P.QualityBadge = styled.div`
  background: rgba(202, 233, 98, 0.1);
  color: #cae962;
  border: 1px solid rgba(202, 233, 98, 0.4);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  user-select: none;
  display: flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  box-shadow: 0 0 10px rgba(202, 233, 98, 0.05);
  transition: all 0.3s ease;
  cursor: default;

  @media (max-width: 576px) {
    display: none;
  }
`
