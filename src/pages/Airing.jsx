import React from 'react'
import CardTwo from '../components/Card/CardTwo'
import Footer from '../components/Footer/Footer'
import GenreCard from '../components/GenreCard/GenreCard'
import { M } from '../components/MainContainer/maincontainer.style'
import MostViewedCard from '../components/MostViewedCard/MostViewedCard'
import NavBar from '../components/NavBar/NavBar'
import ShareButton from '../components/ShareButton'
import { useAiring } from '../hooks/useAnime'
import Skeleton from '../components/Loader/Skeleton'

const Airing = () => {
  const { data, isFetched, isLoading } = useAiring()

  if (isLoading) {
    return (
      <>
        <NavBar />
        <Skeleton />
        <Footer />
      </>
    )
  }

  return (
    <>
      <NavBar />
      <ShareButton borderRadius={false} />
      <M.MainWrapper>
        <M.Main>
          <M.Heading>Em Exibição</M.Heading>
          <M.MovieList>
            {isFetched &&
              data?.data?.map((item, idx) => <CardTwo key={idx} data={item} />)}
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

export default Airing
