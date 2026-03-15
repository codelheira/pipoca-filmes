import React from 'react'
import { useSearchParams } from 'react-router-dom'
import CardTwo from '../components/Card/CardTwo'
import Footer from '../components/Footer/Footer'
import GenreCard from '../components/GenreCard/GenreCard'
import { M } from '../components/MainContainer/maincontainer.style'
import MostViewedCard from '../components/MostViewedCard/MostViewedCard'
import NavBar from '../components/NavBar/NavBar'
import ShareButton from '../components/ShareButton'
import { useFullSearch } from '../hooks/useAnime'
import Skeleton from '../components/Loader/Skeleton'

const Search = () => {
    const [searchParams] = useSearchParams()
    const query = searchParams.get('q') || ''

    const { data: results, isLoading, isFetched } = useFullSearch(query)

    return (
        <>
            <NavBar />
            <ShareButton borderRadius={false} />
            <M.MainWrapper>
                <M.Main>
                    <M.Heading>Resultados da busca para: "{query}"</M.Heading>

                    {isLoading && <Skeleton />}

                    <M.MovieList>
                        {isFetched && results && results.length > 0 ? (
                            results.map((item, idx) => <CardTwo key={idx} data={item} />)
                        ) : isFetched ? (
                            <p style={{ color: '#fff', padding: '1em' }}>Nenhum resultado encontrado para sua busca.</p>
                        ) : null}
                    </M.MovieList>
                </M.Main>
                <M.Aside>
                    <M.Heading>Mais Vistos</M.Heading>
                    <MostViewedCard />
                    <M.Heading>Gêneros</M.Heading>
                    <GenreCard />
                </M.Aside>
            </M.MainWrapper>
            <Footer />
        </>
    )
}

export default Search
