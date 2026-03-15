import styled from 'styled-components'

export const W = {}

W.Container = styled.div`
  width: 100%;
  min-height: 100vh;
  background-color: #121315;
  padding-bottom: 4em;
`

W.Backdrop = styled.div`
  position: relative;
  width: 100%;
  height: 600px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center top;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(0deg, #121315 0%, rgba(18, 19, 21, 0.6) 100%);
  }
`

W.Content = styled.div`
  max-width: 1200px;
  margin: -300px auto 0;
  position: relative;
  padding: 2em;
  display: flex;
  gap: 3em;
  
  @media screen and (max-width: 992px) {
      flex-direction: column;
      align-items: center;
      margin-top: -150px;
      text-align: center;
  }
  
  @media screen and (max-width: 576px) {
      padding: 1em;
      gap: 1.5em;
      margin-top: -100px;
  }
`

W.PosterWrapper = styled.div`
    flex-shrink: 0;
`

W.Poster = styled.img`
  width: 300px;
  height: 450px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.8);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  @media screen and (max-width: 576px) {
      width: 220px;
      height: 330px;
  }
`

W.Info = styled.div`
  color: #fff;
  flex: 1;
  min-width: 0; /* Crucial para evitar overflow em flex childs */
  
  @media screen and (max-width: 992px) {
      width: 100%;
      padding: 0 1em;
  }
  
  @media screen and (max-width: 576px) {
      padding: 0 0.5em;
  }
`

W.Title = styled.h1`
  font-size: 3.5rem;
  margin-bottom: 0.3em;
  font-weight: 800;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5);
  line-height: 1.1;
  
  @media screen and (max-width: 768px) {
      font-size: 2.2rem;
  }
  
  @media screen and (max-width: 480px) {
      font-size: 1.6rem;
  }
`

W.Meta = styled.div`
  display: flex;
  gap: 1.5em;
  margin-bottom: 1.5em;
  font-size: 1.1rem;
  color: #cae962;
  align-items: center;
  flex-wrap: wrap;
  
  @media screen and (max-width: 992px) {
      justify-content: center;
  }
  
  @media screen and (max-width: 480px) {
      font-size: 0.9rem;
      gap: 0.8em;
  }
`

W.Rating = styled.div`
    display: flex;
    align-items: center;
    gap: 0.3em;
    background: rgba(202, 233, 98, 0.2);
    padding: 0.2em 0.6em;
    border-radius: 6px;
    font-weight: 600;
`

W.Genre = styled.div`
  display: flex;
  gap: 0.5em;
  flex-wrap: wrap;
  margin-bottom: 2em;
  
  @media screen and (max-width: 992px) {
      justify-content: center;
  }
`

W.GenreTag = styled.span`
  padding: 0.4em 1.2em;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  font-size: 0.85rem;
  color: #ddd;
  transition: all 0.3s;
  
  &:hover {
      background: rgba(202, 233, 98, 0.2);
      color: #cae962;
      border-color: #cae962;
  }
`

W.SynopsisHeading = styled.h3`
    color: #fff;
    font-size: 1.2rem;
    margin-bottom: 0.8em;
    text-transform: uppercase;
    letter-spacing: 1px;
    
    @media screen and (max-width: 992px) {
        text-align: left;
    }
    
    @media screen and (max-width: 576px) {
        font-size: 1rem;
    }
`

W.Synopsis = styled.p`
  line-height: 1.8;
  font-size: 1.1rem;
  color: #bbb;
  margin-bottom: 2.5em;
  max-width: 900px;
  
  @media screen and (max-width: 992px) {
      text-align: left;
  }
  
  @media screen and (max-width: 768px) {
      font-size: 0.95rem;
      line-height: 1.6;
  }
`

W.ActionButtons = styled.div`
  display: flex;
  gap: 1em;
  flex-wrap: wrap;
  
  @media screen and (max-width: 992px) {
      justify-content: center;
  }
  
  @media screen and (max-width: 480px) {
      width: 100%;
      flex-direction: column;
  }
`

