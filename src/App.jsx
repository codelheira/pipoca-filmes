import React, { Suspense, lazy } from "react"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Error from "./pages/Error"
import HomeSkeleton from "./components/Loader/HomeSkeleton"
import Skeleton from "./components/Loader/Skeleton"

const Home = lazy(() => import("./pages/Home"))
const Airing = lazy(() => import("./pages/Airing"))
const Genre = lazy(() => import("./pages/Genre"))

const Movies = lazy(() => import("./pages/Movies"))
const Popular = lazy(() => import("./pages/Popular"))
const Series = lazy(() => import("./pages/Series"))
import Watch from "./pages/Watch"
const WatchSerie = lazy(() => import("./pages/WatchSerie"))
const Search = lazy(() => import("./pages/Search"))
const Categoria = lazy(() => import("./pages/Categoria"))
import ScrollToTop from "./components/ScrollToTop"

const App = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route
          path="/"
          element={
            <Suspense fallback={<HomeSkeleton />}>
              <Home />
            </Suspense>
          }
        />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route
          path="/movies"
          element={
            <Suspense fallback={<Skeleton />}>
              <Movies />
            </Suspense>
          }
        />
        <Route
          path="/tv-series"
          element={
            <Suspense fallback={<Skeleton />}>
              <Series />
            </Suspense>
          }
        />
        <Route
          path="/most-popular"
          element={
            <Suspense fallback={<Skeleton />}>
              <Popular />
            </Suspense>
          }
        />
        <Route
          path="/top-airing"
          element={
            <Suspense fallback={<Skeleton />}>
              <Airing />
            </Suspense>
          }
        />
        <Route
          path="/watch/serie/:slug"
          element={
            <Suspense fallback={<Skeleton />}>
              <WatchSerie />
            </Suspense>
          }
        />
        <Route
          path="/watch/:tipo/:slug"
          element={
            <Suspense fallback={<Skeleton />}>
              <Watch />
            </Suspense>
          }
        />
        <Route
          path="/genre/:genreName"
          element={
            <Suspense fallback={<Skeleton />}>
              <Genre />
            </Suspense>
          }
        />
        <Route
          path="/busca"
          element={
            <Suspense fallback={<Skeleton />}>
              <Search />
            </Suspense>
          }
        />
        <Route
          path="/categoria/:categoriaSlug"
          element={
            <Suspense fallback={<Skeleton />}>
              <Categoria />
            </Suspense>
          }
        />
        <Route path="/*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
