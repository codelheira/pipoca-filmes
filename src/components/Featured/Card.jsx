import React from 'react'
import { F } from './featured.style'
import { FaChevronRight } from 'react-icons/fa'
import CardItem from './CardItem'

const Card = ({ name, data, link }) => {
  return (
    <F.Card>
      <F.CardBox>
        <F.CardTitle> {name}</F.CardTitle>
        <F.CardList>
          {data.map((item, idx) => (
            <CardItem key={idx} data={item} />
          ))}
        </F.CardList>
        <F.MoreLink to={link}>
          Ver mais <FaChevronRight />
        </F.MoreLink>
      </F.CardBox>
    </F.Card>
  )
}

export default Card
