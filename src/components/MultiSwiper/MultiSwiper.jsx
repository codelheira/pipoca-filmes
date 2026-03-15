import React from 'react'

import { Pagination } from 'swiper'
import { S } from './swiper.style'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import useTrendingAnime from '../../hooks/useTrendingAnime'

const MultiSwiper = ({ items, showNumber = true }) => {
  if (!items || items.length === 0) return null;

  return (
    <S.SwiperContainer>
      <S.Swiper
        slidesPerView={3}
        spaceBetween={2}
        breakpoints={{
          479: {
            spaceBetween: 15,
          },
          575: {
            spaceBetween: 15,
          },
          640: {
            slidesPerView: 3,
            spaceBetween: 15,
          },
          900: {
            slidesPerView: 4,
            spaceBetween: 15,
          },
          1300: {
            slidesPerView: 6,
            spaceBetween: 15,
          },
        }}
        modules={[Pagination]}
        navigation={{
          nextEl: '.btn-nextTwo',
          prevEl: '.btn-prevTwo',
        }}
      >
        {items.map((item, idx) => (
          <S.SwiperSlide key={idx}>
            <S.Item>
              {showNumber && (
                <S.Number>
                  <S.SpanNum>
                    {idx + 1 >= 10 ? idx + 1 : '0' + (idx + 1)}
                  </S.SpanNum>
                  <S.ItemName>{item.nome}</S.ItemName>
                </S.Number>
              )}
              <S.LinkImg
                to={item.tipo === 'serie' ? `/watch/serie/${item.slug}` : `/watch/${item.tipo}/${item.slug}`}
              >
                {item.tag && <S.Tag>{item.tag}</S.Tag>}
                <S.SwiperImg src={item.capa} alt={item.nome} />
              </S.LinkImg>
            </S.Item>
          </S.SwiperSlide>
        ))}
      </S.Swiper>
      <S.NavBtn>
        <div className="btn-nextTwo">
          <FaChevronRight />
        </div>
        <div className="btn-prevTwo">
          <FaChevronLeft />
        </div>
      </S.NavBtn>
    </S.SwiperContainer>
  )
}

export default MultiSwiper
