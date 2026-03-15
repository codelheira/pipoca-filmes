import React from 'react'
import { useNavigate } from 'react-router-dom'
import { G } from './genre.style'

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

const GenreCard = () => {
  const navigate = useNavigate()

  const clickHandler = (e) => {
    const genreName = e.target.innerText
    const slug = CATEGORIA_SLUGS[genreName] || genreName.toLowerCase()
    navigate(`/categoria/${slug}`)
  }

  return (
    <G.Card>
      <G.List>
        <G.Item onClick={clickHandler}>Ação</G.Item>
        <G.Item onClick={clickHandler}>Animação</G.Item>
        <G.Item onClick={clickHandler}>Aventura</G.Item>
        <G.Item onClick={clickHandler}>Comédia</G.Item>
        <G.Item onClick={clickHandler}>Crime</G.Item>
        <G.Item onClick={clickHandler}>Documentário</G.Item>
        <G.Item onClick={clickHandler}>Drama</G.Item>
        <G.Item onClick={clickHandler}>Família</G.Item>
        <G.Item onClick={clickHandler}>Fantasia</G.Item>
        <G.Item onClick={clickHandler}>Faroeste</G.Item>
        <G.Item onClick={clickHandler}>Ficção Científica</G.Item>
        <G.Item onClick={clickHandler}>Guerra</G.Item>
        <G.Item onClick={clickHandler}>História</G.Item>
        <G.Item onClick={clickHandler}>Mistério</G.Item>
        <G.Item onClick={clickHandler}>Romance</G.Item>
        <G.Item onClick={clickHandler}>Terror</G.Item>
        <G.Item onClick={clickHandler}>Thriller</G.Item>
      </G.List>
    </G.Card>
  )
}

export default GenreCard