W.PlayBtn = styled.button`
  padding: 1.2em 2.5em;
  background: #cae962;
  color: #121315;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8em;
  transition: all 0.3s;
  box-shadow: 0 4px 15px rgba(202, 233, 98, 0.3);
  
  &:hover {
      background: #d4f27a;
      transform: translateY(-3px);
      box-shadow: 0 8px 25px rgba(202, 233, 98, 0.4);
  }
  
  @media screen and (max-width: 480px) {
      width: 100%;
      padding: 1em;
      font-size: 1rem;
  }
`

W.TrailerBtn = styled.button`
  padding: 1.2em 2em;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8em;
  transition: all 0.3s;
  
  &:hover {
      background: rgba(255, 255, 255, 0.2);
  }
  
  @media screen and (max-width: 480px) {
      width: 100%;
      padding: 1em;
      font-size: 1rem;
  }
`

W.PlayerSection = styled.section`
    max-width: 1400px;
    margin: 4em auto 0;
    padding: 0 2em;
    
    @media (max-width: 768px) {
        padding: 0;
    }
`

W.PlayerTabs = styled.div`
    display: flex;
    gap: 1em;
    margin-bottom: 1.5em;
    flex-wrap: wrap;
`

W.PlayerTab = styled.button`
    padding: 0.8em 1.5em;
    background: ${props => props.active ? '#cae962' : 'rgba(255,255,255,0.05)'};
    color: ${props => props.active ? '#121315' : '#fff'};
    border: 1px solid ${props => props.active ? '#cae962' : 'rgba(255,255,255,0.1)'};
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
        background: ${props => props.active ? '#d4f27a' : 'rgba(255,255,255,0.1)'};
    }
`

W.PlayerWrapper = styled.div`
    width: 100%;
    aspect-ratio: 16 / 9;
    position: relative;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 30px 60px rgba(0,0,0,0.6);
    border: 1px solid rgba(255, 255, 255, 0.05);

    /* O componente interno deve preencher o wrapper */
    & > * {
        width: 100%;
        height: 100%;
    }

    /* Proteção contra download nativo */
    video::-internal-media-controls-download-button {
        display:none !important;
    }
    video::-webkit-media-controls-enclosure {
        overflow:hidden !important;
    }
    video::-webkit-media-controls-panel {
        width: calc(100% + 30px) !important;
    }

    iframe {
        width: 100%;
        height: 100%;
        border: none;
    }
`

W.PlayerPlaceholder = styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #fff;
    background: radial-gradient(circle, #23252a 0%, #121315 100%);
    
    svg {
        font-size: 5rem;
        color: #cae962;
        margin-bottom: 0.5em;
        opacity: 0.8;
    }
    
    p {
        font-size: 1.2rem;
        opacity: 0.7;
    }
`
W.DLNAPicker = styled.div`
    position: absolute;
    bottom: 110px;
    right: 20px;
    width: 280px;
    background: #1a1b1e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    z-index: 100;
    box-shadow: 0 10px 30px rgba(0,0,0,0.8);
    padding: 1em;
    color: #fff;
    animation: fadeIn 0.3s ease;

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`

W.DLNAHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1em;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    padding-bottom: 0.5em;

    h4 {
        margin: 0;
        font-size: 0.9rem;
        color: #cae962;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    button {
        background: none;
        border: none;
        color: #888;
        cursor: pointer;
        padding: 4px;
        &:hover { color: #fff; }
    }
`

W.DLNAList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5em;
    max-height: 200px;
    overflow-y: auto;

    &::-webkit-scrollbar {
        width: 4px;
    }
    &::-webkit-scrollbar-thumb {
        background: #333;
        border-radius: 2px;
    }
`

W.DLNAItem = styled.div`
    padding: 0.8em;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 1em;
    border: 1px solid transparent;

    &:hover {
        background: rgba(202, 233, 98, 0.1);
        border-color: rgba(202, 233, 98, 0.3);
    }

    svg {
        color: #cae962;
        font-size: 1.2rem;
    }

    div {
        display: flex;
        flex-direction: column;
        
        span:first-child {
            font-size: 0.9rem;
            font-weight: 600;
        }
        span:last-child {
            font-size: 0.7rem;
            color: #888;
        }
    }
`

W.DLNAScanning = styled.div`
    padding: 2em 0;
    text-align: center;
    color: #888;
    font-size: 0.9rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;

    .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid #cae962;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`
W.PlayerMenu = styled.div`
    position: absolute;
    bottom: 50px;
    right: 15px;
    background: #1a1b1e;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    z-index: 150;
    box-shadow: 0 5px 20px rgba(0,0,0,0.6);
    overflow: hidden;
    min-width: 180px;
    animation: fadeIn 0.2s ease;
`

W.MenuItem = styled.div`
    padding: 10px 15px;
    display: flex;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.9rem;
    color: #eee;

    &:hover {
        background: rgba(202, 233, 98, 0.1);
        color: #cae962;
    }

    svg {
        font-size: 1rem;
    }
`

W.RecSection = styled.div`
  margin-top: 4em;
  padding-top: 2em;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  
  @media screen and (max-width: 768px) {
    margin-top: 2em;
    padding-top: 1.5em;
  }
`

W.RecTitle = styled.h3`
  font-size: 1.5rem;
  color: #cae962;
  margin-bottom: 1.5em;
  display: flex;
  align-items: center;
  gap: 0.5em;
  
  &::before {
    content: '';
    display: block;
    width: 4px;
    height: 24px;
    background: #cae962;
    border-radius: 2px;
  }
  
  @media screen and (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 1em;
    
    &::before {
      height: 18px;
      width: 3px;
    }
  }
`

W.RecGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 1.5em;
  
  @media screen and (max-width: 576px) {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1em;
  }
`

W.RecCard = styled.div`
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    transform: translateY(-5px);
    
    img {
      box-shadow: 0 10px 20px rgba(0,0,0,0.5);
      border-color: #cae962;
    }
    
    h4 {
      color: #cae962;
    }
  }
