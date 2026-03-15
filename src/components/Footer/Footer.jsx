import React from 'react'
import { F } from './footer.style'
import {
  FaBars,
  FaDiscord,
  FaRedditAlien,
  FaSearch,
  FaTelegramPlane,
  FaTwitter,
  FaRandom,
  FaLanguage,
  FaComments,
  FaBell,
} from 'react-icons/fa'


const Footer = () => {
  return (
    <F.Footer>
      <F.Top>
        <F.LogoContainer>
          <F.LogoImg src="/logo.png" alt="logo" />
          <F.SiteName>Pipoca Filmes</F.SiteName>
        </F.LogoContainer>
        <F.SocialIcons>
          <F.Item style={{ backgroundColor: '#6f85d5' }}>
            <FaDiscord />
          </F.Item>
          <F.Item style={{ backgroundColor: '#08c' }}>
            <FaTelegramPlane />
          </F.Item>
          <F.Item style={{ backgroundColor: '#ff3c1f' }}>
            <FaRedditAlien />
          </F.Item>
          <F.Item style={{ backgroundColor: '#1d9bf0' }}>
            <FaTwitter />
          </F.Item>
        </F.SocialIcons>
      </F.Top>

      <F.Links>
        <F.LinkItem>Termos de serviço</F.LinkItem>
        <F.LinkItem>DMCA</F.LinkItem>
        <F.LinkItem>Contato</F.LinkItem>
      </F.Links>
      <F.AboutTxt>
        A Pipoca Filmes não armazena arquivos em nosso servidor, apenas indexamos conteúdo hospedado em serviços de terceiros.
      </F.AboutTxt>
      <F.CopyrightTxt>© Pipoca Filmes</F.CopyrightTxt>
    </F.Footer>
  )
}

export default Footer
