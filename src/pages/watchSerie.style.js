import styled from 'styled-components'
import { W as WatchStyles } from './watch.style'

export const S = { ...WatchStyles }

S.SeasonSelector = styled.div`
  margin-top: 2em;
  display: flex;
  flex-direction: column;
  gap: 1.5em;
`

S.SeasonTabs = styled.div`
  display: flex;
  gap: 1em;
  overflow-x: auto;
  padding-bottom: 1em;
  mask-image: linear-gradient(to right, black 95%, transparent 100%);
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(202, 233, 98, 0.3);
    border-radius: 2px;
  }
`

S.SeasonTab = styled.button`
  flex-shrink: 0;
  padding: 0.8em 1.5em;
  background: ${props => props.active ? 'rgba(202, 233, 98, 0.15)' : 'rgba(255, 255, 255, 0.03)'};
  color: ${props => props.active ? '#cae962' : '#888'};
  border: 1px solid ${props => props.active ? '#cae962' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(202, 233, 98, 0.1);
    color: #cae962;
    border-color: rgba(202, 233, 98, 0.5);
  }
`

S.EpisodeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5em;
  margin-top: 1em;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`

S.EpisodeCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid ${props => props.active ? '#cae962' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  position: relative;
  
  ${props => props.active && `
    box-shadow: 0 0 20px rgba(202, 233, 98, 0.2);
    transform: translateY(-5px);
  `}

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    transform: translateY(-5px);
    border-color: rgba(202, 233, 98, 0.4);
    
    .play-icon {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
    }
  }
`

S.EpisodeThumbWrapper = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  background: #1a1b1e;
`

S.EpisodeThumb = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${S.EpisodeCard}:hover & {
    transform: scale(1.05);
  }
`

S.EpisodePlayOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  width: 50px;
  height: 50px;
  background: rgba(202, 233, 98, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #121315;
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
  box-shadow: 0 0 20px rgba(0,0,0,0.4);
`

S.EpisodeInfo = styled.div`
  padding: 1em;
`

S.EpisodeNumber = styled.span`
  display: block;
  font-size: 0.75rem;
  color: #cae962;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 0.3em;
  letter-spacing: 1px;
`

S.EpisodeTitle = styled.h4`
  font-size: 1rem;
  color: #fff;
  margin: 0;
  font-weight: 600;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

S.WatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5em;
  
  h3 {
    margin: 0;
    font-size: 1.5rem;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 0.5em;
    
    &::before {
      content: '';
      width: 4px;
      height: 24px;
      background: #cae962;
      border-radius: 2px;
    }
  }
`
