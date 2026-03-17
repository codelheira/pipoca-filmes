import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSerieDetails, useSerieSeason, useSerieEpisode, useMovieStream } from '../hooks/useAnime'
import NavBar from '../components/NavBar/NavBar'
import Footer from '../components/Footer/Footer'
import { S } from './watchSerie.style'
import { FaPlay, FaStar, FaCalendar, FaTv, FaYoutube, FaTimes } from 'react-icons/fa'
import { MdSkipNext, MdSkipPrevious } from 'react-icons/md'
import Skeleton from '../components/Loader/Skeleton'
import ShareButton from '../components/ShareButton'
import Discussion from '../components/Discussion/Discussion'
import { createPortal } from 'react-dom'
import { W } from './watch.style' 
import PipocaPlayer from '../components/Player/PipocaPlayer'
import { useTransmission } from '../context/TransmissionContext'
import { Helmet } from 'react-helmet-async'

// Reusando PipocaPlayer de Watch.jsx seria o ideal. 
// Mas para evitar problemas de importação circular ou dependência, vou definir os componentes base aqui.
// NOTA: Em um projeto real, PipocaPlayer estaria em components/Player/PipocaPlayer.jsx

import WatchPage from './Watch'
// Vou tentar pegar o PipocaPlayer do Watch.jsx se ele for exportado, 
// mas ele não é. Vou copiar a lógica do player para manter a consistência.

const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// TODO: Refatorar PipocaPlayer para um componente separado depois.
// Por enquanto, vou focar na lógica de séries.

