import React from 'react';
import Discussion from '../components/Discussion/Discussion';
import { Helmet } from 'react-helmet-async';
import Featured from '../components/Featured/Featured';
import Footer from '../components/Footer/Footer';
import Hero from '../components/Hero/Hero';
import NavBar from '../components/NavBar/NavBar';
import Trending from '../components/Trending/Trending';
import { useHomeContent } from '../hooks/useAnime';
import HomeSkeleton from '../components/Loader/HomeSkeleton';

const Home = () => {
  const { data: homeData, isLoading } = useHomeContent();

  if (isLoading) {
    return (
      <>
        <NavBar />
        <HomeSkeleton />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Pipoca Filmes - Assista Filmes e Séries Online</title>
        <meta name="description" content="O melhor site para assistir filmes e séries online em alta definição. Watch2Gether, WebRTC Voice e muito mais." />
        <meta property="og:title" content="Pipoca Filmes - Assista Filmes e Séries Online" />
        <meta property="og:description" content="O melhor site para assistir filmes e séries online em alta definição." />
        <meta property="og:image" content="/logo.png" />
      </Helmet>
      <NavBar />
      <Hero slides={homeData?.featured} />

      <Trending
        title="Mais Assistidos"
        items={homeData?.most_watched}
      />

      <Trending
        title="Últimos Adicionados"
        items={homeData?.recently_added}
        showNumber={false}
      />

      <Featured
        releases={homeData?.releases_2026}
        series={homeData?.series}
      />

      <Discussion />
      <Footer />
    </>
  );
};

export default Home;
