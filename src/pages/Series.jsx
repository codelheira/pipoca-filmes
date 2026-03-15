import React, { useState } from 'react'
import styled from 'styled-components'
import Card from '../components/Card/Card'
import CardTwo from '../components/Card/CardTwo'
import Footer from '../components/Footer/Footer'
import GenreCard from '../components/GenreCard/GenreCard'
import { M } from '../components/MainContainer/maincontainer.style'
import MostViewedCard from '../components/MostViewedCard/MostViewedCard'
import NavBar from '../components/NavBar/NavBar'
import ShareButton from '../components/ShareButton'
import { useSeries } from '../hooks/useAnime'
import Skeleton from '../components/Loader/Skeleton'

const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin: 2rem 0;
  padding: 1rem;
`

const PageButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, #cae962 0%, #a8c94e 100%)' : 'rgba(255,255,255,0.1)'};
  color: ${props => props.active ? '#000' : '#fff'};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover:not(:disabled) {
    background: ${props => props.active ? 'linear-gradient(135deg, #cae962 0%, #a8c94e 100%)' : 'rgba(255,255,255,0.2)'};
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const PageInfo = styled.span`
  color: #cae962;
  font-weight: 600;
  font-size: 1.1rem;
`

const Series = () => {
  const [page, setPage] = useState(1)
  const { data, isFetched, isLoading } = useSeries(page)

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNextPage = () => {
    if (data?.has_more) {
      setPage(page + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  return (
    <>
      <NavBar />
      <ShareButton borderRadius={false} />
      <M.MainWrapper>
        <M.Main>
          <M.Heading>Séries de TV</M.Heading>

          {isLoading && <Skeleton />}

          <M.MovieList>
            {isFetched &&
              data?.data?.map((item, idx) => <CardTwo key={idx} data={item} />)}
          </M.MovieList>

          {isFetched && (data?.data?.length > 0) && (
            <PaginationWrapper>
              <PageButton
                onClick={handlePrevPage}
                disabled={page === 1}
              >
                ← Anterior
              </PageButton>

              <PageInfo>Página {page}</PageInfo>

              <PageButton
                onClick={handleNextPage}
                disabled={!data?.has_more}
              >
                Próxima →
              </PageButton>
            </PaginationWrapper>
          )}
        </M.Main>
        <M.Aside>

          <M.Heading>Genres</M.Heading>
          <GenreCard />
        </M.Aside>
      </M.MainWrapper>
      <Footer />
    </>
  )
}

export default Series
