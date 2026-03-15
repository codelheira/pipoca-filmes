import { Link } from 'react-router-dom'
import { F } from './featured.style'

const CardItem = ({ data }) => {
  return (
    <F.CardItem>
      <Link
        to={data.tipo === 'serie' ? `/watch/serie/${data.slug}` : `/watch/${data.tipo}/${data.slug}`}
        style={{ display: 'flex', width: '100%', textDecoration: 'none', alignItems: 'center' }}
      >
        <F.PosterDiv>
          {data.tag && <F.Tag>{data.tag}</F.Tag>}
          <F.Img src={data.capa} alt={data.nome} />
        </F.PosterDiv>
        <F.DetailsWrapper>
          <F.Name>
            {data.nome}
          </F.Name>
          <F.Details>
            {data.tipo === 'filme' ? 'Filme' : 'Série'} • {data.ano}
          </F.Details>
        </F.DetailsWrapper>
      </Link>
    </F.CardItem>
  )
}

export default CardItem
