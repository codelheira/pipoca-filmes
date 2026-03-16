import styled, { keyframes, css } from 'styled-components'

export const P = {}

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
  100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
`;

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
  background: linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.4) 50%, transparent);
  padding: 20px;
  padding-bottom: 25px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  transition: opacity 0.3s ease, transform 0.3s ease;
  opacity: ${props => props.visible ? 1 : 0};
  transform: translateY(${props => props.visible ? '0' : '10px'});
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  z-index: 30;
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
  background: ${props => props.active ? 'rgba(202, 233, 98, 0.2)' : 'none'};
  border: none;
  color: ${props => props.active ? '#cae962' : '#fff'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s;
  padding: 8px;
  border-radius: 8px;

  &:hover {
    color: #cae962;
    background: rgba(255, 255, 255, 0.1);
    transform: scale(1.1);
  }

  ${props => props.isSpeaking && css`
    animation: ${pulse} 1.5s infinite;
    color: #cae962;
    background: rgba(202, 233, 98, 0.1);
  `}

  svg {
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
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

  ${props => props.isScrubbing && `
    &::after {
      opacity: 1;
      transform: translateY(-50%) scale(1.2);
    }
  `}
`

P.SeekHoverIndicator = styled.div`
  position: absolute;
  bottom: 25px;
  left: ${props => props.left}px;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  color: #cae962;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  pointer-events: none;
  border: 1px solid rgba(202, 233, 98, 0.4);
  backdrop-filter: blur(4px);
  z-index: 40;
  white-space: nowrap;

  &::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 5px solid rgba(0, 0, 0, 0.85);
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
  z-index: 15;

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

P.BufferContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: ${props => props.visible ? 1 : 0};
  pointer-events: none;
  z-index: 25;
  transition: opacity 0.3s ease;
`

P.Spinner = styled.div`
  width: 60px;
  height: 60px;
  border: 4px solid rgba(202, 233, 98, 0.15);
  border-top: 4px solid #cae962;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 12px;
  box-shadow: 0 0 15px rgba(202, 233, 98, 0.3);

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

P.BufferText = styled.div`
  background: rgba(0, 0, 0, 0.6);
  color: #cae962;
  padding: 6px 14px;
  border-radius: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(202, 233, 98, 0.3);
`

P.SkipAnimOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: ${props => props.type === 'backward' ? '25%' : '75%'};
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #rgba(255, 255, 255, 0.8);
  font-size: 3rem;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 50%;
  width: 100px;
  height: 100px;
  pointer-events: none;
  z-index: 15;
  animation: fadeOutSkip 0.6s ease-out forwards;
  
  span {
    font-size: 1rem;
    font-weight: bold;
    margin-top: -5px;
  }

  @keyframes fadeOutSkip {
    0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.5); }
  }
`

// Watch2Gether Specific Styles
P.TransmissionBadge = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  background-color: #dc2626;
  color: white;
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 50;
  animation: ${pulse} 2s infinite;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  user-select: none;
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 576px) {
    top: 10px;
    right: 10px;
    padding: 4px 8px;
    font-size: 0.75rem;
  }
`;

P.LiveDot = styled.div`
  width: 8px;
  height: 8px;
  background-color: white;
  border-radius: 50%;
`;

P.GuestOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: calc(100% - 80px);
  background: transparent;
  z-index: 15;
  cursor: not-allowed;
`;

P.GuestMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.8);
  padding: 12px 24px;
  border-radius: 12px;
  color: #cae962;
  font-weight: 600;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
  border: 1px solid rgba(202, 233, 98, 0.3);
  backdrop-filter: blur(8px);
  
  ${P.GuestOverlay}:hover & {
    opacity: 1;
  }
`;

P.Sidebar = styled.div`
  position: absolute;
  top: 0;
  right: ${props => props.open ? '0' : '-300px'};
  width: 280px;
  height: 100%;
  background: rgba(26, 26, 28, 0.95);
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
  transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  padding: 20px;
  backdrop-filter: blur(15px);
  box-shadow: -10px 0 30px rgba(0,0,0,0.5);
`;

P.SidebarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  color: #fff;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 15px;
  
  h3 {
    margin: 0;
    font-size: 1rem;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #cae962;
  }
`;

P.ParticipantList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 5px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(202, 233, 98, 0.3);
    border-radius: 2px;
  }
`;

P.ParticipantItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.2s;
  border: 1px solid ${props => props.isSpeaking ? 'rgba(202, 233, 98, 0.5)' : 'transparent'};
  
  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
`;

P.Avatar = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${props => props.isSpeaking ? '#cae962' : 'rgba(255,255,255,0.2)'};
  transition: all 0.3s;
  ${props => props.isSpeaking && `box-shadow: 0 0 10px rgba(202, 233, 98, 0.5);`}
`;

P.ParticipantInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  
  span.name {
    color: #fff;
    font-weight: 500;
    font-size: 0.9rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  span.role {
    color: #888;
    font-size: 0.75rem;
    text-transform: capitalize;
  }
`;

P.MuteToggle = styled.button`
  background: none;
  border: none;
  color: ${props => props.muted ? '#dc2626' : '#666'};
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  transition: all 0.2s;
  
  &:hover {
    color: ${props => props.muted ? '#ef4444' : '#fff'};
    transform: scale(1.1);
  }
`;