const WatchSerie = () => {
    const { slug } = useParams()
    const navigate = useNavigate()

    const [selectedSeason, setSelectedSeason] = useState(1)
    const [selectedEpisode, setSelectedEpisode] = useState(null)
    const [playing, setPlaying] = useState(false)
    const [showTrailer, setShowTrailer] = useState(false)

    // 1. Detalhes da Série (Temporadas)
    const { data: serie, isLoading: isLoadingSerie, isError: isErrorSerie } = useSerieDetails(slug)

    // 2. Episódios da Temporada Selecionada
    const { data: seasonData, isLoading: isLoadingSeason } = useSerieSeason(slug, selectedSeason)

    // 3. Info do Episódio (Iframe URL)
    const { data: episodeData, isLoading: isLoadingEpisode } = useSerieEpisode(slug, selectedSeason, selectedEpisode)

    // 4. Stream direto (Extraído do Iframe do episódio)
    const { data: streamData, isLoading: isLoadingStream } = useMovieStream(episodeData?.player_url, playing && !!episodeData?.player_url)

    // Ao carregar a série, seleciona a primeira temporada
    useEffect(() => {
        if (serie?.temporadas?.length > 0) {
            if (!selectedSeason) setSelectedSeason(serie.temporadas[0].numero)
        }
    }, [serie])

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

    const handleEpisodeClick = (epNum) => {
        setSelectedEpisode(epNum)
        setPlaying(true)
        setTimeout(() => {
            document.getElementById('player-area')?.scrollIntoView({ behavior: 'smooth' })
        }, 100)
    }

    const handleNextEpisode = () => {
        if (!seasonData?.episodios) return
        const currentIndex = seasonData.episodios.findIndex(e => e.numero === selectedEpisode)
        if (currentIndex < seasonData.episodios.length - 1) {
            handleEpisodeClick(seasonData.episodios[currentIndex + 1].numero)
        } else {
            // Tenta ir para o primeiro episódio da próxima temporada
            const nextSeasonNum = selectedSeason + 1
            const hasNextSeason = serie?.temporadas?.some(t => t.numero === nextSeasonNum)
            if (hasNextSeason) {
                setSelectedSeason(nextSeasonNum)
                setSelectedEpisode(null) // Reset e deixa o usuário escolher ou autostart
                alert("Temporada finalizada! Selecione a T" + nextSeasonNum)
            }
        }
    }

    const getRatingColor = (rate) => {
        if (!rate) return '#999';
        const r = rate.toString().toLowerCase();
        if (r === 'l' || r.includes('livre')) return '#0c9463';
        if (r === '10') return '#00a3e0';
        if (r === '12') return '#ffdd00';
        if (r === '14') return '#ff6700';
        if (r === '16') return '#ff0000';
        if (r === '18') return '#000000';
        return '#999';
    }

    if (isLoadingSerie) return <Skeleton />
    if (isErrorSerie) return (
        <div style={{ color: '#fff', padding: '100px', textAlign: 'center', backgroundColor: '#121315', minHeight: '100vh' }}>
            <h2 style={{ color: '#cae962', marginBottom: '1em' }}>Ops! Série não encontrada</h2>
            <p>Não foi possível carregar as informações desta série.</p>
        </div>
    )

    const pageTitle = serie ? `${serie.name} (${serie.year}) - Pipoca Filmes` : 'Pipoca Filmes';
    const pageDesc = serie?.synopsis ? serie.synopsis.substring(0, 160) + '...' : 'Assista os melhores filmes e séries no Pipoca Filmes.';
    const pageImage = serie?.poster || serie?.backdrop;

    return (
        <S.Container>
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDesc} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDesc} />
                <meta property="og:image" content={pageImage} />
                <meta property="og:type" content="video.tv_show" />
                <meta property="og:url" content={window.location.href} />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDesc} />
                <meta name="twitter:image" content={pageImage} />
            </Helmet>
            <NavBar />

            <S.Backdrop src={serie?.backdrop || serie?.poster} />

            <S.Content>
                <S.PosterWrapper>
                    <S.Poster src={serie?.poster} alt={serie?.name} />
                </S.PosterWrapper>

                <S.Info>
                    <S.Title>{serie?.name}</S.Title>

                    <S.Meta>
                        <S.Rating>
                            <FaStar size={14} />
                            {serie?.rating ? Number(serie.rating).toFixed(1) : 'N/A'}
                        </S.Rating>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                            <FaCalendar size={14} />
                            {serie?.year}
                        </div>
                        <span style={{ textTransform: 'uppercase', background: '#cae962', color: '#000', padding: '0.1em 0.5em', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            SÉRIE TV
                        </span>
                        {serie?.status && (
                            <span style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', padding: '0.1em 0.5em', borderRadius: '4px', fontSize: '0.8rem' }}>
                                {serie.status === 'Ended' ? 'Encerrada' : 'Em Lançamento'}
                            </span>
                        )}
                        {serie?.certification && (
                            <span style={{
                                background: getRatingColor(serie.certification),
                                color: '#fff',
                                padding: '0.1em 0.5em',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                {serie.certification}
                            </span>
                        )}
                    </S.Meta>

                    <S.Genre>
                        {serie?.genres?.map((genre, idx) => (
                            <S.GenreTag key={idx} onClick={() => navigate(`/categoria/${genre.toLowerCase()}`)}>
                                {genre}
                            </S.GenreTag>
                        ))}
                    </S.Genre>

                    <S.SynopsisHeading>Sinopse</S.SynopsisHeading>
                    <S.Synopsis>{serie?.synopsis}</S.Synopsis>

                    <S.ActionButtons>
                        {serie?.trailer && (
                            <S.TrailerBtn onClick={() => setShowTrailer(true)}>
                                <FaYoutube size={20} /> Trailer
                            </S.TrailerBtn>
                        )}
                    </S.ActionButtons>

                    <S.SeasonSelector>
                        <S.WatchHeader>
                            <h3>Temporadas</h3>
                        </S.WatchHeader>
                        <S.SeasonTabs>
                            {serie?.temporadas?.map(temp => (
                                <S.SeasonTab
                                    key={temp.numero}
                                    active={selectedSeason === temp.numero}
                                    onClick={() => {
                                        setSelectedSeason(temp.numero)
                                        setSelectedEpisode(null)
                                    }}
                                >
                                    T{temp.numero} - {temp.titulo}
                                </S.SeasonTab>
                            ))}
                        </S.SeasonTabs>

                        <S.WatchHeader>
                            <h3>Episódios {selectedSeason ? `(T${selectedSeason})` : ''}</h3>
                        </S.WatchHeader>

                        {isLoadingSeason ? (
                            <p style={{ color: '#888' }}>Carregando episódios...</p>
                        ) : (
                            <S.EpisodeGrid>
                                {seasonData?.episodios?.map(ep => (
                                    <S.EpisodeCard
                                        key={ep.numero}
                                        active={selectedEpisode === ep.numero}
                                        onClick={() => handleEpisodeClick(ep.numero)}
                                    >
                                        <S.EpisodeThumbWrapper>
                                            <S.EpisodeThumb src={serie.backdrop || serie.poster} alt={ep.titulo} />
                                            <S.EpisodePlayOverlay className="play-icon">
                                                <FaPlay />
                                            </S.EpisodePlayOverlay>
                                        </S.EpisodeThumbWrapper>
                                        <S.EpisodeInfo>
                                            <S.EpisodeNumber>Episódio {ep.numero}</S.EpisodeNumber>
                                            <S.EpisodeTitle title={ep.titulo}>{ep.titulo}</S.EpisodeTitle>
                                        </S.EpisodeInfo>
                                    </S.EpisodeCard>
                                ))}
                            </S.EpisodeGrid>
                        )}
                    </S.SeasonSelector>
                </S.Info>
            </S.Content>

            {(playing && selectedEpisode) && (
                <S.PlayerSection id="player-area">
                    <W.PlayerSection style={{ padding: 0, margin: 0, maxWidth: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5em', flexWrap: 'wrap', gap: '10px' }}>
                            <h2 style={{ color: '#fff', fontSize: '1.4rem' }}>
                                Assistindo: <span style={{ color: '#cae962' }}>T{selectedSeason} E{selectedEpisode} - {episodeData?.titulo}</span>
                            </h2>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <ShareButton borderRadius={true} />
                            </div>
                        </div>

                        <S.PlayerWrapper style={{ position: 'relative' }}>
                            <TransmissionBadge />
                            <GuestOverlay />
                            {isLoadingEpisode || isLoadingStream ? (
                                <S.PlayerPlaceholder><p>Carregando player...</p></S.PlayerPlaceholder>
                            ) : streamData?.url ? (
                                <PipocaPlayer 
                                    streamData={streamData} 
                                    poster={serie?.backdrop || serie?.poster} 
                                    slug={`${slug}_s${selectedSeason}_e${selectedEpisode}`} 
                                    mediaTitle={`${serie?.name} - T${selectedSeason}E${selectedEpisode}`}
                                    tipo="serie"
                                />
                            ) : episodeData?.player_url ? (
                                <iframe
                                    src={episodeData.player_url}
                                    allowFullScreen
                                    title={`Player Episódio ${selectedEpisode}`}
                                />
                            ) : (
                                <S.PlayerPlaceholder><p>Erro ao carregar o vídeo. Tente novamente.</p></S.PlayerPlaceholder>
                            )}
                        </S.PlayerWrapper>
                    </W.PlayerSection>
                </S.PlayerSection>
            )}

            <Discussion tmdbId={serie?.id_tmdb} tipo="serie" />

            <Footer />

            {showTrailer && serie?.trailer && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 9999,
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    backdropFilter: 'blur(10px)'
                }} onClick={() => setShowTrailer(false)}>
                    <div style={{
                        position: 'relative', width: '90%', maxWidth: '1000px', aspectRatio: '16/9',
                        backgroundColor: '#000', borderRadius: '12px', overflow: 'hidden'
                    }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowTrailer(false)}
                            style={{
                                position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.5)',
                                border: 'none', color: '#fff', width: '40px', height: '40px', borderRadius: '50%',
                                display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', zIndex: 10
                            }}
                        >
                            <FaTimes size={20} />
                        </button>
                        <iframe
                            width="100%" height="100%"
                            src={`${serie.trailer}?autoplay=1`}
                            title="YouTube trailer"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
                            allowFullScreen
                        ></iframe>
                    </div>
                </div>,
                document.body
            )}
        </S.Container>
    )
}

export default WatchSerie
