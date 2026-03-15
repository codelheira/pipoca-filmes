import React from "react";
import {
  FaCalendar,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaPlayCircle,
} from "react-icons/fa";
import SwiperCore, {
  Navigation,
  Pagination,
  Scrollbar,
  A11y,
  Autoplay,
} from "swiper";
import "swiper/swiper-bundle.css";
import { H } from "./hero.style";
SwiperCore.use([Navigation, Pagination, Scrollbar, A11y, Autoplay]);
import useTrendingAnime from "../../hooks/useTrendingAnime";
import { format } from "date-fns";

const Hero = ({ slides }) => {
  if (!slides || slides.length === 0) return null;

  return (
    <H.Swiper
      slidesPerView={1}
      pagination={{
        clickable: true,
      }}
      direction="horizontal"
      loop={true}
      autoplay={{ delay: 5000 }}
      modules={[Pagination, Autoplay]}
      className="swiper"
      navigation={{
        nextEl: ".btn-next",
        prevEl: ".btn-prev",
      }}
    >
      {slides.map((item, idx) => (
        <H.Slides key={idx}>
          <H.ImgContainer>
            <H.Img src={item.backdrop || item.capa} alt={item.nome} />
          </H.ImgContainer>
          <H.Content>
            <H.Rank>
              <p>Destaque #{idx + 1}</p>
            </H.Rank>
            <H.Title>{item.nome}</H.Title>
            <H.Icons>
              <H.Icon>
                <FaPlayCircle size={12} />
                {item.tipo === 'filme' ? 'Filme' : 'Série'}
              </H.Icon>
              {item.ano && (
                <H.Icon>
                  <FaCalendar size={12} />
                  {item.ano}
                </H.Icon>
              )}
              <H.IconSpan>HD</H.IconSpan>
              {item.nota && (
                <H.IconSpan style={{ background: '#cae962', color: '#000', fontWeight: 'bold' }}>
                  {item.nota}
                </H.IconSpan>
              )}
            </H.Icons>
            <H.Description>{item.sinopse || item.info}</H.Description>
            <H.WatchBtn>
              <H.WatchLink to={item.tipo === 'serie' ? `/watch/serie/${item.slug}` : `/watch/${item.tipo}/${item.slug}`}>
                <FaPlayCircle />
                Assistir Agora
              </H.WatchLink>
              {/* Detalhes link removed as Watch link serves both purposes often or add separate route */}
            </H.WatchBtn>
          </H.Content>
        </H.Slides>
      ))}
      <div className="btn-prev">
        <FaChevronLeft />
      </div>
      <div className="btn-next">
        <FaChevronRight />
      </div>
    </H.Swiper>
  );
};

export default Hero;
