import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import CardTwo from '../components/Card/CardTwo'
import Footer from '../components/Footer/Footer'
import GenreCard from '../components/GenreCard/GenreCard'
import { M } from '../components/MainContainer/maincontainer.style'
import MostViewedCard from '../components/MostViewedCard/MostViewedCard'
import NavBar from '../components/NavBar/NavBar'
import ShareButton from '../components/ShareButton'
import { useCategoria } from '../hooks/useAnime'
import Skeleton from '../components/Loader/Skeleton'
import styled from 'styled-components'

// Mapeamento de slugs para nomes bonitos
const CATEGORIA_NOMES = {
    'acao': 'Ação',
    'animacao': 'Animação',
    'aventura': 'Aventura',
    'comedia': 'Comédia',
    'crime': 'Crime',
    'documentario': 'Documentário',
    'drama': 'Drama',
    'familia': 'Família',
    'fantasia': 'Fantasia',
    'faroeste': 'Faroeste',
    'ficcao-cientifica': 'Ficção Científica',
    'guerra': 'Guerra',
    'historia': 'História',
    'misterio': 'Mistério',
    'romance': 'Romance',
    'terror': 'Terror',
    'thriller': 'Thriller',
}

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

const Categoria = () => {
    const { categoriaSlug } = useParams()
    const [page, setPage] = useState(1)

    const { data, isLoading, isFetched } = useCategoria(categoriaSlug, page)

    const categoriaNome = CATEGORIA_NOMES[categoriaSlug] || categoriaSlug

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
                    <M.Heading>Categoria: {categoriaNome}</M.Heading>

                    {isLoading && <Skeleton />}

                    <M.MovieList>
                        {isFetched && data?.items?.length > 0 ? (
                            data.items.map((item, idx) => <CardTwo key={idx} data={item} />)
                        ) : isFetched ? (
                            <p style={{ color: '#fff', padding: '1em' }}>Nenhum título encontrado nesta categoria.</p>
                        ) : null}
                    </M.MovieList>

                    {isFetched && data?.items?.length > 0 && (
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

                    <M.Heading>Gêneros</M.Heading>
                    <GenreCard />
                </M.Aside>
            </M.MainWrapper>
            <Footer />
        </>
    )
}

export default Categoria
