import React from 'react'
import { M } from '../../pages/main.style'
import MultiSwiper from '../MultiSwiper/MultiSwiper'
import { T } from './trending.style'


const Trending = ({ title = "Em Alta", items, showNumber = true }) => {
  if (!items || items.length === 0) return null;
  return (
    <>
      <T.Container>
        <T.HeadingWrapper>
          <T.Heading>{title}</T.Heading>
        </T.HeadingWrapper>
        <MultiSwiper items={items} showNumber={showNumber} />
      </T.Container>

    </>
  )
}

export default Trending