`

W.RecPoster = styled.img`
  width: 100%;
  aspect-ratio: 2/3;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.8em;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s;
  background: #1a1b1e;
`

W.RecName = styled.h4`
  font-size: 0.95rem;
  color: #ddd;
  margin: 0;
  font-weight: 500;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s;
`

W.RecMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5em;
  font-size: 0.8rem;
  color: #888;
`

W.RecRating = styled.span`
  color: #cae962;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 0.3em;
  
  svg {
    font-size: 0.8rem;
    margin-bottom: 1px;
  }
`

W.CastSection = styled.div`
  margin-bottom: 2em;
`

W.CastList = styled.div`
  display: flex;
  gap: 1em;
  overflow-x: auto;
  padding: 0.5em 0 1.5em 0;
  width: 100%;
  mask-image: linear-gradient(to right, black 90%, transparent 100%);
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.02);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.15);
    border-radius: 3px;
    transition: background 0.3s;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #cae962;
  }
`

W.CastCard = styled.div`
  flex-shrink: 0;
  width: 100px;
  text-align: center;
  user-select: none;
`

W.CastImage = styled.img`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255,255,255,0.1);
  margin: 0 auto 0.5em; /* Centraliza a imagem no card */
  display: block;
  transition: all 0.3s;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  
  ${W.CastCard}:hover & {
    border-color: #cae962;
    transform: scale(1.1);
    box-shadow: 0 5px 20px rgba(202, 233, 98, 0.3);
  }
`

W.CastName = styled.p`
  color: #eee;
  font-size: 0.8rem;
  font-weight: 600;
  margin: 0 0 0.2em 0;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 5px;
`

W.CastRole = styled.p`
  color: #888;
  font-size: 0.7rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 5px;
`

// --- Custom Player Styles ---
W.PlayerContainer = styled.div`
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

W.Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: contain;
`

W.PlayerControls = styled.div`
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

W.ControlRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

W.ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`

W.ControlBtn = styled.button`
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

W.ProgressBarContainer = styled.div`
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

W.ProgressBarFill = styled.div`
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

  ${W.ProgressBarContainer}:hover &::after {
    opacity: 1;
  }
`

W.TimeDisplay = styled.span`
  color: #fff;
  font-size: 0.85rem;
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  min-width: 100px;
`

W.VolumeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100px;
  
  &:hover input {
    width: 80px;
    opacity: 1;
  }
`

W.VolumeSlider = styled.input`
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
`

W.PlayerLogo = styled.img`
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

W.BigPlayBtn = styled.div`
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

W.QualityBadge = styled.div`
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

  &:hover {
    background: #cae962;
    color: #000;
    box-shadow: 0 0 15px rgba(202, 233, 98, 0.3);
  }

  @media (max-width: 576px) {
    display: none;
  }
`
