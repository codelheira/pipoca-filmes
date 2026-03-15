import styled from 'styled-components'

export const D = {}

D.Container = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 4rem 0;
  background: rgba(255, 255, 255, 0.02);
  margin-top: 2em;
  
  @media screen and (max-width: 768px) {
    padding: 2.5rem 0;
    margin-top: 1em;
  }
`

D.Wrapper = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;

  @media screen and (max-width: 768px) {
    padding: 0 1rem;
  }
`

D.Header = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;

  span {
    color: #cae962;
  }
  
  @media screen and (max-width: 576px) {
    font-size: 1.4rem;
  }
`

D.ToggleDiv = styled.div`
  width: 45px;
  height: 26px;
  border-radius: 40px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.08);
`

D.Toggle = styled.div`
  height: 22px;
  width: 22px;
  border-radius: 90%;
  margin: 2px;
  background-color: ${({ show }) => (show ? '#cae962' : '#444')};
  transform: translateX(${({ show }) => (show ? '19px' : '0px')});
  transition: all .4s ease;
`

D.ToggleText = styled.p`
  font-size: 14px;
  color: ${({ show }) => (show ? '#cae962' : '#444')};
  transition: all .4s ease;
`

D.ReviewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.5rem;
  
  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  @media screen and (max-width: 400px) {
    grid-template-columns: 100%;
  }
`

D.ReviewCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 1.5rem;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(202, 233, 98, 0.2);
  }
  
  @media screen and (max-width: 768px) {
    padding: 1rem;
    border-radius: 12px;
  }
`

D.ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media screen and (max-width: 480px) {
    gap: 0.8rem;
  }
`

D.Avatar = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid rgba(202, 233, 98, 0.2);
  flex-shrink: 0;
  
  @media screen and (max-width: 480px) {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }
`

D.AuthorInfo = styled.div`
  flex: 1;
`

D.AuthorName = styled.p`
  font-weight: 700;
  font-size: 0.95rem;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  word-break: break-word;

  span {
    font-size: 0.8rem;
    color: #999;
  }
  
  @media screen and (max-width: 480px) {
    font-size: 0.85rem;
  }
`

D.ReviewDate = styled.span`
  font-size: 0.75rem;
  color: #666;
`

D.RatingBadge = styled.div`
  background: rgba(202, 233, 98, 0.15);
  color: #cae962;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
  
  @media screen and (max-width: 480px) {
    padding: 3px 8px;
    font-size: 0.6rem;
  }
`

D.ContentWrapper = styled.div`
  position: relative;
  margin-top: 0.8rem;
`

D.BlurredContent = styled.div`
  filter: ${({ isVisible }) => (isVisible ? 'none' : 'blur(6px)')};
  opacity: ${({ isVisible }) => (isVisible ? '1' : '0.4')};
  transition: all 0.4s ease;
  pointer-events: ${({ isVisible }) => (isVisible ? 'auto' : 'none')};
  font-size: 0.9rem;
  line-height: 1.6;
  color: #bbb;
  word-break: break-word;
  overflow-wrap: anywhere;
`

D.SpoilerOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: ${({ isVisible }) => (isVisible ? 'none' : 'flex')};
  justify-content: center;
  align-items: center;
  z-index: 2;
  background: rgba(15, 16, 18, 0.5);
  backdrop-filter: blur(2px);
  border-radius: 8px;
`

D.SpoilerWarning = styled.p`
  display: none;
`

D.ShowButton = styled.button`
  background: #cae962;
  color: #000;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  &:hover {
    transform: scale(1.05);
    background: #fff;
  }
`

D.ThreadLine = styled.div`
  display: none;
`

D.ReplyContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

D.ReplyCard = styled.div`
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 1rem;
  border-left: 2px solid rgba(202, 233, 98, 0.3);
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`

const textBreakStyles = `
  word-break: break-word;
  overflow-wrap: anywhere;
  word-wrap: break-word;
`

D.Quote = styled.div`
  background: rgba(202, 233, 98, 0.05);
  border-left: 2px solid rgba(202, 233, 98, 0.3);
  padding: 0.6rem;
  margin-bottom: 0.8rem;
  border-radius: 0 6px 6px 0;
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
  ${textBreakStyles}
`

D.ReplyContent = styled.div`
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.5;
  ${textBreakStyles}
`

D.InteractionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-top: 1rem;
  padding-top: 0.8rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  flex-wrap: wrap;
  
  @media screen and (max-width: 480px) {
    gap: 1rem;
  }
`

D.ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 0;

  &:hover {
    color: #cae962;
  }

  svg {
    font-size: 1rem;
  }
  
  @media screen and (max-width: 480px) {
    font-size: 0.75rem;
    gap: 4px;
    
    svg {
      font-size: 0.9rem;
    }
  }
`

export default D
