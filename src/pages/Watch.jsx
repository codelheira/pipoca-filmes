import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useMovieInfo, useMovieStream } from '../hooks/useAnime'
import NavBar from '../components/NavBar/NavBar'
import Footer from '../components/Footer/Footer'
import { W } from './watch.style'
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCompress, FaForward, FaBackward, FaStar, FaCalendar, FaClock, FaYoutube, FaTv, FaSync, FaTimes, FaCog, FaLayerGroup } from 'react-icons/fa'
import { MdPictureInPictureAlt } from 'react-icons/md'
import Skeleton from '../components/Loader/Skeleton'
import ShareButton from '../components/ShareButton'
import styled from 'styled-components'
import Hls from 'hls.js'
import axios from 'axios'
import { createPortal } from 'react-dom'
import Discussion from '../components/Discussion/Discussion'
import PipocaPlayer from '../components/Player/PipocaPlayer'
import { useTransmission } from '../context/TransmissionContext'
import { Helmet } from 'react-helmet-async'

// Feature de DLNA Discovery & Cast implementada via Backend Python

const getRatingColor = (rate) => {
  if (!rate) return '#999';
  const r = rate.toString().toLowerCase();
  if (r === 'l' || r.includes('livre')) return '#0c9463'; // Livre - Verde
  if (r === '10') return '#00a3e0'; // 10 anos - Azul
  if (r === '12') return '#ffdd00'; // 12 anos - Amarelo
  if (r === '14') return '#ff6700'; // 14 anos - Laranja
  if (r === '16') return '#ff0000'; // 16 anos - Vermelho
  if (r === '18') return '#000000'; // 18 anos - Preto
  return '#999';
}

