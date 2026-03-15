import styled from 'styled-components'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Link } from 'react-router-dom'

export const S = {}
S.SwiperContainer = styled.div`
  padding-right: 60px;
  padding-left: 0;
  position: relative;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  z-index: 1;

  @media screen and (max-width: 759px) {
    padding-right: 0;
  }
`

S.Swiper = styled(Swiper)`
  width: 100%;
  height: 100%;
`

S.SwiperSlide = styled(SwiperSlide)`
  text-align: center;
  font-size: 18px;

  /* Center slide text vertically */
  display: -webkit-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-box-pack: center;
  -ms-flex-pack: center;
  -webkit-justify-content: center;
  justify-content: center;
  -webkit-box-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
`

S.Item = styled.div`
  width: 100%;
  height: auto;
  padding-bottom: 115%;
  position: relative;
  display: inline-block;
  overflow: hidden;

  @media screen and (max-width: 575px) {
    padding-bottom: 150%;
  }
`
S.Number = styled.div`
  position: absolute;
  left: -10px;
  bottom: -8px;
  width: auto;
  height: auto;
  z-index: 5;
  background: none;
  pointer-events: none;

  @media screen and (max-width: 575px) {
    left: -5px;
    bottom: -5px;
    width: auto;
    height: auto;
    background: none;
  }
`
S.SpanNum = styled.span`
  position: relative;
  font-size: 6rem;
  font-weight: 900;
  line-height: 1;
  color: #2a2c31;
  -webkit-text-stroke: 2px #cae962;
  text-shadow: 2px 2px 0px #000;
  z-index: 9;
  font-family: 'Montserrat', sans-serif;
  letter-spacing: -4px;

  @media screen and (max-width: 575px) {
    font-size: 4rem;
    letter-spacing: -2px;
    color: #2a2c31;
  }
`
S.ItemName = styled.div`
  display: none;
`

S.LinkImg = styled(Link)`
  display: inline-block;
  background: #2a2c31;
  position: absolute;
  width: 100%;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  padding-bottom: 0;
  height: auto;
  margin-bottom: 0;

  @media screen and (max-width: 575px) {
    left: 0;
    top: 0;
    bottom: 0;
  }
`

S.SwiperImg = styled.img`
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
`

S.NavBtn = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 40px;

  @media screen and (max-width: 759px) {
    display: none;
  }
`

S.Tag = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  background: linear-gradient(90deg, #ff4b1f 0%, #ff9068 100%);
  color: white;
  padding: 4px 8px;
  font-size: 10px;
  font-weight: bold;
  border-bottom-right-radius: 8px;
  z-index: 10;
  box-shadow: 2px 2px 5px rgba(0,0,0,0.3);
`;
