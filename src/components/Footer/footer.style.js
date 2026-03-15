import styled from 'styled-components'
import footerImg from '../../assets/images/footer.jpg'

export const F = {}

F.Footer = styled.footer`
  padding: 0px 0 0;
  position: relative;
  background: #2a2c31 url(${footerImg}) top center no-repeat;
  display: flex;
  flex-direction: column;
  gap: 2em;
  padding: 1em;
  margin-top: 10em;

  @media only screen and (max-width: 759px) {
    justify-content: center;
    align-items: center;
  }
`
F.Top = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
  width: fit-content;
  padding: 1.5em 0;
  gap: 2em;
  @media only screen and (max-width: 480px) {
    border: none;
    padding: 0.5em 0;
  }
`
F.LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75em;
  height: 40px;

  @media only screen and (max-width: 578px) {
    height: 34px;
    gap: 0.5em;
  }
  @media only screen and (max-width: 480px) {
    display: none;
  }
`
F.LogoImg = styled.img`
  width: auto;
  height: 100%;
`
F.SiteName = styled.span`
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  letter-spacing: -0.02em;
  white-space: nowrap;
  
  @media only screen and (max-width: 578px) {
    font-size: 1rem;
  }
`

F.SocialIcons = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  gap: 0.2em;
  padding-left: 2em;
  border-left: 1px solid rgba(255, 255, 255, 0.15);

  @media only screen and (max-width: 480px) {
    border: none;
  }
`
F.Item = styled.div`
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 32px;
  width: 32px;
  text-align: center;
  padding: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50px;
`


F.Links = styled.div`
  display: flex;
  gap: 2em;
`
F.LinkItem = styled.p`
  font-size: 12px;
  color: #fff;
  cursor: pointer;

  &:hover {
    color: #cae962;
  }
`
F.AboutTxt = styled.p`
  font-size: 12px;
  color: #aaa;

  @media only screen and (max-width: 480px) {
    display: none;
  }
`
F.CopyrightTxt = styled.p`
  font-size: 12px;
  color: #aaa;
`
