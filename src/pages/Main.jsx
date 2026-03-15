import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { M } from './main.style'
import zoro from '../assets/images/zoro.png'
import zorosmall from '../assets/images/zoro-small.jpeg'
import { FaSearch, FaBars, FaArrowCircleRight, FaComment } from 'react-icons/fa'
import ShareButton from '../components/ShareButton'
import { useAiring, usePopular } from '../hooks/useAnime'

const Main = () => {
  const [searchValue, setSearchValue] = useState('')
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const { data } = useAiring()

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchValue.trim().length >= 2) {
      navigate(`/busca?q=${searchValue}`)
    }
  }

  const clickHandler = () => {
    setIsOpen(!isOpen)
  }
  return (
    <>
      <M.Nav>
        <M.Ul isOpen={isOpen}>
          <M.Li>
            <Link to="/" onClick={clickHandler}>
              Home
            </Link>
          </M.Li>
          <M.Li>
            <Link to="/movies" onClick={clickHandler}>
              Movies
            </Link>
          </M.Li>
          <M.Li>
            <Link to="/tv-series" onClick={clickHandler}>
              Tv Series
            </Link>
          </M.Li>
          <M.Li>
            <Link to="/most-popular" onClick={clickHandler}>
              Most Popular
            </Link>
          </M.Li>
          <M.Li>
            <Link to="/top-airing" onClick={clickHandler}>
              Top Airing
            </Link>
          </M.Li>
        </M.Ul>
        <M.MenuOpen isOpen={isOpen} onClick={clickHandler}>
          <FaBars />
          <p>Menu</p>
        </M.MenuOpen>
      </M.Nav>
      <M.Banner>
        <M.Left>
          <M.Logo src="/logo.png" />
          <M.Wrapper as="form" onSubmit={handleSearch}>
            <M.Input
              placeholder="O que vai assistir?"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />
            <div>
              <M.Button type="submit">
                <FaSearch />
              </M.Button>
            </div>
          </M.Wrapper>

          <M.textBox>
            <M.span>Top Search:</M.span>
            {data?.data.slice(0, 10).map((item, idx) => (
              <M.Text key={idx}>
                {item.title_english === null ? item.title : item.title_english},
              </M.Text>
            ))}
          </M.textBox>
        </M.Left>
        <M.Right>
          <M.iconWrapper>
            <M.Icon src={zoro} alt="img" />
          </M.iconWrapper>
        </M.Right>
      </M.Banner>
      <M.Container>
        <M.Action to="/">
          View Full Site <FaArrowCircleRight />
        </M.Action>

        <ShareButton />
        <M.BoxWrapper>
          <M.BoxLeft>
            <h1 style={{ color: '#fff', fontSize: '28px' }}>
              Pipoca Filmes - O melhor site para assistir online de graça
            </h1>
            <p>
              Você sabia que, de acordo com o Google, o volume mensal de buscas por filmes e séries relacionados a anime ultrapassa 1 bilhão? Pipoca Filmes foi criado para ser um dos melhores sites de streaming gratuitos para todos os fãs no mundo.
            </p>
            <p>
              Projetamos o Pipoca Filmes para oferecer uma experiência premium, rápida e focada no que o usuário deseja assistir, com uma biblioteca sempre atualizada e qualidade garantida.
            </p>
          </M.BoxLeft>
          <M.BoxRight>
            <M.Card>
              <M.CardInfo>
                <div style={{ display: 'flex', gap: '1em' }}>
                  <p>#Geral</p> <p>2 horas atrás</p>
                </div>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: '.3em' }}
                >
                  <FaComment />
                  <p>44</p>
                </div>
              </M.CardInfo>
              <M.CardTitle>Pipoca Filmes é o melhor!</M.CardTitle>
              <M.CardText>
                A nova interface ficou incrível e a velocidade de carregamento está sensacional. Parabéns à equipe!
              </M.CardText>
              <M.CardProfile>
                <img
                  src={zorosmall}
                  alt=""
                  width={30}
                  height={30}
                  style={{ borderRadius: '50%' }}
                />
                <p>Pipoca</p>
              </M.CardProfile>
            </M.Card>
          </M.BoxRight>
        </M.BoxWrapper>
        <M.Footer>
          <p>©2024 Pipoca Filmes. Todos os direitos reservados.</p>
          <p>Pipoca Filmes - Assista Filmes e Séries Online Grátis</p>
        </M.Footer>
      </M.Container>
    </>
  )
}

export default Main
