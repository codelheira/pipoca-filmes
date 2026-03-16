import React from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
const API_URL = import.meta.env.VITE_API_BASE_URL || `http://${window.location.hostname}:8000/api`;

export function useLatestEpisode() {
  const TopAiringAnime = async () => {
    const { data } = await axios.get('https://api.jikan.moe/v4/watch/episodes')
    const filteredData = data.data.filter(
      (item) => item.region_locked === false
    )
    return filteredData
  }
  return useQuery(['episodes'], () => TopAiringAnime())
}
export function useSeries(page = 1) {
  const fetchSeries = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/series/all?page=${page}`)

      // Transforma os items para o formato esperado pelo CardTwo
      const transformedItems = (data.items || []).map(item => ({
        title: item.nome,
        title_english: item.nome,
        images: {
          jpg: {
            image_url: item.capa,
          }
        },
        aired: {
          from: item.ano ? `${item.ano}-01-01` : null
        },
        type: item.tipo,
        duration: item.info || "",
        slug: item.slug,
        score: item.nota,
        tag: item.tag
      }))

      return {
        data: transformedItems,
        has_more: data.has_more,
        pagination: {
          has_next_page: data.has_more
        }
      }
    } catch (error) {
      console.error("Erro ao buscar series:", error)
      throw error
    }
  }
  return useQuery(['series', page], () => fetchSeries(), {
    retry: false,
    staleTime: 1000 * 60 * 15, // 15 minutos de cache
    keepPreviousData: true
  })
}
export function useFilmes(page = 1) {
  const fetchFilmes = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/filmes/all?page=${page}`)

      // Transforma os items para o formato esperado pelo CardTwo
      const transformedItems = (data.items || []).map(item => ({
        title: item.nome,
        title_english: item.nome,
        images: {
          jpg: {
            image_url: item.capa,
          }
        },
        aired: {
          from: item.ano ? `${item.ano}-01-01` : null
        },
        type: item.tipo,
        duration: item.info || "",
        slug: item.slug,
        score: item.nota,
        tag: item.tag
      }))

      return {
        data: transformedItems,
        has_more: data.has_more,
        pagination: {
          has_next_page: data.has_more
        }
      }
    } catch (error) {
      console.error("Erro ao buscar filmes:", error)
      throw error
    }
  }
  return useQuery(['filmes', page], () => fetchFilmes(), {
    retry: false,
    staleTime: 1000 * 60 * 15, // 15 minutos de cache
    keepPreviousData: true
  })
}
export function usePopular() {
  const fetchMostPopular = async () => {
    const { data } = await axios.get(
      'https://api.jikan.moe/v4/top/anime?type=tv&filter=bypopularity'
    )
    return data
  }
  return useQuery(['popular'], () => fetchMostPopular())
}
export function useAiring() {
  const fetchTopAiring = async () => {
    const { data } = await axios.get(
      'https://api.jikan.moe/v4/top/anime?type=tv&filter=airing'
    )
    return data
  }
  return useQuery(['airing'], () => fetchTopAiring())
}

export function useMovies() {
  const fetchMovies = async () => {
    const { data } = await axios.get(
      'https://api.jikan.moe/v4/top/anime?type=movie'
    )
    return data
  }
  return useQuery(['movies'], () => fetchMovies())
}
export function useGenre({ genre }) {
  const fetchGenre = async () => {
    const { data } = await axios.get('https://api.jikan.moe/v4/anime')
    const filteredData = data.data.filter((item) => {
      if (item) {
        return (
          item?.genres[0]?.name.toLowerCase() === genre ||
          item?.genres[1]?.name.toLowerCase() === genre ||
          item?.genres[2]?.name.toLowerCase() === genre ||
          item?.genres[3]?.name.toLowerCase() === genre ||
          item?.genres[4]?.name.toLowerCase() === genre
        )
      }
    })
    return filteredData
  }
  return useQuery(['genres', genre], () => fetchGenre())
}

