import React from 'react';
import Discussion from '../components/Discussion/Discussion';
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