const Watch = () => {
  const { tipo, slug } = useParams()
  const navigate = useNavigate()
  const { data: movie, isLoading, isError } = useMovieInfo(tipo, slug)
  const [playing, setPlaying] = useState(false)
  const [activePlayerUrl, setActivePlayerUrl] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)
  const { joinTransmission } = useTransmission()

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('transmission');
    if (token) {
      joinTransmission(token).then(success => {
        if (success) {
          setPlaying(true);
          setTimeout(() => {
            document.getElementById('player-area')?.scrollIntoView({ behavior: 'smooth' });
          }, 300);
        }
      });
    }
  }, []);

  // Mapeamento de nomes de gêneros para slugs de URL
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
    'Ficção científica': 'ficcao-cientifica',
    'Guerra': 'guerra',
    'História': 'historia',
    'Mistério': 'misterio',
    'Romance': 'romance',
    'Terror': 'terror',
    'Thriller': 'thriller',
    'Cinema TV': 'cinema-tv',
    'Música': 'musica',
  }

  const navigateToCategory = (genreName) => {
    const slug = CATEGORIA_SLUGS[genreName] || genreName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')
    navigate(`/categoria/${slug}`)
  }

  // Hook para buscar o link direto do vídeo SÓ QUANDO CLICAR EM PLAY
  const { data: streamData, isLoading: isLoadingStream } = useMovieStream(activePlayerUrl, playing)

  useEffect(() => {
    if (movie?.players?.length > 0 && !activePlayerUrl) {
      setActivePlayerUrl(movie.players[0].url)
    }
  }, [movie, activePlayerUrl])

  if (isLoading) return <Skeleton />
  if (isError) return (
    <div style={{ color: '#fff', padding: '100px', textAlign: 'center', backgroundColor: '#121315', minHeight: '100vh' }}>
      <h2 style={{ color: '#cae962', marginBottom: '1em' }}>Ops! Ocorreu um erro</h2>
      <p>Não foi possível carregar as informações deste título no momento.</p>
      <p style={{ marginTop: '2em', fontSize: '0.9rem', color: '#888' }}>Certifique-se de que o backend está rodando e foi reiniciado após as últimas alterações.</p>
    </div>
  )

    const pageTitle = movie ? `${movie.name} (${movie.year}) - Pipoca Filmes` : 'Pipoca Filmes';
    const pageDesc = movie?.synopsis ? movie.synopsis.substring(0, 160) + '...' : 'Assista os melhores filmes e séries no Pipoca Filmes.';
    const pageImage = movie?.poster || movie?.backdrop;

    return (
        <W.Container>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDesc} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDesc} />
                <meta property="og:image" content={pageImage} />
                <meta property="og:type" content="video.movie" />
                <meta property="og:url" content={window.location.href} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDesc} />
                <meta name="twitter:image" content={pageImage} />
            </Helmet>
            <NavBar />

      <W.Backdrop src={movie?.backdrop || movie?.poster} />

      <W.Content>
        <W.PosterWrapper>
          <W.Poster src={movie?.poster} alt={movie?.name} />
        </W.PosterWrapper>

        <W.Info>
          <W.Title>{movie?.name}</W.Title>

          <W.Meta>
            <W.Rating>
              <FaStar size={14} />
              {movie?.rating ? Number(movie.rating).toFixed(1) : 'N/A'}
            </W.Rating>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
              <FaCalendar size={14} />
              {movie?.year}
            </div>
            {movie?.details?.duração && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                <FaClock size={14} />
                {movie.details.duração}
              </div>
            )}
            <span style={{ textTransform: 'uppercase', background: '#cae962', color: '#000', padding: '0.1em 0.5em', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
              {movie?.tipo}
            </span>
            {movie?.certification && (
              <span style={{
                background: getRatingColor(movie.certification),
                color: movie.certification === '12' ? '#000' : '#fff',
                padding: '0.1em 0.5em',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 'bold',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                {movie.certification}
              </span>
            )}
          </W.Meta>

          <W.Genre>
            {movie?.genres?.map((genre, idx) => (
              <W.GenreTag
                key={idx}
                onClick={() => navigateToCategory(genre)}
                style={{ cursor: 'pointer' }}
              >
                {genre}
              </W.GenreTag>
            ))}
          </W.Genre>

          <W.SynopsisHeading>Sinopse</W.SynopsisHeading>
          <W.Synopsis>{movie?.synopsis}</W.Synopsis>

          {movie?.cast && movie.cast.length > 0 && (
            <W.CastSection>
              <W.SynopsisHeading>Elenco Principal</W.SynopsisHeading>
              <W.CastList>
                {movie.cast.map(c => (
                  <W.CastCard key={c.id}>
                    <W.CastImage
                      src={c.photo || 'https://placehold.co/100x100?text=Actor'}
                      alt={c.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://placehold.co/100x100?text=Actor'
                      }}
                    />
                    <W.CastName title={c.name}>{c.name}</W.CastName>
                    <W.CastRole title={c.character}>{c.character}</W.CastRole>
                  </W.CastCard>
                ))}
              </W.CastList>
            </W.CastSection>
          )}

          <W.ActionButtons>
            <W.PlayBtn onClick={() => {
              setPlaying(true)
              setTimeout(() => {
                document.getElementById('player-area')?.scrollIntoView({ behavior: 'smooth' })
              }, 100)
            }}>
              <FaPlay size={16} />
              Assistir Agora
            </W.PlayBtn>
            <W.TrailerBtn
              disabled={!movie?.trailer}
              style={{ opacity: !movie?.trailer ? 0.5 : 1, cursor: !movie?.trailer ? 'not-allowed' : 'pointer' }}
              onClick={() => {
                if (movie?.trailer) setShowTrailer(true)
              }}
            >
              <FaYoutube size={20} />
              Trailer
            </W.TrailerBtn>
          </W.ActionButtons>
        </W.Info>
      </W.Content>

      {playing && (
        <W.PlayerSection id="player-area">
          <div style={{ marginBottom: '2em', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <ShareButton borderRadius={true} />
          </div>

          {movie?.players?.length > 0 && (
            <W.PlayerTabs>
              {movie.players.map((p, idx) => (
                <W.PlayerTab
                  key={idx}
                  active={activePlayerUrl === p.url}
                  onClick={() => {
                    setActivePlayerUrl(p.url)
                  }}
                >
                  {p.label}
                </W.PlayerTab>
              ))}
            </W.PlayerTabs>
          )}

          <W.PlayerWrapper style={{ position: 'relative' }}>
            {isLoadingStream ? (
              <W.PlayerPlaceholder><p>Carregando stream...</p></W.PlayerPlaceholder>
            ) : streamData?.url ? (
              <PipocaPlayer 
                streamData={streamData} 
                poster={movie?.backdrop || movie?.poster} 
                slug={slug} 
                mediaTitle={movie?.name}
              />
            ) : (
              <W.PlayerPlaceholder>
                <p>Ocorreu um erro ao carregar este player. Tente outro.</p>
              </W.PlayerPlaceholder>
            )}
          </W.PlayerWrapper>
        </W.PlayerSection>
      )}

      {/* Recomendações - Fora do bloco do player para aparecer sempre */}
      {movie?.recommendations && movie.recommendations.length > 0 && (
        <W.PlayerSection style={{ marginTop: '0', paddingTop: '0' }}>
          <W.RecSection>
            <W.RecTitle>Talvez você goste</W.RecTitle>
            <W.RecGrid>
              {movie.recommendations.map((rec, idx) => (
                <W.RecCard key={idx} onClick={() => {
                  if (rec.tipo === 'serie') {
                    navigate(`/watch/serie/${rec.slug}`)
                  } else {
                    navigate(`/watch/${rec.tipo}/${rec.slug}`)
                  }
                }}>
                  <W.RecPoster
                    src={rec.poster}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://placehold.co/300x450?text=Sem+Imagem'
                    }}
                  />
                  <W.RecName>{rec.name}</W.RecName>
                  <W.RecMeta>
                    <span>{rec.ano}</span>
                    <W.RecRating>
                      <FaStar size={12} /> {rec.nota ? Number(rec.nota).toFixed(1) : 'N/A'}
                    </W.RecRating>
                  </W.RecMeta>
                </W.RecCard>
              ))}
            </W.RecGrid>
          </W.RecSection>
        </W.PlayerSection>
      )}

      {/* Sessão de Comentários TMDB */}
      <Discussion tmdbId={movie?.id_tmdb} tipo={tipo} />

      <Footer />

      {showTrailer && movie?.trailer && createPortal(
        <div style={{
          position: 'fixed',
          top: 0, left: 0,
          width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.92)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          animation: 'fadeIn 0.3s ease-out'
        }} onClick={() => setShowTrailer(false)}>
          <style>{`
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideUp { from { transform: translateY(50px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          `}</style>
          <div style={{
            position: 'relative',
            width: '90%',
            maxWidth: '1000px',
            aspectRatio: '16/9',
            backgroundColor: '#000',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 20px rgba(202, 233, 98, 0.1)',
            borderRadius: '12px',
            overflow: 'hidden',
            animation: 'slideUp 0.4s ease-out'
          }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setShowTrailer(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(0,0,0,0.5)',
                border: 'none',
                color: '#fff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                zIndex: 10,
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(202,233,98,0.8)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.5)'}
            >
              <FaTimes size={20} />
            </button>
            <iframe
              width="100%"
              height="100%"
              src={`${movie.trailer}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
              allowFullScreen
            ></iframe>
          </div>
        </div>,
        document.body
      )}

    </W.Container>
  )
}

export default Watch