export const useSearchAnime = (filter) => {
  const fetchData = async () => {
    try {
      // Usando o nosso novo backend proxy em Python
      const { data } = await axios.get(`${API_URL}/search/${filter}`)

      // Mapeando os dados do assistir.app para o formato esperado pelo frontend
      // Como a API externa não parece retornar imagens, usamos um placeholder ou deixamos vazio
      return data.map(item => ({
        title: item.nome,
        title_english: item.nome,
        images: {
          jpg: {
            image_url: item.capa,
          }
        },
        year: item.ano,
        aired: {
          from: null
        },
        type: item.tipo,
        genre: item.genero,
        slug: item.slug,
        tag: item.tag
      }))
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error)
      return []
    }
  }
  return {
    ...useQuery(['searchAnime', filter], () => {
      if (filter && filter.length >= 3) {
        return fetchData()
      }
      return []
    }, {
      enabled: !!(filter && filter.length >= 3),
      keepPreviousData: true
    }),
  }
}
export const useFullSearch = (filter) => {
  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/busca/${filter}`)

      return data.map(item => ({
        title: item.nome,
        title_english: item.nome,
        images: {
          jpg: {
            image_url: item.capa,
          }
        },
        year: item.ano,
        aired: {
          from: item.ano ? `${item.ano}-01-01` : null
        },
        type: item.tipo,
        genre: item.genero,
        duration: item.info || "",
        episodes: "?", // Não temos info de episódios fácil aqui
        slug: item.slug,
        score: item.nota,
        tag: item.tag
      }))
    } catch (error) {
      console.error("Erro ao realizar busca completa:", error)
      return []
    }
  }
  return {
    ...useQuery(['fullSearch', filter], () => {
      if (filter && filter.length >= 2) {
        return fetchData()
      }
      return []
    }, {
      enabled: !!(filter && filter.length >= 2),
      keepPreviousData: true
    }),
  }
}

export const useMovieInfo = (tipo, slug) => {
  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/info/${tipo}/${slug}`)
      return data
    } catch (error) {
      console.error("Erro ao buscar informações do filme:", error)
      throw error
    }
  }
  return useQuery(['movieInfo', tipo, slug], () => fetchData(), {
    enabled: !!(tipo && slug),
    retry: false,
    staleTime: 1000 * 60 * 30, // 30 minutos de cache estável
    keepPreviousData: true
  })
}
export const useMovieStream = (url, enabled = true) => {
  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/stream?url=${encodeURIComponent(url)}`)
      return data
    } catch (error) {
      console.error("Erro ao buscar stream:", error)
      throw error
    }
  }
  // Adicionado 'v2' na chave para invalidar cache anterior com URL sem proxy
  return useQuery(['movieStream', url, 'v2'], () => fetchData(), {
    enabled: !!url && enabled, // Só busca se tiver URL E se estiver habilitado (play clicado)
    retry: false,
    staleTime: 1000 * 60 * 10, // 10 minutos para o link do stream
    keepPreviousData: true
  })
}

export const useCategoria = (categoria, page = 1) => {
  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/categoria/${categoria}?page=${page}`)

      // Transforma os items para o formato esperado pelo CardTwo
      const transformedItems = (data.items || []).map(item => ({
        title: item.nome,
        title_english: item.nome,
        images: {
          jpg: {
            image_url: item.capa,
          }
        },
        aired: {
          from: item.ano ? `${item.ano}-01-01` : null
        },
        type: item.tipo,
        duration: item.info || "",
        slug: item.slug,
        score: item.nota,
        tag: item.tag
      }))

      return {
        ...data,
        items: transformedItems
      }
    } catch (error) {
      console.error("Erro ao buscar categoria:", error)
      throw error
    }
  }
  return useQuery(['categoria', categoria, page], () => fetchData(), {
    enabled: !!categoria,
    retry: false,
    staleTime: 1000 * 60 * 15, // 15 minutos de cache
    refetchOnWindowFocus: false
  })
}

export const useHomeContent = () => {
  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/home`)
      return data
    } catch (error) {
      console.error("Erro ao buscar home:", error)
      throw error
    }
  }
  return useQuery(['homeContent'], () => fetchData(), {
    retry: false,
    staleTime: 1000 * 60 * 15, // 15 minutos de cache
    keepPreviousData: true
  })
}


export const useSerieDetails = (slug) => {
  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/serie/${slug}`)
      return data
    } catch (error) {
      console.error("Erro ao buscar detalhes da série:", error)
      throw error
    }
  }
  return useQuery(['serieDetails', slug], () => fetchData(), {
    enabled: !!slug,
    retry: false,
    staleTime: 1000 * 60 * 30, // 30 minutos de cache
    refetchOnWindowFocus: false
  })
}

export const useSerieSeason = (slug, seasonNum) => {
  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/serie/${slug}/temporada/${seasonNum}`)
      return data
    } catch (error) {
      console.error("Erro ao buscar temporada da série:", error)
      throw error
    }
  }
  return useQuery(['serieSeason', slug, seasonNum], () => fetchData(), {
    enabled: !!(slug && seasonNum),
    retry: false,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false
  })
}

export const useSerieEpisode = (slug, seasonNum, episodeNum) => {
  const fetchData = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/serie/${slug}/temporada/${seasonNum}/episodio/${episodeNum}`)
      return data
    } catch (error) {
      console.error("Erro ao buscar episódio da série:", error)
      throw error
    }
  }
  return useQuery(['serieEpisode', slug, seasonNum, episodeNum], () => fetchData(), {
    enabled: !!(slug && seasonNum && episodeNum),
    retry: false,
    staleTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
    keepPreviousData: true
  })
}
