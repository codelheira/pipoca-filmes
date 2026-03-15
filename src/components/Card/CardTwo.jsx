import React from 'react'
import { C } from './card.style'
import { Link } from 'react-router-dom'

const CardTwo = ({ data }) => {
  return (
    <Link
      to={data.type === 'serie' ? `/watch/serie/${data.slug}` : `/watch/${data.type}/${data.slug}`}
      style={{ textDecoration: 'none' }}
    >
      <C.Card>
        <C.Poster>
          {data.tag && <C.Tag>{data.tag}</C.Tag>}
          <C.Image src={data.images.jpg.image_url} />
          <C.InfoR>
            {data.score && <C.Rate>{data.score}</C.Rate>}
          </C.InfoR>
        </C.Poster>
        <C.Details>
          <C.Name>{data.title}</C.Name>
          <C.MovieInfo>
            {data.type} • {data.genre ? `${data.genre} • ` : ''} {data.year || data.duration}
          </C.MovieInfo>
        </C.Details>
      </C.Card>
    </Link>
  )
}

export default CardTwo
