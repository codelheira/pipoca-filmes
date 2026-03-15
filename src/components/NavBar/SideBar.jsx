import React from "react"
import { BsBroadcast } from "react-icons/bs"
import { FaAngleLeft, FaComments, FaLanguage, FaRandom } from "react-icons/fa"
import { Link, useNavigate } from "react-router-dom"
import { S } from "./sidebar.style"

// Mapeamento de nomes de exibição para slugs de URL
const CATEGORIA_SLUGS = {
  'Ação': 'acao',
  'Animação': 'animacao',
  'Aventura': 'aventura',
  'Comédia': 'comedia',
  'Crime': 'crime',
  'Documentário': 'documentario',
  'Drama': 'drama',
  'Família': 'familia',
  'Fantasia': 'fantasia',
  'Faroeste': 'faroeste',
  'Ficção Científica': 'ficcao-cientifica',
  'Guerra': 'guerra',
  'História': 'historia',
  'Mistério': 'misterio',
  'Romance': 'romance',
  'Terror': 'terror',
  'Thriller': 'thriller',
}

const SideBar = ({ open, setOpen }) => {
  const navigate = useNavigate()

  const clickHandler = (e) => {
    const genreName = e.target.innerText
    const slug = CATEGORIA_SLUGS[genreName] || genreName.toLowerCase()
    setOpen(false)
    navigate(`/categoria/${slug}`)
  }

  return (
    <S.SideMenu open={open}>
      <S.CloseButton onClick={() => setOpen(false)}>
        <FaAngleLeft /> Fechar menu
      </S.CloseButton>
      <S.SettingsIcon>
        <S.SettingsItem>
          <BsBroadcast size={20} color="#cae962" />
          <p>Watch2gether</p>
        </S.SettingsItem>
        <S.SettingsItem>
          <FaRandom size={20} color="#cae962" />
          <p>Aleatório</p>
        </S.SettingsItem>
        <S.SettingsItem>
          <FaLanguage size={20} color="#cae962" />
          <p>Nome Original</p>
        </S.SettingsItem>
      </S.SettingsIcon>
      <S.DonateBtn>Doe agora</S.DonateBtn>
      <S.CommunityBtn>
        <FaComments size={14} color="#cae962" />
        Comunidade
      </S.CommunityBtn>
      <S.NavList>
        <S.Item>
          <Link to="/">Início</Link>
        </S.Item>
        <S.Item>
          <Link to="/movies">Filmes</Link>
        </S.Item>
        <S.Item>
          <Link to="/tv-series">Séries de TV</Link>
        </S.Item>
        <S.Item>
          <Link to="/most-popular">Mais populares</Link>
        </S.Item>
        <S.Item>
          <p style={{ marginBottom: "1em", fontWeight: "600", color: "#cae962" }}>Categorias</p>
          <S.GenreList>
            <S.GenreItem onClick={clickHandler}>Ação</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Animação</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Aventura</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Comédia</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Crime</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Documentário</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Drama</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Família</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Fantasia</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Faroeste</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Ficção Científica</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Guerra</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>História</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Mistério</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Romance</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Terror</S.GenreItem>
            <S.GenreItem onClick={clickHandler}>Thriller</S.GenreItem>
          </S.GenreList>
        </S.Item>
      </S.NavList>
    </S.SideMenu>
  )
}

export default SideBar
